import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type DrawerProps = {
  open: boolean;
  title: string;
  width?: number;
  onClose: () => void;
  children: React.ReactNode;
};

const Drawer = ({ open, title, width = 440, onClose, children }: DrawerProps) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel trượt từ phải */}
          <motion.div
            className="fixed right-0 top-0 z-50 flex h-screen flex-col bg-white shadow-2xl"
            style={{ width }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
          >
            <div className="flex items-center justify-between px-6 py-5">
              <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-500 transition-colors hover:text-slate-900"
                aria-label="Close drawer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Drawer;
