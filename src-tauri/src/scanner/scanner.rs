use std::fs;
use std::path::{Path, PathBuf};
use crate::scanner::models::UtmVirtualMachine;
use std::process::Command;

pub fn scan_utm_vms(base_path: &Path) -> Vec<UtmVirtualMachine> {
    let mut vms = Vec::new();
    
    if let Ok(entries) = fs::read_dir(base_path) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() && path.extension().map_or(false, |ext| ext == "utm") {
                if let Some(name) = path.file_stem().and_then(|s| s.to_str()) {
                    let is_running = check_if_vm_running(&path);
                    vms.push(UtmVirtualMachine {
                        name: name.to_string(),
                        path: path.to_str().unwrap_or("").to_string(),
                        is_running,
                    });
                }
            }
        }
    }
    
    vms
}

pub fn check_if_vm_running(vm_path: &Path) -> bool {
    // UTM standard disk location search
    let search_paths = vec![
        vm_path.join("Data"),
        vm_path.join("Data/Images"),
        vm_path.join("Images")
    ];

    for path in search_paths {
        if let Ok(entries) = fs::read_dir(path) {
            for entry in entries.flatten() {
                let p = entry.path();
                if p.extension().map_or(false, |ext| ext == "qcow2") {
                    // Try to check if the file is locked using lsof (most reliable on macOS)
                    let output = Command::new("lsof")
                        .arg(p)
                        .output();
                    
                    if let Ok(out) = output {
                        // If lsof has output, it means someone (likely UTM) has the file open
                        if !out.stdout.is_empty() {
                            return true;
                        }
                    }
                }
            }
        }
    }
    false
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::tempdir;

    #[test]
    fn test_scan_utm_vms() {
        let dir = tempdir().unwrap();
        let vm_path = dir.path().join("TestVM.utm");
        fs::create_dir(&vm_path).unwrap();
        
        let vms = scan_utm_vms(dir.path());
        assert_eq!(vms.len(), 1);
        assert_eq!(vms[0].name, "TestVM");
        assert_eq!(vms[0].is_running, false); // Not running in test
    }
}
