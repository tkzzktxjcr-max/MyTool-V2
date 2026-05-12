import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Check, X, Hand, Shield, Bell, TrendingUp, Flame, Wine, Power, ChevronRight } from "lucide-react";
import type { Friend, FriendRequest } from "@/features/friends/types";
import type { CircleMember, CircleAlert } from "@/features/circle/types";
import CircleMemberCard from "@/features/circle/components/CircleMemberCard";
import CircleAlertCard from "@/features/circle/components/CircleAlertCard";
import EmergencyModeSheet from "@/features/circle/components/EmergencyModeSheet";

interface FriendsListProps {
  friends: Friend[];
  receivedRequests: FriendRequest[];
  members: CircleMember[];
  alerts: CircleAlert[];
  sharingEnabled: boolean;
  activeMembersCount: number;
  sharedDataCount: number;
  emergencyActive: boolean;
  formattedTime: string;
  stopEmergency: () => void;
  startEmergency: (duration: number, memberIds: string[]) => Promise<void>;
  handleUpdatePermissions: (memberId: string, permissions: { realtimeStatus?: boolean; consumptionLevel?: boolean; locationOnAlert?: boolean; autoAlerts?: boolean }) => Promise<void>;
  handleRevoke: (memberId: string) => Promise<void>;
  handleEncourage: (friendId: string) => Promise<void>;
  acceptRequest: (id: string, name: string) => Promise<void>;
  declineRequest: (id: string) => Promise<void>;
  removeFriend: (memberId: string) => Promise<void>;
  setShowAddSheet: (v: boolean) => void;
  setShowEmergency: (v: boolean) => void;
  onMarkAsRead: (id: string) => void;
  onDismissAlert: (id: string) => void;
}

export default function FriendsList(props: FriendsListProps) {
  const {
    friends, receivedRequests, members, alerts, sharingEnabled,
    activeMembersCount, sharedDataCount, emergencyActive, formattedTime,
    stopEmergency, startEmergency, handleUpdatePermissions, handleRevoke,
    handleEncourage, acceptRequest, declineRequest, removeFriend,
    setShowAddSheet, setShowEmergency, onMarkAsRead, onDismissAlert,
  } = props;

  const [encouragingId, setEncouragingId] = useState<string | null>(null);
  const [showVisibilityDetails, setShowVisibilityDetails] = useState(false);
  const [showEmergency, localSetShowEmergency] = useState(false);

  const handleEncourageClick = async (friendId: string) => {
    setEncouragingId(friendId);
    setTimeout(() => setEncouragingId(null), 1500);
    await handleEncourage(friendId);
    toast.success('Encouragement envoyé !', { icon: '👏' });
  };

  const memberIdsWithAutoAlerts = members
    .filter(m => m.permissions.autoAlerts)
    .map(m => m.memberId);

  return (
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

      <EmergencyModeSheet
        open={showEmergency}
        onOpenChange={localSetShowEmergency}
        memberIds={memberIdsWithAutoAlerts}
        onActivate={async (duration, memberIds) => { await startEmergency(duration, memberIds); }}
      />
    </motion.div>
  );
}