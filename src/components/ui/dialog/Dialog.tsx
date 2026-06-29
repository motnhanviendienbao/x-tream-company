import { motion, AnimatePresence } from "framer-motion";

type DialogProps = {
  children: React.ReactNode;
};

const Dialog = ({ children }: DialogProps) => {
  return (
    <div className="h-screen flex items-center justify-center">
      <AnimatePresence>
        {/* Overlay */}
        <motion.div
          className="fixed inset-0 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Dialog */}
        <motion.div
          className="fixed inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Dialog;