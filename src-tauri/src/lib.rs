// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
pub mod scanner;
pub mod qemu;

use std::path::PathBuf;
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
    let disk_path = PathBuf::from(&vm_path).join("Data/Images/disk-0.qcow2");
    
    if !disk_path.exists() {
        return Err(format!("Main disk not found at {:?}", disk_path));
    }
    
    qemu::commands::get_image_info(&disk_path)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, scan_vms, get_snapshots])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}