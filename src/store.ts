import { invoke } from "@tauri-apps/api/core";

export async function getHeadSnapshotId(vmPath: string): Promise<string | null> {
  try {
    const val = await invoke<string | null>("get_head_id", { vmPath });
    console.log(`[Store] Get ${vmPath} = ${val}`);
    return val || null;
  } catch (e) {
    console.error("Failed to get head snapshot ID:", e);
    return null;
  }
}

export async function setHeadSnapshotId(vmPath: string, snapshotId: string): Promise<void> {
  try {
    console.log(`[Store] Set ${vmPath} = ${snapshotId}`);
    await invoke("set_head_id", { vmPath, snapshotId });
  } catch (e) {
    console.error("Failed to set head snapshot ID:", e);
  }
}
