import { useState } from "react";

interface CreateSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}

export function CreateSnapshotModal({ isOpen, onClose, onCreate }: CreateSnapshotModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      setError(null);
      await onCreate(name);
      setName("");
      onClose();
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#2c2c2c] w-80 rounded-xl shadow-2xl border border-gray-200 dark:border-black/50 overflow-hidden transform transition-all scale-100">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
          <h3 className="font-semibold text-sm text-center">New Snapshot</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-500 ml-1">Name</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter snapshot name"
              className="w-full px-3 py-1.5 text-sm bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>

          {error && (
            <div className="text-xs text-red-500 bg-red-50 dark:bg-red-500/10 p-2 rounded border border-red-100 dark:border-red-500/20">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="px-3 py-1 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 active:bg-blue-700 rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
