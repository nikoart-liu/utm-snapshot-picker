use std::process::Command;
use std::path::Path;
use crate::qemu::models::ImageInfo;

pub fn get_image_info(disk_path: &Path) -> Result<ImageInfo, String> {
    let output = Command::new("qemu-img")
        .arg("info")
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

#[cfg(test)]
mod tests {
    use super::*;
    // mocking command execution is hard in pure unit tests without abstraction, 
    // but we can test the parsing logic if we separate it. 
    // For now, we trust the integration or end-to-end tests later since we can't run shell tests anyway.
}
