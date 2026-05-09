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
import CircleMemberCard from '@/features/circle/components/CircleMemberCard';
import CircleAlertCard from '@/features/circle/components/CircleAlertCard';
import EmergencyModeSheet from '@/features/circle/components/EmergencyModeSheet';
import AddMemberSheet from '@/features/circle/components/AddMemberSheet';
import FriendsList from './friends/FriendsList';
import LiveCircleTab from './friends/LiveCircleTab';

type FriendsTab = 'amis' | 'live';

export default function FriendsPage() {
  const { user } = useAuth();
  const { insights, getWeeklyUnits } = useAlcohol();

  // UI state FIRST (before any hooks that might read it)
  const [activeTab, setActiveTab] = useState<FriendsTab>('amis');
  const isLiveTab = activeTab === 'live';

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

  // Live hooks - DISABLED when not on Live tab to prevent network spam
  const { alerts, unreadCount, markAsRead, dismissAlert, markAllAsRead } = useCircleAlerts(isLiveTab);
  const { session: emergencySession, isActive: emergencyActive, formattedTime, stopEmergency, startEmergency } = useEmergencyMode(isLiveTab);

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
  } = useLiveSession(user?.$id, isLiveTab);

  // Build list of circle IDs: my own + all friends' userIds
  const friendUserIds = friends.map(f => f.userId);
  const allCircleIds = user?.$id ? [user.$id, ...friendUserIds] : friendUserIds;
  
  const {
    sessions: liveSessions,
    memberCount: liveMemberCount,
  } = useLiveLocations(allCircleIds, isLiveTab);

  // UI state
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showSafeReturn, setShowSafeReturn] = useState(false);
  const [showLiveOnboarding, setShowLiveOnboarding] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [sending, setSending] = useState(false);

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


      {activeTab === 'amis' && (
        <FriendsList
          friends={friends}
          receivedRequests={receivedRequests}
          members={members}
          alerts={alerts}
          sharingEnabled={sharingEnabled}
          activeMembersCount={activeMembersCount}
          sharedDataCount={sharedDataCount}
          emergencyActive={emergencyActive}
          formattedTime={formattedTime}
          stopEmergency={stopEmergency}
          startEmergency={startEmergency}
          handleUpdatePermissions={handleUpdatePermissions}
          handleRevoke={handleRevoke}
          handleEncourage={handleEncourage}
          acceptRequest={acceptRequest}
          declineRequest={declineRequest}
          removeFriend={removeFriend}
          setShowAddSheet={setShowAddSheet}
          setShowEmergency={setShowEmergency}
          onMarkAsRead={markAsRead}
          onDismissAlert={dismissAlert}
        />
      )}

      {activeTab === 'live' && (
        <LiveCircleTab
          isLive={isLive}
          liveSession={liveSession}
          liveSessions={liveSessions}
          batteryLevel={batteryLevel}
          handleStopLive={handleStopLive}
          handleStatusChange={handleStatusChange}
          stopSafeReturn={stopSafeReturn}
          startSafeReturn={handleStartSafeReturn}
          setShowSafeReturn={setShowSafeReturn}
          setShowLiveOnboarding={setShowLiveOnboarding}
          liveMemberCount={liveMemberCount}
        />
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