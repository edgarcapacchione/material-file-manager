package it.ec.mfm;

import it.ec.mfm.dto.FileSearchRes;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ServiceTest {

    @TempDir
    Path root;

    @Test
    void listReturnsStableAndUniqueIds() throws IOException {
        Files.writeString(root.resolve("alpha.txt"), "alpha");
        Files.writeString(root.resolve("beta.txt"), "beta");
        Service service = new Service(root.toString());

        List<File> firstListing = service.ls("");
        List<File> secondListing = service.ls("");

        assertEquals(2, firstListing.size());
        assertEquals(
                firstListing.stream().map(File::getId).sorted().toList(),
                secondListing.stream().map(File::getId).sorted().toList()
        );
        assertNotEquals(firstListing.get(0).getId(), firstListing.get(1).getId());
    }

    @Test
    void rejectsPathsOutsideConfiguredRoot() {
        Service service = new Service(root.toString());

        IllegalArgumentException error = assertThrows(
                IllegalArgumentException.class,
                () -> service.mkdir("../outside")
        );

        assertTrue(error.getMessage().contains("fuori dalla directory root"));
    }

    @Test
    void moveDoesNotOverwriteExistingTarget() throws IOException {
        Path source = Files.writeString(root.resolve("source.txt"), "source");
        Path target = Files.writeString(root.resolve("target.txt"), "target");
        Service service = new Service(root.toString());

        assertThrows(IllegalArgumentException.class, () -> service.mv("/source.txt", "/target.txt"));

        assertEquals("source", Files.readString(source));
        assertEquals("target", Files.readString(target));
    }

    @Test
    void searchIsCaseInsensitiveAndLimitedToRequestedDirectory() throws IOException {
        Files.createDirectories(root.resolve("current"));
        Files.createDirectories(root.resolve("other"));
        Files.writeString(root.resolve("current/Match.txt"), "match");
        Files.writeString(root.resolve("other/MatchOutside.txt"), "match");
        Service service = new Service(root.toString());

        List<FileSearchRes> results = service.locate("/current", "MATCH");

        assertEquals(1, results.size());
        assertEquals("/current/Match.txt", results.get(0).getPath());
    }

    @Test
    void refusesToDeleteConfiguredRoot() {
        Service service = new Service(root.toString());

        assertThrows(IllegalArgumentException.class, () -> service.rm(new String[]{""}));
    }
}
