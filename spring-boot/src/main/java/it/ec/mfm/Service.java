package it.ec.mfm;

import it.ec.mfm.dto.FileSearchRes;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.math.BigInteger;
import java.net.MalformedURLException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Comparator;
import java.util.Date;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.stream.Stream;

@org.springframework.stereotype.Service
public class Service {

    private final Path rootPath;

    public Service(@Value("${mfm.root.path}") String configuredRootPath) {
        try {
            Path configuredPath = Path.of(configuredRootPath).toAbsolutePath().normalize();
            Files.createDirectories(configuredPath);
            this.rootPath = configuredPath.toRealPath();
        } catch (IOException e) {
            throw new IllegalStateException("Impossibile inizializzare la directory root", e);
        }
    }

    public List<File> ls(String path) throws IOException {
        Path directory = resolvePath(path);
        if (!Files.isDirectory(directory)) {
            throw new IllegalArgumentException("Il path non è una directory: " + path);
        }

        try (Stream<Path> stream = Files.list(directory)) {
            return stream
                    .filter(this::isInsideRoot)
                    .map(this::mapFile)
                    .toList();
        }
    }

    public void mkdir(String dirName) {
        Path path = resolveChildPath(dirName);
        if (Files.exists(path, LinkOption.NOFOLLOW_LINKS)) {
            throw new IllegalArgumentException("La cartella esiste già");
        }

        try {
            Files.createDirectories(path);
        } catch (IOException e) {
            throw new RuntimeException("Errore nella creazione della cartella", e);
        }
    }

    public void mv(String source, String target) {
        Path sourcePath = resolveChildPath(source);
        Path targetPath = resolveChildPath(target);
        requireExisting(sourcePath);
        requireMissing(targetPath);

        try {
            Files.move(sourcePath, targetPath);
        } catch (IOException e) {
            throw new RuntimeException("Errore nel rinominare/spostare", e);
        }
    }

    public void cp(String source, String target) {
        Path sourcePath = resolveChildPath(source);
        Path targetPath = resolveChildPath(target);
        requireExisting(sourcePath);
        requireMissing(targetPath);

        try {
            recursiveCopy(sourcePath, targetPath);
        } catch (IOException e) {
            throw new RuntimeException("Errore nella copia", e);
        }
    }

    public void rm(String[] targetPaths) {
        if (targetPaths == null || targetPaths.length == 0) {
            return;
        }

        try {
            for (String targetPath : targetPaths) {
                Path target = resolveChildPath(targetPath);
                requireExisting(target);
                try (Stream<Path> paths = Files.walk(target)) {
                    for (Path path : paths.sorted(Comparator.reverseOrder()).toList()) {
                        Files.delete(path);
                    }
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Errore durante l'eliminazione", e);
        }
    }

    public List<FileSearchRes> locate(String source, String str) {
        Path sourcePath = resolvePath(source);
        if (!Files.isDirectory(sourcePath)) {
            throw new IllegalArgumentException("Il path di ricerca non è una directory: " + source);
        }
        if (str == null || str.isBlank()) {
            throw new IllegalArgumentException("Nessun testo fornito per la ricerca");
        }

        String normalizedSearch = str.toLowerCase(Locale.ROOT);
        try (Stream<Path> paths = Files.walk(sourcePath)) {
            return paths
                    .skip(1)
                    .filter(this::isInsideRoot)
                    .filter(path -> path.getFileName().toString().toLowerCase(Locale.ROOT).contains(normalizedSearch))
                    .map(this::mapSearchResult)
                    .toList();
        } catch (IOException e) {
            throw new RuntimeException("Errore nella ricerca", e);
        }
    }

    public ResponseEntity<?> cat(String filePath) {
        Path source = resolveChildPath(filePath);
        if (!Files.isRegularFile(source)) {
            throw new IllegalArgumentException("Il path non è un file: " + filePath);
        }

        Resource resource;
        try {
            resource = new UrlResource(source.toUri());
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }

        String contentType;
        try {
            contentType = Files.probeContentType(source);
        } catch (IOException e) {
            contentType = null;
        }
        if (contentType == null) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        String contentDisposition = ContentDisposition.inline()
                .filename(source.getFileName().toString(), StandardCharsets.UTF_8)
                .build()
                .toString();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    private File mapFile(Path file) {
        String fileName = file.getFileName().toString();
        boolean isDirectory = Files.isDirectory(file, LinkOption.NOFOLLOW_LINKS);
        Date lastModifiedDate;
        BigInteger size;
        String type;

        try {
            lastModifiedDate = new Date(Files.getLastModifiedTime(file, LinkOption.NOFOLLOW_LINKS).toMillis());
            if (isDirectory) {
                size = BigInteger.valueOf(getDirectorySize(file));
                type = "Folder";
            } else {
                size = BigInteger.valueOf(Files.size(file));
                type = getFileExtension(fileName);
            }
        } catch (IOException e) {
            throw new RuntimeException("Errore leggendo i metadati di " + fileName, e);
        }

        return new File(createStableId(file), fileName, size, type, lastModifiedDate, isDirectory);
    }

    private FileSearchRes mapSearchResult(Path path) {
        FileSearchRes result = new FileSearchRes();
        result.setPath("/" + toClientPath(rootPath.relativize(path)));
        result.setFolder(Files.isDirectory(path, LinkOption.NOFOLLOW_LINKS));
        result.setName(path.getFileName().toString());
        return result;
    }

    private void recursiveCopy(Path sourcePath, Path targetPath) throws IOException {
        List<Path> paths;
        try (Stream<Path> sourcePaths = Files.walk(sourcePath)) {
            paths = sourcePaths.toList();
        }

        if (paths.stream().anyMatch(Files::isSymbolicLink)) {
            throw new IllegalArgumentException("La copia di collegamenti simbolici non è supportata");
        }

        for (Path current : paths) {
            Path resolved = targetPath.resolve(sourcePath.relativize(current));
            if (Files.isDirectory(current, LinkOption.NOFOLLOW_LINKS)) {
                Files.createDirectories(resolved);
            } else {
                Files.copy(current, resolved);
            }
        }
    }

    private long getDirectorySize(Path directory) throws IOException {
        try (Stream<Path> paths = Files.walk(directory)) {
            return paths
                    .filter(path -> Files.isRegularFile(path, LinkOption.NOFOLLOW_LINKS))
                    .mapToLong(path -> {
                        try {
                            return Files.size(path);
                        } catch (IOException e) {
                            throw new RuntimeException(e);
                        }
                    })
                    .sum();
        }
    }

    private String createStableId(Path file) {
        String relativePath = toClientPath(rootPath.relativize(file));
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(relativePath.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 non disponibile", e);
        }
    }

    private Path resolvePath(String requestedPath) {
        if (requestedPath == null) {
            throw new IllegalArgumentException("Il path è obbligatorio");
        }

        String relativePath = requestedPath.replace('\\', '/');
        while (relativePath.startsWith("/")) {
            relativePath = relativePath.substring(1);
        }

        Path resolved = rootPath.resolve(relativePath).normalize();
        if (!resolved.startsWith(rootPath)) {
            throw new IllegalArgumentException("Il path richiesto è fuori dalla directory root");
        }

        verifyRealPathIsInsideRoot(resolved);
        return resolved;
    }

    private Path resolveChildPath(String requestedPath) {
        Path resolved = resolvePath(requestedPath);
        if (resolved.equals(rootPath)) {
            throw new IllegalArgumentException("L'operazione sulla directory root non è consentita");
        }
        return resolved;
    }

    private void verifyRealPathIsInsideRoot(Path resolved) {
        Path existingAncestor = resolved;
        while (existingAncestor != null && !Files.exists(existingAncestor, LinkOption.NOFOLLOW_LINKS)) {
            existingAncestor = existingAncestor.getParent();
        }

        try {
            if (existingAncestor == null || !existingAncestor.toRealPath().startsWith(rootPath)) {
                throw new IllegalArgumentException("Il path richiesto è fuori dalla directory root");
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Impossibile validare il path richiesto", e);
        }
    }

    private boolean isInsideRoot(Path path) {
        try {
            return path.toRealPath().startsWith(rootPath);
        } catch (IOException e) {
            return false;
        }
    }

    private static void requireExisting(Path path) {
        if (!Files.exists(path, LinkOption.NOFOLLOW_LINKS)) {
            throw new IllegalArgumentException("Il path non esiste: " + path);
        }
    }

    private static void requireMissing(Path path) {
        if (Files.exists(path, LinkOption.NOFOLLOW_LINKS)) {
            throw new IllegalArgumentException("Il path esiste già: " + path);
        }
    }

    private static String getFileExtension(String fullName) {
        int dotIndex = fullName.lastIndexOf('.');
        return dotIndex == -1 ? "" : fullName.substring(dotIndex + 1);
    }

    private static String toClientPath(Path path) {
        return path.toString().replace('\\', '/');
    }
}
