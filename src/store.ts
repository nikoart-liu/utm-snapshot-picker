import { Store } from "@tauri-apps/plugin-store";

// Initialize the store
// We use a singleton pattern to ensure we're always using the same store instance
export const store = new Store("snapshot-head-tracking.json");

export interface HeadTrackingState {
  [vmPath: string]: string; // snapshotId
}

export async function getHeadSnapshotId(vmPath: string): Promise<string | null> {
  try {
    const val = await store.get<string>(vmPath);
    return val || null;
  } catch (e) {
    console.error("Failed to get head snapshot ID:", e);
    return null;
  }
}

export async function setHeadSnapshotId(vmPath: string, snapshotId: string): Promise<void> {
  try {
    await store.set(vmPath, snapshotId);
    await store.save();
  } catch (e) {
    console.error("Failed to set head snapshot ID:", e);
  }
}
