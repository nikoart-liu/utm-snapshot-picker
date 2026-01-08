use std::fs;
use std::path::Path;
use crate::scanner::models::UtmVirtualMachine;

pub fn scan_utm_vms(base_path: &Path) -> Vec<UtmVirtualMachine> {
    let mut vms = Vec::new();
    
    if let Ok(entries) = fs::read_dir(base_path) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() && path.extension().map_or(false, |ext| ext == "utm") {
                if let Some(name) = path.file_stem().and_then(|s| s.to_str()) {
                    vms.push(UtmVirtualMachine {
                        name: name.to_string(),
                        path: path.to_str().unwrap_or("").to_string(),
                    });
                }
            }
        }
    }
    
    vms
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
        
        // Create a non-utm dir
        fs::create_dir(dir.path().join("NotAVM.txt")).unwrap();

        let vms = scan_utm_vms(dir.path());
        assert_eq!(vms.len(), 1);
        assert_eq!(vms[0].name, "TestVM");
        assert!(vms[0].path.contains("TestVM.utm"));
    }
}
