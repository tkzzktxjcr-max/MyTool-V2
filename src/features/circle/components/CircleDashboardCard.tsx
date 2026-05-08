"use client";

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Shield, Bell, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CircleDashboardCardProps {
  membersCount: number;
  sharingEnabled: boolean;
  unreadAlerts: number;
}

export default function CircleDashboardCard({ membersCount, sharingEnabled, unreadAlerts }: CircleDashboardCardProps) {
  const navigate = useNavigate();

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      onClick={() => navigate('/circle')}
      className="w-full rounded-2xl glass-card p-4 flex items-center gap-3 text-left transition-colors hover:bg-white/[0.08]"
    >
      <div className="w-11 h-11 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
        <Users className="w-5 h-5 text-accent" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">Mon Cercle</p>
        <p className="text-xs text-muted-foreground">
          {membersCount === 0
            ? 'Ajoute des proches de confiance'
            : `${membersCount} proche${membersCount > 1 ? 's' : ''} • ${sharingEnabled ? 'Partage actif' : 'Partage désactivé'}`
          }
        </p>
      </div>

      <div className="flex items-center gap-2">
        {unreadAlerts > 0 && (
          <span className="w-5 h-5 rounded-full bg-destructive flex items-center justify-center text-[10px] font-bold text-white">
            {unreadAlerts}
          </span>
        )}
        <div className={cn(
          "w-2.5 h-2.5 rounded-full",
          sharingEnabled ? "bg-secondary animate-pulse" : "bg-muted-foreground/30"
        )} />
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </motion.button>
  );
}