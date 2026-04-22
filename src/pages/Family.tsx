"use client";

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFamily } from '@/contexts/FamilyContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button, Badge } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Copy, Check, Plus, Users, LogOut, Trash2, RefreshCw } from 'lucide-react';
import type { CreateFamilyForm } from '@/types';

export default function FamilyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const { family, members, createFamily, joinFamily, leaveFamily, generateInviteCode, removeMember } = useFamily();
  
  const [action, setAction] = useState(searchParams.get('action') || '');
  const [joinCode, setJoinCode] = useState('');
  const [loadingJoin, setLoadingJoin] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  const [formData, setFormData] = useState<CreateFamilyForm>({
    name: '',
    monthlyBudget: undefined,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      await createFamily(formData.name, formData.monthlyBudget);
      setAction('');
    } catch (error) {
      console.error('Error creating family:', error);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    setLoadingJoin(true);
    try {
      await joinFamily(joinCode.trim().toUpperCase());
      setJoinCode('');
    } catch (error) {
      console.error('Error joining family:', error);
      alert('Code invalide ou famille introuvable');
    } finally {
      setLoadingJoin(false);
    }
  };

  const handleLeave = async () => {
    try {
      await leaveFamily();
      setShowLeaveDialog(false);
    } catch (error) {
      console.error('Error leaving family:', error);
    }
  };

  const copyInviteCode = async () => {
    if (!family?.inviteCode) return;
    await navigator.clipboard.writeText(family.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateNewCode = async () => {
    try {
      await generateInviteCode();
    } catch (error) {
      console.error('Error generating code:', error);
    }
  };

  if (!family) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10 mb-4">
            <Users className="h-8 w-8 text-secondary" />
          </div>
          <h1 className="text-2xl font-bold">Rejoignez une famille</h1>
          <p className="text-muted-foreground mt-2">
            Créez une nouvelle famille ou rejoignez-en une existante
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Créer une famille
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleCreate}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom de la famille</label>
                <Input
                  placeholder="Les Dupont"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Budget mensuel (optionnel)</label>
                <Input
                  type="number"
                  placeholder="2000"
                  value={formData.monthlyBudget || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    monthlyBudget: parseInt(e.target.value) || undefined 
                  }))}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Créer ma famille
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Rejoindre une famille
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleJoin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Code d'invitation</label>
                <Input
                  placeholder="ABC123"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  required
                  className="text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Demandez le code à un membre de la famille que vous souhaitez rejoindre
              </p>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" variant="secondary" loading={loadingJoin}>
                Rejoindre
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-secondary" />
            Ma Famille
          </h1>
          <p className="text-muted-foreground">
            {family.name} • {members.length} membre{members.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Code d'invitation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-4xl font-mono font-bold tracking-widest text-center py-4 bg-muted rounded-xl">
                {family.inviteCode}
              </p>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Partagez ce code pour inviter de nouveaux membres
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="gap-2">
          <Button variant="outline" className="flex-1" onClick={copyInviteCode}>
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copié !
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copier le code
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleGenerateNewCode}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Nouveau code
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Membres ({members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.map((member) => (
              <div 
                key={member.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-muted/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20 text-secondary text-lg font-semibold">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {member.role === 'admin' ? 'Administrateur' : 'Membre'}
                  </p>
                </div>
                {member.role === 'admin' && (
                  <Badge variant="secondary">Admin</Badge>
                )}
                {member.userId !== profile?.userId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeMember(member.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Paramètres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
              <div>
                <p className="font-medium">Budget mensuel</p>
                <p className="text-sm text-muted-foreground">
                  {family.monthlyBudget ? `${family.monthlyBudget}€` : 'Non défini'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={() => setShowLeaveDialog(true)}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Quitter la famille
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quitter la famille ?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Vous allez quitter "{family.name}". Vous pourrez rejoindrez une autre famille plus tard.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowLeaveDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleLeave}>
              Quitter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}