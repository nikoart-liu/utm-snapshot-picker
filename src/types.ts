export interface UtmVirtualMachine {
  name: string;
  path: string;
  is_running: boolean;
}

export interface Snapshot {
  id: string;
  name: string;
  "vm-state-size": number;
  "date-sec": number;
  "clock-sec": number;
  "vm-clock-sec": number;
}

export interface ImageInfo {
  "virtual-size": number;
  filename: string;
  "cluster-size": number;
  format: string;
  "actual-size": number;
  snapshots?: Snapshot[];
}
