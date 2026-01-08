// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
pub mod scanner;
pub mod qemu;

use std::path::{PathBuf, Path};
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

fn find_main_disk(vm_path: &str) -> Option<PathBuf> {
    let images_path = PathBuf::from(vm_path).join("Data");
    let search_paths = vec![
        images_path.clone(), 
        images_path.join("Images"),
        PathBuf::from(vm_path).join("Images")
    ];

    for path in search_paths {
        if let Ok(entries) = fs::read_dir(&path) {
            for entry in entries.flatten() {
                let p = entry.path();
                if let Some(ext) = p.extension() {
                    if ext == "qcow2" {
                        return Some(p);
                    }
                }
            }
        }
    }
    
    let standard = PathBuf::from(vm_path).join("Data/Images/disk-0.qcow2");
    if standard.exists() {
        return Some(standard);
    }
    
    None
}

fn ensure_vm_stopped(vm_path: &str) -> Result<(), String> {
    let path = PathBuf::from(vm_path);
    if scanner::scanner::check_if_vm_running(&path) {
        return Err("Operation aborted: Virtual machine is currently running. Please stop it and try again.".to_string());
    }
    Ok(())
}

#[tauri::command]
fn get_snapshots(vm_path: String) -> Result<ImageInfo, String> {
    match find_main_disk(&vm_path) {
        Some(disk_path) => qemu::commands::get_image_info(&disk_path),
        None => Err(format!("No .qcow2 disk found in VM bundle at {:?}", vm_path))
    }
}

#[tauri::command]
fn create_snapshot(vm_path: String, name: String) -> Result<(), String> {
    ensure_vm_stopped(&vm_path)?;
    match find_main_disk(&vm_path) {
        Some(disk_path) => qemu::commands::create_snapshot(&name, &disk_path),
        None => Err(format!("No .qcow2 disk found in VM bundle at {:?}", vm_path))
    }
}

#[tauri::command]
fn delete_snapshot(vm_path: String, name: String) -> Result<(), String> {
    // Delete technically might work while running, but safer to block
    ensure_vm_stopped(&vm_path)?;
    match find_main_disk(&vm_path) {
        Some(disk_path) => qemu::commands::delete_snapshot(&name, &disk_path),
        None => Err(format!("No .qcow2 disk found in VM bundle at {:?}", vm_path))
    }
}

#[tauri::command]
fn revert_snapshot(vm_path: String, name: String) -> Result<(), String> {
    ensure_vm_stopped(&vm_path)?;
    match find_main_disk(&vm_path) {
        Some(disk_path) => qemu::commands::revert_snapshot(&name, &disk_path),
        None => Err(format!("No .qcow2 disk found in VM bundle at {:?}", vm_path))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet, 
            scan_vms, 
            get_snapshots,
            create_snapshot,
            delete_snapshot,
            revert_snapshot
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
