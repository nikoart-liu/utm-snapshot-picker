use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct UtmVirtualMachine {
    pub name: String,
    pub path: String,
}
