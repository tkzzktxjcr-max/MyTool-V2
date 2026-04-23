"use client";

import { useState } from 'react';
import { useFamily } from '@/features/family/context';
import { useAuth } from '@/features/auth/context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Copy, Check, Users, LogOut, Trash2, RefreshCw, Crown } from 'lucide-react';

export default function FamilyPage() {
  const { profile } = useAuth();
  const { family, members, createFamily, joinFamily, leaveFamily, generateInviteCode, removeMember } = useFamily();
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const budget = (form.elements.namedItem('budget') as HTMLInputElement).value;
    await createFamily(name, budget ? parseInt(budget) : undefined);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    await joinFamily(joinCode.toUpperCase());
    setJoinCode('');
  };

  const copyCode = async () => {
    if (!family?.inviteCode) return;
    await navigator.clipboard.writeText(family.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!family) {
    return (
      <div className="max-w-sm mx-auto space-y-4 py-4">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center mx-auto mb-3">
            <Users className="h-6 w-6 text-secondary" />
          </div>
          <h1 className="text-xl font-bold">Rejoignez une famille</h1>
          <p className="text-muted-foreground text-sm">Créez ou rejoignez</p>
        </div>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 text-sm">Créer une famille</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <Input name="name" placeholder="Nom de la famille" required />
              <Input name="budget" type="number" placeholder="Budget (optionnel)" />
              <Button type="submit" className="w-full">Créer</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 text-sm">Rejoindre</h3>
            <form onSubmit={handleJoin} className="space-y-3">
              <Input placeholder="Code" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} required className="text-center text-lg font-mono tracking-widest" maxLength={6} />
              <Button type="submit" variant="secondary" className="w-full">Rejoindre</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
            <Users className="w-4 h-4 md:w-6 md:h-6 text-secondary" />
          </div>
          <span className="hidden sm:inline">Ma Famille</span>
        </h1>
        <p className="text-muted-foreground text-sm">{family.name} • {members.length} membre{members.length > 1 ? 's' : ''}</p>
      </div>

      {/* Invite Code */}
      <Card glow="primary">
        <CardContent className="p-4 md:p-5">
          <h3 className="font-semibold mb-2 text-sm md:text-base">Code d'invitation</h3>
          <p className="text-2xl md:text-4xl font-mono font-bold text-center py-2 md:py-3 bg-white/[0.03] rounded-xl mb-3">
            {family.inviteCode}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 text-xs md:text-sm" onClick={copyCode}>
              {copied ? <><Check className="w-3 h-3 mr-1" />Copié !</> : <><Copy className="w-3 h-3 mr-1" />Copier</>}
            </Button>
            <Button variant="outline" size="sm" onClick={generateInviteCode} className="text-xs md:text-sm">
              <RefreshCw className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Nouveau code</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Members */}
      <Card>
        <CardContent className="p-4 md:p-5">
          <h3 className="font-semibold mb-3 text-sm md:text-base">Membres ({members.length})</h3>
          <div className="space-y-2">
            {members.map(member => (
              <div key={member.id} className="flex items-center gap-3 p-2 md:p-3 rounded-xl bg-white/[0.03]">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm md:text-base font-semibold flex-shrink-0">
                  {member.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{member.name || 'Membre'}</p>
                  <p className="text-xs text-muted-foreground">{member.role === 'admin' ? 'Administrateur' : 'Membre'}</p>
                </div>
                {member.role === 'admin' && <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center"><Crown className="w-3 h-3 text-accent" /></div>}
                {member.userId !== profile?.userId && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8" onClick={() => removeMember(member.id)}>
                    <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardContent className="p-4 md:p-5">
          <h3 className="font-semibold mb-2 text-sm md:text-base">Paramètres</h3>
          <p className="text-xs md:text-sm text-muted-foreground mb-3">Budget: {family.monthlyBudget ? `${family.monthlyBudget}€` : 'Non défini'}</p>
          <Button variant="destructive" className="w-full text-xs md:text-sm" onClick={() => setShowLeaveDialog(true)}>
            <LogOut className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            Quitter la famille
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent className="mx-4">
          <DialogHeader><DialogTitle>Quitter ?</DialogTitle></DialogHeader>
          <p className="text-muted-foreground text-sm">Vous allez quitter "{family.name}".</p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowLeaveDialog(false)}>Annuler</Button>
            <Button variant="destructive" className="flex-1" onClick={leaveFamily}>Quitter</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}