use std::process::Command;
use std::path::{Path, PathBuf};
use crate::qemu::models::ImageInfo;

fn find_qemu_img_path() -> PathBuf {
    // Check common locations on macOS
    let common_paths = vec![
        "/opt/homebrew/bin/qemu-img",   // Apple Silicon Homebrew
        "/usr/local/bin/qemu-img",      // Intel Homebrew
        "/usr/bin/qemu-img",            // System
        "/bin/qemu-img",
    ];

    for path in common_paths {
        let p = PathBuf::from(path);
        if p.exists() {
            return p;
        }
    }

    // Fallback to searching in PATH (works in dev mode usually)
    PathBuf::from("qemu-img")
}

pub fn get_image_info(disk_path: &Path) -> Result<ImageInfo, String> {
    let qemu_path = find_qemu_img_path();
    let output = Command::new(qemu_path)
        .arg("info")
        .arg("--force-share") // Allow reading info even if VM is running
        .arg("--output=json")
        .arg(disk_path)
        .output()
        .map_err(|e| format!("Failed to execute qemu-img: {}", e))?;

    if !output.status.success() {
        return Err(format!("qemu-img failed: {}", String::from_utf8_lossy(&output.stderr)));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let info: ImageInfo = serde_json::from_str(&stdout)
        .map_err(|e| format!("Failed to parse qemu-img output: {}", e))?;

    Ok(info)
}

pub fn create_snapshot(name: &str, disk_path: &Path) -> Result<(), String> {
    let args = build_snapshot_create_args(name, disk_path);
    run_qemu_img_command(&args)
}

pub fn delete_snapshot(name: &str, disk_path: &Path) -> Result<(), String> {
    let args = build_snapshot_delete_args(name, disk_path);
    run_qemu_img_command(&args)
}

pub fn revert_snapshot(name: &str, disk_path: &Path) -> Result<(), String> {
    let args = build_snapshot_revert_args(name, disk_path);
    run_qemu_img_command(&args)
}

fn run_qemu_img_command(args: &[String]) -> Result<(), String> {
    let qemu_path = find_qemu_img_path();
    let output = Command::new(qemu_path)
        .args(args)
        .output()
        .map_err(|e| format!("Failed to execute qemu-img: {}", e))?;

    if !output.status.success() {
        return Err(format!("qemu-img failed: {}", String::from_utf8_lossy(&output.stderr)));
    }

    Ok(())
}

pub fn build_snapshot_create_args(name: &str, disk_path: &Path) -> Vec<String> {
    vec![
        "snapshot".to_string(),
        "-c".to_string(),
        name.to_string(),
        disk_path.to_string_lossy().to_string(),
    ]
}

pub fn build_snapshot_delete_args(name: &str, disk_path: &Path) -> Vec<String> {
    vec![
        "snapshot".to_string(),
        "-d".to_string(),
        name.to_string(),
        disk_path.to_string_lossy().to_string(),
    ]
}

pub fn build_snapshot_revert_args(name: &str, disk_path: &Path) -> Vec<String> {
    vec![
        "snapshot".to_string(),
        "-a".to_string(),
        name.to_string(),
        disk_path.to_string_lossy().to_string(),
    ]
}

#[cfg(test)]
mod tests {
    use super::*;
}
