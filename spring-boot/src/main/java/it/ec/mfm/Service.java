package it.ec.mfm;

import it.ec.mfm.dto.FileSearchRes;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.math.BigInteger;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static java.util.Optional.ofNullable;

@org.springframework.stereotype.Service
public class Service {

    @Value("${mfm.root.path}")
    private String rootPath;

    public List<File> ls(String path) throws IOException {
        try (Stream<Path> stream = Files.list(Paths.get(rootPath + path))) {
            return stream
                    .map(Service::mapFile)
                    .collect(Collectors.toList());
        }
    }

    public void mkdir(String dirName) {
        try {
            Path path = Paths.get(rootPath + dirName);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
            } else {
                throw new RuntimeException("La cartella esiste già");
            }
        } catch (IOException e) {
            throw new RuntimeException("Errore nella creazione della cartella", e);
        }
    }

    public void mv(String source, String target) {
        try {
            Files.move(Paths.get(rootPath, source), Paths.get(rootPath, target), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Errore nel rinominare/spostare", e);
        }
    }

    public void cp(String source, String target) {
        Path sourcePath = Paths.get(rootPath, source);
        if (!sourcePath.toFile().exists()) {
            throw new RuntimeException("Path doesn't exist: " + sourcePath.toFile().getAbsolutePath());
        }
        Path targetPath = Paths.get(rootPath, target);
        if (targetPath.toFile().exists()) {
            throw new RuntimeException("Path already exist: " + targetPath.toFile().getAbsolutePath());
        }
        try {
            recursiveCopy(sourcePath, targetPath);
        } catch (Exception e) {
            throw new RuntimeException("Errore nella copia", e);
        }
    }

    public void rm(String[] targetPaths) {
        try {
            for (String targetPath : targetPaths) {
                java.io.File target = Paths.get(rootPath, targetPath).toFile();
                if (!target.exists()) {
                    throw new RuntimeException("Path doesn't exist: " + target.getAbsolutePath());
                }
                Queue<java.io.File> queue = new ArrayDeque<>();
                List<java.io.File> directories = new ArrayList<>();
                queue.add(target);
                directories.add(target);
                // Cancella i file e accoda le cartelle
                deleteTargetContents(queue, directories);
                // Cancella le cartelle in ordine inverso
                deleteTargetDirectories(directories);
            }
        } catch (Exception e) {
            throw new RuntimeException("Errore durante l'eliminazione", e);
        }
    }

    public List<FileSearchRes> locate(String source, String str) {
        // Path sourcePath = Paths.get(rootPath, source);
        // scommentare riga sopra se si vuole far partire la ricerca da un path specifico
        Path sourcePath = Paths.get(rootPath);
        if (!sourcePath.toFile().exists()) {
            throw new RuntimeException("Path doesn't exist: " + sourcePath.toFile().getAbsolutePath());
        }
        if (str == null || str.isEmpty()) {
            throw new RuntimeException("No text provided for search");
        }
        try {
            return recursiveSearch(sourcePath, str);
        } catch (Exception e) {
            throw new RuntimeException("Errore nella ricerca", e);
        }
    }

    public ResponseEntity<?> cat(String filePath) {
        Path source = Paths.get(rootPath, filePath);
        if (!source.toFile().exists()) {
            throw new RuntimeException("Path doesn't exist: " + source.toFile().getAbsolutePath());
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
        } catch (Exception e) {
            contentType = null;
        }
        if (contentType == null) {
            contentType = "application/octet-stream"; // fallback
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + source.getFileName() + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    private static File mapFile(Path file) {
        Integer randomId = Double.valueOf(Math.random() * 512 + 1).intValue();
        String fileName = file.getFileName().toString();
        Boolean isDirectory = file.toFile().isDirectory();
        Date lastModifiedDate = new Date(file.toFile().lastModified());
        String type;
        BigInteger size;
        if (!isDirectory) {
            size = BigInteger.valueOf(file.toFile().length());
            type = getFileExtension(file.getFileName().toString());
        } else {
            size = BigInteger.valueOf(getDirectorySize(file.toFile()));
            type = "Folder";
        }
        return new File(randomId, fileName, size, type, lastModifiedDate, isDirectory);
    }

    private static String getFileExtension(String fullName) {
        int dotIndex = fullName.lastIndexOf('.');
        return (dotIndex == -1) ? "" : fullName.substring(dotIndex + 1);
    }

    private void recursiveCopy(Path sourcePath, Path targetPath) throws Exception {
        Queue<java.io.File> sourceQueue = new ArrayDeque<>();
        sourceQueue.add(sourcePath.toFile());
        while (!sourceQueue.isEmpty()) {
            java.io.File current = sourceQueue.poll();
            Path relative = sourcePath.relativize(current.toPath());
            Path resolved = targetPath.resolve(relative);
            if (!current.isDirectory()) {
                Files.copy(current.toPath(), resolved, StandardCopyOption.REPLACE_EXISTING);
            } else {
                Files.createDirectories(resolved);
                ofNullable(current.listFiles())
                    .ifPresent(files -> Collections.addAll(sourceQueue, files));
            }
        }
    }

    private List<FileSearchRes> recursiveSearch(Path sourcePath, String str) throws Exception {
        List<FileSearchRes> candidates = new ArrayList<>();
        Queue<java.io.File> sourceQueue = new ArrayDeque<>();
        sourceQueue.add(sourcePath.toFile());
        while (!sourceQueue.isEmpty()) {
            java.io.File current = sourceQueue.poll();
            java.io.File[] files = ofNullable(current.listFiles()).orElse(new java.io.File[]{});
            for (java.io.File f : files) {
                if (f.getName().toLowerCase().contains(str)) {
                    FileSearchRes candidate = new FileSearchRes();
                    candidate.setPath("/" + sourcePath.relativize(f.toPath()).toString().replace("\\", "/"));
                    candidate.setFolder(f.isDirectory());
                    candidate.setName(f.getName());
                    candidates.add(candidate);
                }
                if (f.isDirectory()) {
                    sourceQueue.add(f);
                }
            }
        }
        return candidates;
    }

    private static long getDirectorySize(java.io.File directory) {
        long sum = 0;
        Queue<java.io.File> queue = new ArrayDeque<>();
        queue.add(directory);
        while (!queue.isEmpty()) {
            java.io.File current = queue.poll();
            java.io.File[] files = current.listFiles();
            if (files == null) {
                continue;
            }
            for (java.io.File f : files) {
                if (f.isFile()) {
                    sum += f.length();
                } else {
                    queue.add(f);
                }
            }
        }
        return sum;
    }

    private static void deleteTargetContents(Queue<java.io.File> queue, List<java.io.File> directories) {
        // Cancella i file e accoda le cartelle
        while (!queue.isEmpty()) {
            java.io.File curr = queue.poll();
            java.io.File[] files = ofNullable(curr.listFiles()).orElse(new java.io.File[]{});
            for (java.io.File f : files) {
                if (f.isFile()) {
                    if (!f.delete()) {
                        throw new RuntimeException("Errore eliminando file: " + f.getAbsolutePath());
                    }
                } else {
                    queue.add(f);
                    directories.add(f);
                }
            }
        }
    }

    private static void deleteTargetDirectories(List<java.io.File> directories) {
        for (int i = directories.size() - 1; i >= 0; i--) {
            if (!directories.get(i).delete()) {
                throw new RuntimeException("Errore eliminando directory: " + directories.get(i).getAbsolutePath());
            }
        }
    }

}
