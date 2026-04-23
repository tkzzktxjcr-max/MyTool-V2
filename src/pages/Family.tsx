"use client";

import { useState } from 'react';
import { useFamily } from '@/features/family/context';
import { useAuth } from '@/features/auth/context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Copy, Check, Users, LogOut, Trash2, RefreshCw, Shield, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-6 py-12"
      >
        <div className="text-center">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center mx-auto mb-4"
          >
            <Users className="h-8 w-8 text-secondary" />
          </motion.div>
          <h1 className="text-2xl font-bold">Rejoignez une famille</h1>
          <p className="text-muted-foreground mt-2">Créez ou rejoignez une famille</p>
        </div>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4">Créer une famille</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input name="name" placeholder="Nom de la famille" required />
              <Input name="budget" type="number" placeholder="Budget mensuel (optionnel)" />
              <Button type="submit" className="w-full">Créer ma famille</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4">Rejoindre une famille</h3>
            <form onSubmit={handleJoin} className="space-y-4">
              <Input 
                placeholder="Code d'invitation" 
                value={joinCode} 
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())} 
                required 
                className="text-center text-2xl font-mono tracking-widest"
                maxLength={6}
              />
              <Button type="submit" variant="secondary" className="w-full">Rejoindre</Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-secondary" />
          </div>
          <h1 className="text-3xl font-bold">Ma Famille</h1>
        </div>
        <p className="text-muted-foreground">{family.name} • {members.length} membre{members.length > 1 ? 's' : ''}</p>
      </motion.div>

      {/* Invite Code */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card glow="primary">
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4">Code d'invitation</h3>
            <p className="text-4xl font-mono font-bold text-center py-4 bg-white/[0.03] rounded-xl mb-3">
              {family.inviteCode}
            </p>
            <p className="text-xs text-muted-foreground text-center mb-4">
              Partagez ce code pour inviter des membres
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={copyCode}>
                {copied ? <><Check className="h-4 w-4 mr-2" />Copié !</> : <><Copy className="h-4 w-4 mr-2" />Copier</>}
              </Button>
              <Button variant="outline" onClick={generateInviteCode}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Nouveau code
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Members */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4">Membres ({members.length})</h3>
            <div className="space-y-3">
              {members.map((member, i) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03]"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-lg font-semibold">
                    {member.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{member.name || 'Membre'}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.role === 'admin' ? 'Administrateur' : 'Membre'}
                    </p>
                  </div>
                  {member.role === 'admin' && (
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                      <Crown className="w-4 h-4 text-accent" />
                    </div>
                  )}
                  {member.userId !== profile?.userId && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeMember(member.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold mb-2">Paramètres</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Budget: {family.monthlyBudget ? `${family.monthlyBudget}€` : 'Non défini'}
            </p>
            <Button 
              variant="destructive" 
              className="w-full" 
              onClick={() => setShowLeaveDialog(true)}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Quitter la famille
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Leave Dialog */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quitter la famille ?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Vous allez quitter "{family.name}". Cette action est irréversible.
          </p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setShowLeaveDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" className="flex-1" onClick={leaveFamily}>
              Quitter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}