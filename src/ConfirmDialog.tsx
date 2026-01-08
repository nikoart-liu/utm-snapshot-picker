interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  isDestructive?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  isDestructive = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#2c2c2c] w-80 rounded-xl shadow-2xl border border-gray-200 dark:border-black/50 overflow-hidden transform transition-all scale-100">
        <div className="p-6 text-center">
          <h3 className="font-semibold text-base mb-2">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
        </div>
        
        <div className="flex border-t border-gray-200 dark:border-white/10 divide-x divide-gray-200 dark:divide-white/10">
          <button
            onClick={onCancel}
            className="flex-1 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${
              isDestructive ? "text-red-500" : "text-blue-500"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
