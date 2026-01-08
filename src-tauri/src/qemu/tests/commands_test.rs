use std::path::Path;
use crate::qemu::commands;

#[test]
fn test_create_snapshot_command_generation() {
    let disk_path = Path::new("/tmp/test.qcow2");
    let name = "snap1";
    let args = commands::build_snapshot_create_args(name, disk_path);
    assert_eq!(args, vec!["snapshot", "-c", "snap1", "/tmp/test.qcow2"]);
}

#[test]
fn test_delete_snapshot_command_generation() {
    let disk_path = Path::new("/tmp/test.qcow2");
    let name = "snap1";
    let args = commands::build_snapshot_delete_args(name, disk_path);
    assert_eq!(args, vec!["snapshot", "-d", "snap1", "/tmp/test.qcow2"]);
}

#[test]
fn test_revert_snapshot_command_generation() {
    let disk_path = Path::new("/tmp/test.qcow2");
    let name = "snap1";
    let args = commands::build_snapshot_revert_args(name, disk_path);
    assert_eq!(args, vec!["snapshot", "-a", "snap1", "/tmp/test.qcow2"]);
}
