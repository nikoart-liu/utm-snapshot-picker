use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Snapshot {
    pub id: String,
    pub name: String,
    #[serde(rename = "vm-state-size")]
    pub vm_state_size: u64,
    #[serde(rename = "date-sec")]
    pub date_sec: u64,
    #[serde(rename = "clock-sec")]
    pub clock_sec: Option<u64>,
    #[serde(rename = "vm-clock-sec")]
    pub vm_clock_sec: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ImageInfo {
    #[serde(rename = "virtual-size")]
    pub virtual_size: u64,
    pub filename: String,
    #[serde(rename = "cluster-size")]
    pub cluster_size: Option<u64>, // cluster-size might also be missing in some contexts
    pub format: String,
    #[serde(rename = "actual-size")]
    pub actual_size: Option<u64>, // actual-size can be missing
    pub snapshots: Option<Vec<Snapshot>>,
}