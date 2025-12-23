package it.ec.mfm;

import it.ec.mfm.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@org.springframework.stereotype.Controller
@RequestMapping("/api")
public class Controller {

    @Autowired
    Service service;

    @GetMapping("/ls")
    public ResponseEntity<?> data(@RequestParam(name="path") String path) throws IOException {
        return ResponseEntity.ok().body(service.ls(path));
    }

    @PostMapping("/mkdir")
    public ResponseEntity<?> mkdir(@RequestBody Operation req) {
        service.mkdir(req.getCurrName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/mv")
    public ResponseEntity<?> mv(@RequestBody List<OperationRename> req) {
        for (OperationRename r : req) {
            if (r.getSource() == null || r.getSource().isEmpty()) {
                continue;
            }
            if (r.getTarget() == null || r.getTarget().isEmpty()) {
                continue;
            }
            service.mv(r.getSource(), r.getTarget());
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping("/cp")
    public ResponseEntity<?> cp(@RequestBody List<OperationCopy> req) {
        for (OperationCopy r : req) {
            if (r.getSource() == null || r.getSource().isEmpty()) {
                continue;
            }
            if (r.getTarget() == null || r.getTarget().isEmpty()) {
                continue;
            }
            service.cp(r.getSource(), r.getTarget());
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/rm")
    public ResponseEntity<?> rm(@RequestBody OperationDelete req) {
        service.rm(req.getTargets());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/locate")
    public ResponseEntity<?> locate(@RequestBody FileSearchReq req) {
        return ResponseEntity.ok().body(service.locate(req.getSource(), req.getStr()));
    }

    @PostMapping("/cat")
    public ResponseEntity<?> cat(@RequestBody Cat req) {
        return service.cat(req.getFilePath());
    }

}
