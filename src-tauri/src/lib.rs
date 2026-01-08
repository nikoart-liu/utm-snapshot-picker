// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
pub mod scanner;
pub mod qemu;

use std::path::{PathBuf, Path};
use std::fs;
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::{State, Manager};
use crate::scanner::models::UtmVirtualMachine;
use crate::qemu::models::ImageInfo;

// Simple in-memory store protected by Mutex, backed by file on disk
struct StoreState(Mutex<HashMap<String, String>>);

const STORE_FILENAME: &str = "snapshot-head-tracking.json";

fn get_store_path(app_handle: &tauri::AppHandle) -> PathBuf {
    app_handle.path().app_data_dir().expect("failed to get app data dir").join(STORE_FILENAME)
}

fn load_store_from_disk(app_handle: &tauri::AppHandle) -> HashMap<String, String> {
    let path = get_store_path(app_handle);
    if path.exists() {
        if let Ok(content) = fs::read_to_string(&path) {
            if let Ok(map) = serde_json::from_str(&content) {
                return map;
            }
        }
    }
    HashMap::new()
}

fn save_store_to_disk(app_handle: &tauri::AppHandle, map: &HashMap<String, String>) {
    let path = get_store_path(app_handle);
    if let Some(parent) = path.parent() {
        let _ = fs::create_dir_all(parent);
    }
    if let Ok(content) = serde_json::to_string(map) {
        let _ = fs::write(path, content);
    }
}

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

// Custom Store Commands
#[tauri::command]
fn get_head_id(app_handle: tauri::AppHandle, state: State<'_, StoreState>, vm_path: String) -> Option<String> {
    let mut map = state.0.lock().unwrap();
    if map.is_empty() {
        *map = load_store_from_disk(&app_handle);
    }
    map.get(&vm_path).cloned()
}

#[tauri::command]
fn set_head_id(app_handle: tauri::AppHandle, state: State<'_, StoreState>, vm_path: String, snapshot_id: String) {
    let mut map = state.0.lock().unwrap();
    if map.is_empty() {
        *map = load_store_from_disk(&app_handle);
    }
    map.insert(vm_path, snapshot_id);
    save_store_to_disk(&app_handle, &map);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        //.plugin(tauri_plugin_store::Builder::default().build()) // Removed faulty plugin
        .manage(StoreState(Mutex::new(HashMap::new())))
        .invoke_handler(tauri::generate_handler![
            greet, 
            scan_vms, 
            get_snapshots,
            create_snapshot,
            delete_snapshot,
            revert_snapshot,
            get_head_id,
            set_head_id
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}