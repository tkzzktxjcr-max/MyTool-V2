"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Eye, MapPin, Bell, ChevronRight, Trash2, UserRound, Heart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { CircleMember, CircleRole } from '@/features/circle/types';

interface CircleMemberCardProps {
  member: CircleMember;
  onUpdatePermissions: (memberId: string, permissions: CircleMember['permissions']) => void;
  onRevoke: (memberId: string) => void;
}

const ROLE_LABELS: Record<CircleRole, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  friend: { label: 'Ami', icon: UserRound, color: 'text-secondary' },
  family: { label: 'Famille', icon: Heart, color: 'text-accent' },
  sponsor: { label: 'Parrain', icon: Star, color: 'text-[hsl(38,92%,50%)]' },
};

export default function CircleMemberCard({ member, onUpdatePermissions, onRevoke }: CircleMemberCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const roleConfig = ROLE_LABELS[member.role];
  const RoleIcon = roleConfig.icon;

  const activePermissionsCount = Object.values(member.permissions).filter(Boolean).length;

  return (
    <motion.div
      layout
      className={cn(
        "rounded-2xl border transition-all",
        member.isActive ? "bg-card border-white/10" : "bg-white/5 border-white/5 opacity-50"
      )}
    >
      <div
        className="p-4 flex items-center gap-3 cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
          roleConfig.color.replace('text-', 'bg-') + '/20'
        )}>
          <RoleIcon className={cn("w-5 h-5", roleConfig.color)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">{member.memberName}</p>
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
              roleConfig.color.replace('text-', 'bg-') + '/20',
              roleConfig.color
            )}>
              {roleConfig.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate">{member.memberEmail}</p>
        </div>

        <div className="flex items-center gap-2">
          {activePermissionsCount > 0 && (
            <span className="text-[10px] text-muted-foreground bg-white/10 px-2 py-1 rounded-full">
              {activePermissionsCount} donnée{activePermissionsCount > 1 ? 's' : ''}
            </span>
          )}
          <ChevronRight className={cn(
            "w-4 h-4 text-muted-foreground transition-transform",
            showDetails && "rotate-90"
          )} />
        </div>
      </div>

      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3"
        >
          <PermissionToggle
            icon={Eye}
            label="État en temps réel"
            description="Sobre / En cours / À risque"
            enabled={member.permissions.realtimeStatus}
            onChange={(v) => onUpdatePermissions(member.id, { ...member.permissions, realtimeStatus: v })}
          />
          <PermissionToggle
            icon={Shield}
            label="Niveau de consommation"
            description="Unités/jour, objectif hebdo"
            enabled={member.permissions.consumptionLevel}
            onChange={(v) => onUpdatePermissions(member.id, { ...member.permissions, consumptionLevel: v })}
          />
          <PermissionToggle
            icon={MapPin}
            label="Localisation (alerte uniquement)"
            description="Partagée UNIQUEMENT si alerte"
            enabled={member.permissions.locationOnAlert}
            onChange={(v) => onUpdatePermissions(member.id, { ...member.permissions, locationOnAlert: v })}
          />
          <PermissionToggle
            icon={Bell}
            label="Alertes automatiques"
            description="Prévenu si seuil dépassé"
            enabled={member.permissions.autoAlerts}
            onChange={(v) => onUpdatePermissions(member.id, { ...member.permissions, autoAlerts: v })}
          />

          <Button
            variant="ghost"
            onClick={() => onRevoke(member.id)}
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Retirer l'accès
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

function PermissionToggle({
  icon: Icon,
  label,
  description,
  enabled,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          enabled ? "bg-secondary/20" : "bg-white/5"
        )}>
          <Icon className={cn("w-4 h-4", enabled ? "text-secondary" : "text-muted-foreground")} />
        </div>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={cn(
          "w-11 h-6 rounded-full transition-colors relative",
          enabled ? "bg-secondary" : "bg-white/10"
        )}
      >
        <div className={cn(
          "absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform",
          enabled ? "left-[22px]" : "left-0.5"
        )} />
      </button>
    </div>
  );
}