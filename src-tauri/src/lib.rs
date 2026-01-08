// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
pub mod scanner;
pub mod qemu;

use std::path::PathBuf;
use std::fs;
use crate::scanner::models::UtmVirtualMachine;
use crate::qemu::models::ImageInfo;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn scan_vms() -> Result<Vec<UtmVirtualMachine>, String> {
    let home = std::env::var("HOME").map_err(|_| "Could not find HOME directory")?;
    let base_path = PathBuf::from(home).join("Library/Containers/com.utmapp.UTM/Data/Documents");
    
    if !base_path.exists() {
         return Ok(Vec::new());
    }
    
    Ok(scanner::scanner::scan_utm_vms(&base_path))
}

#[tauri::command]
fn get_snapshots(vm_path: String) -> Result<ImageInfo, String> {
    let images_path = PathBuf::from(&vm_path).join("Data");
    
    // Fallback: try Data/Images if Data/ doesn't have qcow2 directly (older structure)
    // Actually UTM structure is usually Data/Images/disk-0.qcow2 but let's be flexible
    let search_paths = vec![
        images_path.clone(), 
        images_path.join("Images"),
        PathBuf::from(&vm_path).join("Images")
    ];

    let mut found_disk = None;

    for path in search_paths {
        if let Ok(entries) = fs::read_dir(&path) {
            for entry in entries.flatten() {
                let p = entry.path();
                if let Some(ext) = p.extension() {
                    if ext == "qcow2" {
                        found_disk = Some(p);
                        break;
                    }
                }
            }
        }
        if found_disk.is_some() {
            break;
        }
    }
    
    // Last resort: check strictly for disk-0.qcow2 in standard location if search failed
    if found_disk.is_none() {
         let standard = PathBuf::from(&vm_path).join("Data/Images/disk-0.qcow2");
         if standard.exists() {
             found_disk = Some(standard);
         }
    }

    match found_disk {
        Some(disk_path) => qemu::commands::get_image_info(&disk_path),
        None => Err(format!("No .qcow2 disk found in VM bundle at {:?}", vm_path))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, scan_vms, get_snapshots])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
