"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCircle, useCircleAlerts, useEmergencyMode } from '@/features/circle/hooks';
import { Button } from '@/components/ui/button';
import {
  Users, Plus, Shield, Bell, AlertTriangle, Power, ChevronRight,
  UserPlus, ShieldAlert, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import CircleMemberCard from './circle/CircleMemberCard';
import CircleAlertCard from './circle/CircleAlertCard';
import CircleDashboardCard from './circle/CircleDashboardCard';
import AddMemberSheet from './circle/AddMemberSheet';
import EmergencyModeSheet from './circle/EmergencyModeSheet';
import NotificationBell from '@/features/circle/components/NotificationBell';
import NotificationSheet from '@/features/circle/components/NotificationSheet';

export default function CirclePage() {
  const {
    members, sharingEnabled, activeMembersCount, sharedDataCount,
    isLoading, updatePermissions, revokeMember, sendInvitation,
  } = useCircle();

  const { alerts, unreadCount, markAsRead, dismissAlert, markAllAsRead } = useCircleAlerts();
  const { session, isActive: emergencyActive, formattedTime, stopEmergency, startEmergency } = useEmergencyMode();

  const [showAddMember, setShowAddMember] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showVisibilityDetails, setShowVisibilityDetails] = useState(false);

  const handleRevoke = async (memberId: string) => {
    await revokeMember(memberId);
    toast.success('Accès révoqué');
  };

  const handleUpdatePermissions = async (memberId: string, permissions: Parameters<typeof updatePermissions>[1]) => {
    await updatePermissions(memberId, permissions);
    toast.success('Permissions mises à jour');
  };

  const memberIdsWithAutoAlerts = members
    .filter(m => m.permissions.autoAlerts)
    .map(m => m.memberId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-10 w-10 rounded-xl border-4 border-accent border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            Mon Cercle
          </h1>
          <p className="text-sm text-muted-foreground">
            Partage sélectif avec tes proches
          </p>
        </div>
        <NotificationBell
          unreadCount={unreadCount}
          onClick={() => setShowNotifications(true)}
        />
      </div>

      {/* Sharing Status Card */}
      <div className={cn(
        "rounded-2xl p-4 border transition-all",
        sharingEnabled
          ? "bg-secondary/5 border-secondary/20"
          : "bg-white/5 border-white/10"
      )}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              sharingEnabled ? "bg-secondary/20" : "bg-white/10"
            )}>
              <Power className={cn("w-5 h-5", sharingEnabled ? "text-secondary" : "text-muted-foreground")} />
            </div>
            <div>
              <p className="font-semibold text-sm">
                {sharingEnabled ? 'Partage actif' : 'Partage désactivé'}
              </p>
              <p className="text-xs text-muted-foreground">
                {sharingEnabled
                  ? `${activeMembersCount} proches • ${sharedDataCount} données partagées`
                  : 'Tes proches ne voient rien actuellement'
                }
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              toast.info(sharingEnabled ? 'Partage désactivé' : 'Partage activé');
            }}
            className={cn(
              "w-12 h-7 rounded-full transition-colors relative",
              sharingEnabled ? "bg-secondary" : "bg-white/10"
            )}
          >
            <div className={cn(
              "absolute top-0.5 w-6 h-6 rounded-full bg-white transition-transform shadow-sm",
              sharingEnabled ? "left-[22px]" : "left-0.5"
            )} />
          </button>
        </div>

        {emergencyActive && session && (
          <div className="mt-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-destructive animate-pulse" />
              <span className="text-sm font-medium text-destructive">Mode urgence actif</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-destructive" />
              <span className="text-sm font-mono text-destructive">{formattedTime}</span>
              <Button size="sm" variant="ghost" onClick={stopEmergency} className="h-7 text-xs text-destructive">
                Arrêter
              </Button>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowVisibilityDetails(!showVisibilityDetails)}
          className="w-full mt-3 py-2 text-xs text-secondary hover:text-secondary/80 flex items-center justify-center gap-1"
        >
          <Shield className="w-3.5 h-3.5" />
          Qui voit quoi ?
          <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", showVisibilityDetails && "rotate-90")} />
        </button>

        <AnimatePresence>
          {showVisibilityDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-white/10 space-y-2"
            >
              {members.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Aucun proche dans ton cercle
                </p>
              ) : (
                members.map(m => (
                  <div key={m.id} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{m.memberName}</span>
                    <span className="text-secondary">
                      {Object.entries(m.permissions)
                        .filter(([, v]) => v)
                        .map(([k]) => {
                          if (k === 'realtimeStatus') return 'état';
                          if (k === 'consumptionLevel') return 'conso';
                          if (k === 'locationOnAlert') return 'loc.';
                          if (k === 'autoAlerts') return 'alertes';
                          return k;
                        })
                        .join(', ') || 'rien'}
                    </span>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Emergency Mode Button */}
      <Button
        variant="outline"
        onClick={() => setShowEmergency(true)}
        disabled={emergencyActive || members.length === 0}
        className={cn(
          "w-full h-12 rounded-2xl justify-start px-4 border-dashed",
          emergencyActive ? "border-destructive/30 text-destructive" : "border-white/20 hover:border-destructive/30 hover:text-destructive"
        )}
      >
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center mr-3",
          emergencyActive ? "bg-destructive/20" : "bg-white/5"
        )}>
          <AlertTriangle className={cn("w-5 h-5", emergencyActive ? "text-destructive" : "")} />
        </div>
        <div className="text-left">
          <p className="font-medium text-sm">Mode urgence</p>
          <p className="text-xs text-muted-foreground">
            {emergencyActive ? `Actif encore ${formattedTime}` : 'Partage renforcé temporaire'}
          </p>
        </div>
      </Button>

      {/* Members Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" />
            Mes proches
          </h2>
          <Button size="sm" variant="ghost" onClick={() => setShowAddMember(true)} className="h-8 gap-1 text-xs">
            <Plus className="w-3.5 h-3.5" />
            Ajouter
          </Button>
        </div>

        {members.length === 0 ? (
          <div className="text-center py-8 rounded-2xl bg-white/5 border border-white/10">
            <UserPlus className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Ton cercle est vide</p>
            <p className="text-xs text-muted-foreground mt-1">
              Ajoute un proche pour partager ton état
            </p>
            <Button
              size="sm"
              onClick={() => setShowAddMember(true)}
              className="mt-3 rounded-xl bg-secondary hover:bg-secondary/80"
            >
              <Plus className="w-4 h-4 mr-1" />
              Ajouter un proche
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CircleMemberCard
                  member={member}
                  onUpdatePermissions={handleUpdatePermissions}
                  onRevoke={handleRevoke}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <Bell className="w-4 h-4 text-[hsl(38,92%,50%)]" />
            Alertes reçues
          </h2>
          <div className="space-y-2">
            {alerts.slice(0, 5).map((alert) => (
              <CircleAlertCard
                key={alert.id}
                alert={alert}
                onMarkAsRead={markAsRead}
                onDismiss={dismissAlert}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sheets */}
      <AddMemberSheet
        open={showAddMember}
        onOpenChange={setShowAddMember}
        onSendInvitation={async (email, message) => { await sendInvitation(email, message); }}
      />

      <EmergencyModeSheet
        open={showEmergency}
        onOpenChange={setShowEmergency}
        memberIds={memberIdsWithAutoAlerts}
        onActivate={async (duration, memberIds) => { await startEmergency(duration, memberIds); }}
      />

      <NotificationSheet
        open={showNotifications}
        onOpenChange={setShowNotifications}
        alerts={alerts}
        onMarkAsRead={markAsRead}
        onDismiss={dismissAlert}
        onMarkAllAsRead={async () => { await markAllAsRead(alerts); }}
      />
    </div>
  );
}