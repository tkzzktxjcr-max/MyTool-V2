"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFriends } from '@/features/friends/hooks/useFriends';
import { useAlcohol } from '@/features/alcohol/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Users, Plus, UserPlus, Check, X, Send, Hand, Heart,
  TrendingUp, Flame, Wine, Search, Loader2
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function FriendsPage() {
  const {
    friends, receivedRequests, isLoading,
    sendRequest, acceptRequest, declineRequest, removeFriend, updateSummary,
  } = useFriends();

  const { insights, getWeeklyUnits } = useAlcohol();

  const [showAddSheet, setShowAddSheet] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [sending, setSending] = useState(false);
  const [encouragingId, setEncouragingId] = useState<string | null>(null);

  // Auto-update my summary when page loads
  useState(() => {
    const weeklyUnits = getWeeklyUnits();
    const streak = insights?.streak || 0;
    const soberDays = insights?.dailyTrend?.filter(d => d.units === 0).length || 0;
    updateSummary({ weeklyUnits, soberDays, streak }).catch(() => {});
  });

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
        <Button
          size="sm"
          onClick={() => setShowAddSheet(true)}
          className="rounded-xl gap-1"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </Button>
      </div>

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

      {/* Add friend sheet */}
      <Sheet open={showAddSheet} onOpenChange={setShowAddSheet}>
        <SheetContent side="bottom" className="rounded-t-3xl">
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
    </div>
  );
}