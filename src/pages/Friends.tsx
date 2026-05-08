"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFriends } from '@/features/friends/hooks/useFriends';
import { useAlcohol } from '@/features/alcohol/hooks';
import { useCircle, useCircleAlerts, useEmergencyMode, useLiveSession, useLiveLocations } from '@/features/circle/hooks';
import { useAuth } from '@/features/auth/context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users, Plus, UserPlus, Check, X, Send, Hand, Heart,
  TrendingUp, Flame, Wine, Search, Loader2, Radio,
  Shield, AlertTriangle, Power, ChevronRight, Bell,
  MapPin, Clock, ShieldAlert
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

// Circle components
import NotificationBell from '@/features/circle/components/NotificationBell';
import NotificationSheet from '@/features/circle/components/NotificationSheet';
import LiveMap from '@/features/circle/components/LiveMap';
import LiveStatusBar from '@/features/circle/components/LiveStatusBar';
import LiveSessionPanel from '@/features/circle/components/LiveSessionPanel';
import SafeReturnSheet from '@/features/circle/components/SafeReturnSheet';
import LiveOnboardingDialog from '@/features/circle/components/LiveOnboardingDialog';
import CircleMemberCard from './circle/CircleMemberCard';
import CircleAlertCard from './circle/CircleAlertCard';
import EmergencyModeSheet from './circle/EmergencyModeSheet';
import AddMemberSheet from './circle/AddMemberSheet';

type FriendsTab = 'amis' | 'live';

export default function FriendsPage() {
  const { user } = useAuth();
  const { insights, getWeeklyUnits } = useAlcohol();

  // Friends hooks
  const {
    friends, receivedRequests, isLoading: friendsLoading,
    sendRequest, acceptRequest, declineRequest, removeFriend, updateSummary,
  } = useFriends();

  // Circle hooks
  const {
    members, sharingEnabled, activeMembersCount, sharedDataCount,
    isLoading: circleLoading, updatePermissions, revokeMember, sendInvitation,
  } = useCircle();

  const { alerts, unreadCount, markAsRead, dismissAlert, markAllAsRead } = useCircleAlerts();
  const { session: emergencySession, isActive: emergencyActive, formattedTime, stopEmergency, startEmergency } = useEmergencyMode();

  const {
    session: liveSession,
    isLive,
    position,
    batteryLevel,
    startSession,
    stopSession,
    updateStatus,
    startSafeReturn,
    stopSafeReturn,
  } = useLiveSession(user?.$id);

  // Build list of circle IDs: my own + all friends' userIds
  const friendUserIds = friends.map(f => f.userId);
  const allCircleIds = user?.$id ? [user.$id, ...friendUserIds] : friendUserIds;
  
  const {
    sessions: liveSessions,
    memberCount: liveMemberCount,
  } = useLiveLocations(allCircleIds);

  // UI state
  const [activeTab, setActiveTab] = useState<FriendsTab>('amis');
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showSafeReturn, setShowSafeReturn] = useState(false);
  const [showLiveOnboarding, setShowLiveOnboarding] = useState(false);
  const [showVisibilityDetails, setShowVisibilityDetails] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [sending, setSending] = useState(false);
  const [encouragingId, setEncouragingId] = useState<string | null>(null);

  // Auto-update my summary when page loads
  useEffect(() => {
    if (!user?.$id) return;
    const weeklyUnits = getWeeklyUnits();
    const streak = insights?.streak || 0;
    const soberDays = insights?.dailyTrend?.filter(d => d.units === 0).length || 0;
    updateSummary({ weeklyUnits, soberDays, streak }).catch(() => {});
  }, [user?.$id, insights, getWeeklyUnits, updateSummary]);

  // Friends handlers
  const handleSendRequest = async () => {
    if (!emailInput.trim() || !emailInput.includes('@')) {
      toast.error('Email invalide');
      return;
    }
    setSending(true);
    try {
      await sendRequest(emailInput.trim());
      toast.success('Demande envoyée !');
      setEmailInput('');
      setShowAddSheet(false);
    } catch {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  const handleEncourage = async (friendId: string) => {
    setEncouragingId(friendId);
    setTimeout(() => setEncouragingId(null), 1500);
    toast.success('Encouragement envoyé !', { icon: '👏' });
  };

  // Circle handlers
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

  // Live handlers
  const handleStartLive = async (accuracy: 'precise' | 'approximate', durationMinutes: number) => {
    await startSession(accuracy, durationMinutes);
    toast.success('Live Circle activé !', {
      description: 'Ta position est maintenant partagée avec tes proches.',
    });
  };

  const handleStopLive = async () => {
    await stopSession();
    toast.success('Partage arrêté');
  };

  const handleStatusChange = async (status: Parameters<typeof updateStatus>[0]) => {
    await updateStatus(status);
    const labels: Record<string, string> = {
      ok: 'Tout va bien 👍',
      heading_home: 'Je rentre 🏠',
      need_help: 'Besoin d\'aide signalé',
      low_battery: 'Batterie faible signalée',
    };
    toast.info(labels[status] || 'Statut mis à jour');
  };

  const handleStartSafeReturn = async (mode: Parameters<typeof startSafeReturn>[0]) => {
    await startSafeReturn(mode);
    toast.success('Retour sécurisé activé', {
      description: 'Ton Circle peut suivre ton trajet.',
    });
  };

  const isLoading = friendsLoading || circleLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            Mes amis
          </h1>
          <p className="text-sm text-muted-foreground">
            Partage ton parcours avec ceux qui comptent
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setShowAddSheet(true)}
            className="rounded-xl gap-1"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </Button>
          <NotificationBell
            unreadCount={unreadCount}
            onClick={() => setShowNotifications(true)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
        <button
          onClick={() => setActiveTab('amis')}
          className={cn(
            "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all",
            activeTab === 'amis' ? "bg-accent/20 text-accent" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Users className="w-4 h-4 inline mr-1.5" />
          Amis
        </button>
        <button
          onClick={() => setActiveTab('live')}
          className={cn(
            "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all relative",
            activeTab === 'live' ? "bg-secondary/20 text-secondary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Radio className="w-4 h-4 inline mr-1.5" />
          Live
          {liveMemberCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[10px] text-white font-bold">
              {liveMemberCount}
            </span>
          )}
        </button>
      </div>

      {/* AMIS TAB */}
      {activeTab === 'amis' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Pending requests */}
          <AnimatePresence>
            {receivedRequests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <h2 className="text-sm font-semibold text-accent flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Demandes en attente
                </h2>
                {receivedRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent font-semibold">
                        {req.inviterName?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{req.inviterName || 'Un ami'}</p>
                        <p className="text-xs text-muted-foreground">
                          veut te suivre • {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true, locale: fr })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => declineRequest(req.id)}
                        className="h-8 w-8 p-0 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => acceptRequest(req.id, req.inviterName || 'Ami')}
                        className="h-8 rounded-lg bg-accent hover:bg-accent/80 gap-1"
                      >
                        <Check className="w-4 h-4" />
                        Accepter
                      </Button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

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
                onClick={() => toast.info(sharingEnabled ? 'Partage désactivé' : 'Partage activé')}
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

            {emergencyActive && emergencySession && (
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

          {/* Friends list */}
          {friends.length === 0 ? (
            <div className="text-center py-12 rounded-2xl bg-white/5 border border-white/10">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Pas encore d'amis</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
                Ajoute un proche pour partager ton parcours et vous encourager mutuellement.
              </p>
              <Button
                onClick={() => setShowAddSheet(true)}
                className="rounded-xl bg-accent hover:bg-accent/80 gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Ajouter mon premier ami
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground">
                {friends.length} ami{friends.length > 1 ? 's' : ''}
              </h2>

              {friends.map((friend, index) => (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-2xl glass-card p-4 space-y-4"
                >
                  {/* Friend header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-lg font-bold">
                        {friend.memberName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{friend.memberName}</p>
                        <p className="text-xs text-muted-foreground">{friend.memberEmail}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFriend(friend.memberId)}
                      className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      title="Retirer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Weekly summary */}
                  {friend.lastSummaryUpdate ? (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-3 rounded-xl bg-white/5 text-center">
                        <div className="flex items-center justify-center gap-1 text-primary mb-1">
                          <Wine className="w-4 h-4" />
                          <span className="text-lg font-bold">{friend.weeklyUnits?.toFixed(1) || 0}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">unités/semaine</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 text-center">
                        <div className="flex items-center justify-center gap-1 text-secondary mb-1">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-lg font-bold">{friend.soberDays || 0}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">jours sobres</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 text-center">
                        <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                          <Flame className="w-4 h-4" />
                          <span className="text-lg font-bold">{friend.streak || 0}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">série</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Pas encore de résumé partagé
                    </p>
                  )}

                  {/* Encourage button */}
                  <Button
                    variant="outline"
                    onClick={() => handleEncourage(friend.memberId)}
                    disabled={encouragingId === friend.memberId}
                    className={cn(
                      "w-full rounded-xl h-11 gap-2 transition-all",
                      encouragingId === friend.memberId && "bg-secondary/20 text-secondary border-secondary/30"
                    )}
                  >
                    {encouragingId === friend.memberId ? (
                      <><Check className="w-4 h-4" /> Envoyé !</>
                    ) : (
                      <><Hand className="w-4 h-4" /> Envoyer un encouragement</>
                    )}
                  </Button>
                </motion.div>
              ))}
            </div>
          )}

          {/* Circle Members Management */}
          {members.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Gestion du cercle
              </h2>
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
            </div>
          )}

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
        </motion.div>
      )}

      {/* LIVE TAB */}
      {activeTab === 'live' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5 relative z-0"
        >
          {/* Live Map - isolated stacking context */}
          <div className="relative isolate">
            <LiveMap
              sessions={liveSessions}
              mySession={liveSession}
            />
          </div>

          {/* My Live Session Panel */}
          {isLive && liveSession && (
            <div className="space-y-4">
              <LiveSessionPanel
                session={liveSession}
                onStop={handleStopLive}
                batteryLevel={batteryLevel}
              />

              <LiveStatusBar
                currentStatus={liveSession.status}
                onStatusChange={handleStatusChange}
              />

              {/* Safe Return Button */}
              {!liveSession.safeReturnMode ? (
                <Button
                  variant="outline"
                  onClick={() => setShowSafeReturn(true)}
                  className="w-full h-12 rounded-2xl justify-start px-4 border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mr-3">
                    <MapPin className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">Je rentre</p>
                    <p className="text-xs text-blue-400/80">Activer le retour sécurisé</p>
                  </div>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={stopSafeReturn}
                  className="w-full h-12 rounded-2xl justify-start px-4 border-blue-500/30 bg-blue-500/10 text-blue-400"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mr-3">
                    <Shield className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">Retour sécurisé actif</p>
                    <p className="text-xs text-blue-400/80">Appuyez pour arrêter</p>
                  </div>
                </Button>
              )}
            </div>
          )}

          {/* Activate Live Button - clear separation from map */}
          {!isLive && (
            <div className="pt-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowLiveOnboarding(true)}
                className="w-full h-16 rounded-2xl bg-secondary/10 border-2 border-dashed border-secondary/30 flex items-center justify-center gap-3 text-secondary hover:bg-secondary/20 transition-all"
              >
                <Radio className="w-6 h-6" />
                <div className="text-left">
                  <p className="font-semibold">Activer le Live Circle</p>
                  <p className="text-xs text-secondary/80">Partage ta position avec tes proches</p>
                </div>
              </motion.button>
            </div>
          )}

          {/* Live Members List */}
          {liveSessions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Membres en ligne</h3>
              {liveSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-lg",
                    session.status === 'ok' && "bg-green-500/20",
                    session.status === 'heading_home' && "bg-blue-500/20",
                    session.status === 'need_help' && "bg-orange-500/20",
                    session.status === 'low_battery' && "bg-yellow-500/20",
                  )}>
                    {session.status === 'ok' && '👍'}
                    {session.status === 'heading_home' && '🏠'}
                    {session.status === 'need_help' && '⚠️'}
                    {session.status === 'low_battery' && '🔋'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{session.userName || 'Ami'}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.safeReturnMode && '🏠 Retour sécurisé • '}
                      {session.lastLocation ? 'Position active' : 'En attente de position...'}
                    </p>
                  </div>
                  {session.batteryLevel !== undefined && session.batteryLevel !== null && session.batteryLevel <= 20 && (
                    <span className="text-xs text-yellow-400">🔋 {session.batteryLevel}%</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Sheets & Dialogs */}
      <Sheet open={showAddSheet} onOpenChange={setShowAddSheet}>
        <SheetContent side="bottom" className="rounded-t-3xl z-50">
          <SheetHeader>
            <SheetTitle className="text-center flex items-center justify-center gap-2">
              <UserPlus className="w-5 h-5 text-accent" />
              Ajouter un ami
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-2xl bg-accent/10 border border-accent/20">
              <p className="text-sm text-accent text-center">
                <Heart className="w-4 h-4 inline mr-1" />
                Partage ton parcours avec un proche pour vous motiver mutuellement.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email de ton ami</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="marie@exemple.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="pl-12 h-14 rounded-2xl text-base"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendRequest()}
                />
              </div>
            </div>

            <Button
              onClick={handleSendRequest}
              disabled={sending || !emailInput.includes('@')}
              loading={sending}
              className="w-full h-14 rounded-2xl bg-accent hover:bg-accent/80 gap-2 text-base"
            >
              <Send className="w-5 h-5" />
              Envoyer la demande
            </Button>
          </div>
        </SheetContent>
      </Sheet>

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

      <SafeReturnSheet
        open={showSafeReturn}
        onOpenChange={setShowSafeReturn}
        onStart={handleStartSafeReturn}
      />

      <LiveOnboardingDialog
        open={showLiveOnboarding}
        onOpenChange={setShowLiveOnboarding}
        onActivate={handleStartLive}
      />
    </div>
  );
}