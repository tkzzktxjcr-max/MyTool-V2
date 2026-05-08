import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  unreadCount: number;
  onClick: () => void;
  className?: string;
}

export default function NotificationBell({ unreadCount, onClick, className }: NotificationBellProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative p-2 rounded-xl hover:bg-white/10 transition-colors",
        className
      )}
    >
      <Bell className="w-5 h-5" />
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className={cn(
              "absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold",
              unreadCount > 5 ? "bg-destructive text-white" : "bg-accent text-white"
            )}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}