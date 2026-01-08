import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { UtmVirtualMachine, ImageInfo, Snapshot } from "./types";
import { CreateSnapshotModal } from "./CreateSnapshotModal";
import { ConfirmDialog } from "./ConfirmDialog";
import { Toast } from "./Toast";
import { getHeadSnapshotId, setHeadSnapshotId } from "./store";

function App() {
  const [vms, setVms] = useState<UtmVirtualMachine[]>([]);
  const [selectedVm, setSelectedVm] = useState<UtmVirtualMachine | null>(null);
  const [snapshots, setSnapshots] = useState<ImageInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [snapshotToDelete, setSnapshotToDelete] = useState<Snapshot | null>(null);
  const [snapshotToRevert, setSnapshotToRevert] = useState<Snapshot | null>(null);
  
  // Selection & Head Tracking
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);
  const [headSnapshotId, setHeadSnapshotIdState] = useState<string | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; isVisible: boolean; type?: 'success' | 'error' }>({
    message: "",
    isVisible: false,
    type: 'success',
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, isVisible: true, type });
  }, []);

  useEffect(() => {
    loadVms();
  }, []);

  async function loadVms() {
    try {
      setLoading(true);
      const result = await invoke<UtmVirtualMachine[]>("scan_vms");
      setVms(result);
      if (selectedVm) {
        const updatedSelected = result.find(v => v.path === selectedVm.path);
        if (updatedSelected) {
          setSelectedVm(updatedSelected);
        }
      }
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function selectVm(vm: UtmVirtualMachine) {
    console.log("Select VM:", vm.path);
    setSelectedVm(vm);
    setSnapshots(null);
    setSelectedSnapshotId(null);
    setHeadSnapshotIdState(null); 
    
    try {
      const savedHeadId = await getHeadSnapshotId(vm.path);
      console.log("Loaded HEAD ID:", savedHeadId);
      if (savedHeadId) {
        setHeadSnapshotIdState(savedHeadId);
      }
    } catch (e) {
      console.error("Error loading head ID:", e);
    }

    refreshSnapshots(vm.path);
  }

  async function refreshSnapshots(path: string): Promise<ImageInfo | null> {
    try {
      setLoading(true);
      const result = await invoke<ImageInfo>("get_snapshots", { vmPath: path });
      setSnapshots(result);
      setError(null);
      return result;
    } catch (e) {
      setError(String(e));
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function handleError(e: unknown) {
    const errorMsg = String(e);
    if (errorMsg.includes("Virtual machine is currently running")) {
      showToast("Operation blocked: VM is running. Please stop it.", "error");
      await loadVms();
    } else {
      setError(errorMsg);
    }
  }

  async function handleCreateSnapshot(name: string) {
    if (!selectedVm) return;
    try {
      await invoke("create_snapshot", { vmPath: selectedVm.path, name });
      showToast(`Snapshot "${name}" created successfully.`);
      
      const newInfo = await refreshSnapshots(selectedVm.path);
      
      if (newInfo && newInfo.snapshots) {
        const newSnap = newInfo.snapshots.find(s => s.name === name);
        if (newSnap) {
          setHeadSnapshotIdState(newSnap.id);
          await setHeadSnapshotId(selectedVm.path, newSnap.id);
        }
      }
    } catch (e) {
      await handleError(e);
    }
  }

  async function handleDeleteSnapshot() {
    if (!selectedVm || !snapshotToDelete) return;
    try {
      setLoading(true);
      await invoke("delete_snapshot", { vmPath: selectedVm.path, name: snapshotToDelete.name });
      showToast(`Snapshot deleted successfully.`);
      
      if (snapshotToDelete.id === headSnapshotId) {
        setHeadSnapshotIdState(null);
        await setHeadSnapshotId(selectedVm.path, "");
      }

      setSnapshotToDelete(null);
      setSelectedSnapshotId(null);
      await refreshSnapshots(selectedVm.path);
    } catch (e) {
      await handleError(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleRevertSnapshot() {
    if (!selectedVm || !snapshotToRevert) return;
    try {
      setLoading(true);
      await invoke("revert_snapshot", { vmPath: selectedVm.path, name: snapshotToRevert.name });
      showToast(`Reverted to snapshot successfully.`);
      
      setHeadSnapshotIdState(snapshotToRevert.id);
      await setHeadSnapshotId(selectedVm.path, snapshotToRevert.id);

      setSnapshotToRevert(null);
      await refreshSnapshots(selectedVm.path);
    } catch (e) {
      await handleError(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-[#1e1e1e] text-gray-800 dark:text-gray-200 font-sans overflow-hidden">
      {/* Sidebar: VM List */}
      <div className="w-64 border-r border-gray-300 dark:border-white/10 flex flex-col bg-gray-200/50 dark:bg-black/20 backdrop-blur-xl">
        <div className="p-4 pt-10 border-b border-gray-300 dark:border-white/10 flex justify-between items-center">
          <h2 className="font-bold text-xs text-gray-500 uppercase tracking-widest">UTM Machines</h2>
          <button 
            onClick={loadVms}
            className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors text-gray-500"
            title="Refresh list"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {vms.map((vm) => (
            <div
              key={vm.path}
              onClick={() => selectVm(vm)}
              className={`px-3 py-1.5 cursor-default text-[13px] rounded-md flex items-center justify-between transition-all ${
                selectedVm?.path === vm.path
                  ? "bg-blue-500 text-white shadow-sm"
                  : "hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <span className="truncate flex-1">{vm.name}</span>
              {vm.is_running && (
                <div className="flex items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]"></span>
                </div>
              )}
            </div>
          ))}
          {vms.length === 0 && !loading && (
            <div className="p-4 text-gray-400 text-xs text-center italic mt-10">No VMs detected in standard paths</div>
          )}
        </div>
      </div>

      {/* Main Content: Snapshots */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#1e1e1e]">
        {selectedVm ? (
          <>
            <div className="h-14 px-6 border-b border-gray-300 dark:border-white/10 flex justify-between items-center bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-md z-10">
              <div className="flex flex-col">
                <h1 className="font-bold text-sm">{selectedVm.name}</h1>
                <span className="text-[10px] text-gray-400 font-mono truncate max-w-xs">{selectedVm.path}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  disabled={selectedVm.is_running}
                  className={`px-2 py-1 text-xs rounded-md transition-all active:scale-95 flex items-center gap-1.5 shadow-sm ${
                    selectedVm.is_running 
                      ? "bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed" 
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                  title={selectedVm.is_running ? "Please shut down the virtual machine before managing snapshots." : "Create Snapshot"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  New
                </button>
                <button 
                  onClick={() => refreshSnapshots(selectedVm.path)}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-300 dark:border-white/10 rounded-md transition-all active:scale-95 flex items-center gap-1.5"
                  title="Refresh"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                </button>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-[13px] flex items-start gap-3">
                  <svg className="shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <div>
                    <p className="font-semibold">Error</p>
                    <p className="opacity-80 mt-1">{error}</p>
                  </div>
                </div>
              )}
              
              {loading && !snapshots && <div className="text-sm text-gray-400 flex items-center gap-2 animate-pulse"><div className="h-2 w-2 bg-gray-400 rounded-full"></div>Loading details...</div>}

              {snapshots && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pb-20">
                   <div className="flex justify-between items-end mb-4">
                     <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-wider">Snapshots History</h3>
                     <span className="text-[11px] text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">{snapshots.snapshots?.length || 0} Total</span>
                   </div>

                   {!snapshots.snapshots || snapshots.snapshots.length === 0 ? (
                     <div className="py-12 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-xl">
                       <svg className="mb-2 opacity-20" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                       <p className="text-sm">No snapshots found for this machine</p>
                     </div>
                   ) : (
                     <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
                       <table className="w-full text-left text-[13px]">
                         <thead>
                           <tr className="bg-gray-50 dark:bg-white/5 text-gray-500 font-medium">
                             <th className="px-4 py-2 border-b border-gray-200 dark:border-white/10">Snapshot Name</th>
                             <th className="px-4 py-2 border-b border-gray-200 dark:border-white/10">Created Date</th>
                             <th className="px-4 py-2 border-b border-gray-200 dark:border-white/10 text-right">State Size</th>
                           </tr>
                         </thead>
                         <tbody>
                           {snapshots.snapshots.map((snap) => (
                             <tr 
                               key={snap.id} 
                               onClick={() => setSelectedSnapshotId(snap.id)}
                               className={`transition-colors cursor-default ${
                                 selectedSnapshotId === snap.id 
                                   ? "bg-blue-50 dark:bg-blue-500/10" 
                                   : "hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                               }`}
                             >
                               <td className="px-4 py-3 border-b border-gray-100 dark:border-white/5">
                                 <div className="flex items-center gap-3">
                                   {/* HEAD Indicator (Phase 3) */}
                                   {snap.id === headSnapshotId ? (
                                      <div className="flex items-center justify-center h-5 w-5 bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 rounded-full" title="Current State">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                                      </div>
                                   ) : (
                                      <div className={`h-2 w-2 rounded-full ml-1.5 transition-opacity ${selectedSnapshotId === snap.id ? "bg-blue-500 opacity-100" : "bg-gray-300 opacity-0"}`}></div>
                                   )}
                                   <span className={`font-medium ${snap.id === headSnapshotId ? "text-blue-600 dark:text-blue-400" : ""}`}>{snap.name}</span>
                                   {snap.id === headSnapshotId && <span className="text-[10px] bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-bold">HEAD</span>}
                                 </div>
                               </td>
                               <td className="px-4 py-3 border-b border-gray-100 dark:border-white/5 text-gray-500">
                                 {new Date(snap["date-sec"] * 1000).toLocaleString()}
                               </td>
                               <td className="px-4 py-3 border-b border-gray-100 dark:border-white/5 text-right font-mono text-xs text-gray-400">
                                 {(snap["vm-state-size"] / 1024 / 1024).toFixed(1)} MB
                               </td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     </div>
                   )}
                   
                   <div className="mt-10 p-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-xl">
                     <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Disk Metadata</h4>
                     <div className="grid grid-cols-2 gap-4 text-[12px]">
                       <div className="flex justify-between border-b border-gray-200 dark:border-white/5 pb-1.5">
                         <span className="text-gray-500">Format</span>
                         <span className="font-mono">{snapshots.format}</span>
                       </div>
                       <div className="flex justify-between border-b border-gray-200 dark:border-white/5 pb-1.5">
                         <span className="text-gray-500">Virtual Size</span>
                         <span className="font-mono">{(snapshots["virtual-size"] / 1024 / 1024 / 1024).toFixed(2)} GB</span>
                       </div>
                       <div className="flex justify-between border-b border-gray-200 dark:border-white/5 pb-1.5">
                         <span className="text-gray-500">Actual Size</span>
                         <span className="font-mono">{(snapshots["actual-size"] ? (snapshots["actual-size"] / 1024 / 1024).toFixed(1) : "0.0")} MB</span>
                       </div>
                       <div className="flex justify-between border-b border-gray-200 dark:border-white/5 pb-1.5">
                         <span className="text-gray-500">Cluster Size</span>
                         <span className="font-mono">{(snapshots["cluster-size"] ? (snapshots["cluster-size"] / 1024).toFixed(0) : "0")} KB</span>
                       </div>
                     </div>
                   </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            {selectedSnapshotId && snapshots?.snapshots && (
               <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
                 <div className="bg-white dark:bg-[#333] border border-gray-200 dark:border-black/50 shadow-lg rounded-full px-4 py-2 flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-200">
                   <button 
                     onClick={() => {
                       const snap = snapshots.snapshots?.find(s => s.id === selectedSnapshotId);
                       if (snap) setSnapshotToRevert(snap);
                     }}
                     disabled={selectedVm?.is_running}
                     className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                        selectedVm?.is_running 
                          ? "text-gray-400 cursor-not-allowed" 
                          : "text-gray-700 dark:text-gray-200 hover:text-blue-500"
                     }`}
                     title={selectedVm?.is_running ? "Please shut down the virtual machine before managing snapshots." : "Revert to this snapshot"}
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                     Revert
                   </button>
                   <div className="w-px h-4 bg-gray-200 dark:bg-white/10"></div>
                   <button 
                     onClick={() => {
                        const snap = snapshots.snapshots?.find(s => s.id === selectedSnapshotId);
                        if (snap) setSnapshotToDelete(snap);
                     }}
                     className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                     Delete
                   </button>
                 </div>
               </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400/50">
            <svg className="mb-4" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            <p className="text-sm font-medium">Select a UTM Machine to manage snapshots</p>
          </div>
        )}
      </div>

      <CreateSnapshotModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateSnapshot}
      />

      <ConfirmDialog 
        isOpen={!!snapshotToDelete}
        title="Delete Snapshot"
        message={`Are you sure you want to delete snapshot "${snapshotToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isDestructive={true}
        onConfirm={handleDeleteSnapshot}
        onCancel={() => setSnapshotToDelete(null)}
      />

      <ConfirmDialog 
        isOpen={!!snapshotToRevert}
        title="Revert to Snapshot"
        message={`Are you sure you want to revert "${selectedVm?.name}" to snapshot "${snapshotToRevert?.name}"? Current state will be lost.`}
        confirmLabel="Revert"
        onConfirm={handleRevertSnapshot}
        onCancel={() => setSnapshotToRevert(null)}
      />

      <Toast 
        message={toast.message}
        isVisible={toast.isVisible}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}

export default App;