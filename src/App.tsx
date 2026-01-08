import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { UtmVirtualMachine, ImageInfo } from "./types";

function App() {
  const [vms, setVms] = useState<UtmVirtualMachine[]>([]);
  const [selectedVm, setSelectedVm] = useState<UtmVirtualMachine | null>(null);
  const [snapshots, setSnapshots] = useState<ImageInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVms();
  }, []);

  async function loadVms() {
    try {
      setLoading(true);
      const result = await invoke<UtmVirtualMachine[]>("scan_vms");
      setVms(result);
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function selectVm(vm: UtmVirtualMachine) {
    setSelectedVm(vm);
    setSnapshots(null);
    try {
      setLoading(true);
      const result = await invoke<ImageInfo>("get_snapshots", { vmPath: vm.path });
      setSnapshots(result);
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans">
      {/* Sidebar: VM List */}
      <div className="w-1/3 border-r border-gray-300 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-300 dark:border-gray-700 bg-gray-200 dark:bg-gray-800">
          <h2 className="font-semibold text-sm uppercase tracking-wide">Virtual Machines</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {vms.map((vm) => (
            <div
              key={vm.path}
              onClick={() => selectVm(vm)}
              className={`p-3 cursor-pointer text-sm truncate ${
                selectedVm?.path === vm.path
                  ? "bg-blue-500 text-white"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {vm.name}
            </div>
          ))}
          {vms.length === 0 && !loading && (
            <div className="p-4 text-gray-500 text-sm italic">No VMs found.</div>
          )}
        </div>
      </div>

      {/* Main Content: Snapshots */}
      <div className="flex-1 flex flex-col">
        {selectedVm ? (
          <>
            <div className="p-4 border-b border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex justify-between items-center">
              <h1 className="font-bold text-lg">{selectedVm.name}</h1>
              <span className="text-xs text-gray-500 font-mono">{selectedVm.path}</span>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                  {error}
                </div>
              )}
              
              {loading && <div className="text-sm text-gray-500">Loading...</div>}

              {snapshots && (
                <div>
                   <h3 className="text-md font-semibold mb-2">Snapshots</h3>
                   {!snapshots.snapshots || snapshots.snapshots.length === 0 ? (
                     <div className="text-gray-500 text-sm">No snapshots found for this VM.</div>
                   ) : (
                     <ul className="space-y-2">
                       {snapshots.snapshots.map((snap) => (
                         <li key={snap.id} className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm">
                           <div className="flex justify-between items-center">
                             <span className="font-medium">{snap.name}</span>
                             <span className="text-xs text-gray-500">ID: {snap.id}</span>
                           </div>
                           <div className="text-xs text-gray-400 mt-1">
                             Date: {new Date(snap["date-sec"] * 1000).toLocaleString()}
                           </div>
                         </li>
                       ))}
                     </ul>
                   )}
                   
                   <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                     <h4 className="text-sm font-semibold mb-2">Disk Info</h4>
                     <div className="text-xs font-mono bg-gray-50 dark:bg-gray-900 p-2 rounded">
                       <p>Format: {snapshots.format}</p>
                       <p>Virtual Size: {(snapshots["virtual-size"] / 1024 / 1024 / 1024).toFixed(2)} GB</p>
                       <p>Actual Size: {(snapshots["actual-size"] / 1024 / 1024).toFixed(2)} MB</p>
                     </div>
                   </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a Virtual Machine to view details
          </div>
        )}
      </div>
    </div>
  );
}

export default App;