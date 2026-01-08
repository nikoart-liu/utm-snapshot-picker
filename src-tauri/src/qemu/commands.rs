use std::process::Command;
use std::path::Path;
use crate::qemu::models::ImageInfo;

pub fn get_image_info(disk_path: &Path) -> Result<ImageInfo, String> {
    let output = Command::new("qemu-img")
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
    let output = Command::new("qemu-img")
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
    // mocking command execution is hard in pure unit tests without abstraction, 
    // but we can test the parsing logic if we separate it. 
    // For now, we trust the integration or end-to-end tests later since we can't run shell tests anyway.
}