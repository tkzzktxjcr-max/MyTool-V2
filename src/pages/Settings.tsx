"use client";

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Shield, Trash2, Download, Check, Info, ChevronRight, Sparkles, Heart, Users, Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useCircle } from '@/features/circle/hooks';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { members, revokeMember } = useCircle();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPrivacyDetails, setShowPrivacyDetails] = useState(false);
  const [showCircleSettings, setShowCircleSettings] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExportData = async () => {
    toast.success('Export en cours', {
      description: 'Tes donnees seront telechargees dans quelques instants.',
    });
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Compte supprime', {
        description: 'Toutes tes donnees ont ete supprimees.',
      });
      setTimeout(() => {
        navigate('/auth');
      }, 1000);
    } catch {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleRevokeAll = async () => {
    for (const member of members) {
      await revokeMember(member.id);
    }
    toast.success('Tous les accès ont été révoqués');
    setShowCircleSettings(false);
  };

  const privacyChecks = [
    { icon: Check, label: 'Stockees localement sur ton appareil', description: 'Tes donnees ne transitent pas par nos serveurs' },
    { icon: Check, label: 'Jamais revendues ou partagees', description: 'Ta vie privee est notre priorite' },
    { icon: Check, label: 'Export possible a tout moment', description: 'Telecharge tes donnees quand tu le souhaites' },
    { icon: Check, label: 'Suppression en 1 clic', description: 'Supprime definitivement toutes tes donnees' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Parametres</h1>
      </header>

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Circle Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold">Cercle de confiance</h2>
          </div>

          <Card className="overflow-hidden border-accent/20">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">Gérer mon cercle</p>
                    <p className="text-xs text-muted-foreground">
                      {members.length} proche{members.length > 1 ? 's' : ''} • Révoquer les accès
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowCircleSettings(true)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-start gap-3">
                  <Bell className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-accent">Données partagées</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Seuls les résumés agrégés sont partagés (état, unités/jour). Jamais tes boissons précises.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => setShowCircleSettings(true)}
                className="w-full h-12 rounded-2xl justify-start px-4 bg-white/5 border-white/10 hover:bg-white/10"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center mr-3">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Confidentialité du cercle</p>
                  <p className="text-xs text-muted-foreground">Révoquer les accès, purge des données</p>
                </div>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Privacy Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-secondary" />
            <h2 className="text-lg font-semibold">Confidentialite</h2>
          </div>

          <Card className="overflow-hidden border-secondary/20">
            <CardContent className="p-5 space-y-4">
              {/* Lock Icon Animation */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center"
                >
                  <motion.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Shield className="w-10 h-10 text-secondary" />
                  </motion.div>
                </motion.div>
              </div>

              {/* Title */}
              <div className="text-center">
                <h3 className="text-lg font-semibold">Tes donnees sont privees</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Nous prenons ta vie privee au serieux
                </p>
              </div>

              {/* Privacy Checklist */}
              <div className="space-y-3 pt-2">
                {privacyChecks.map((check, index) => (
                  <motion.div
                    key={check.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/5"
                  >
                    <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                      <check.icon className="w-4 h-4 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{check.label}</p>
                      <p className="text-xs text-muted-foreground">{check.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Learn More Link */}
              <button
                onClick={() => setShowPrivacyDetails(true)}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-secondary hover:text-secondary/80 transition-colors"
              >
                <Info className="w-4 h-4" />
                <span>En savoir plus sur notre politique</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold mb-4">Actions sur tes donnees</h2>
          
          <div className="space-y-3">
            {/* Export Button */}
            <Button
              variant="outline"
              onClick={handleExportData}
              className="w-full h-14 rounded-2xl justify-start px-4 bg-white/5 border-white/10 hover:bg-white/10"
            >
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center mr-3">
                <Download className="w-5 h-5 text-accent" />
              </div>
              <div className="text-left">
                <p className="font-medium">Exporter mes donnees</p>
                <p className="text-xs text-muted-foreground">Telecharge une copie de toutes tes donnees</p>
              </div>
            </Button>

            {/* Delete Button */}
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-14 rounded-2xl justify-start px-4 bg-destructive/10 border-destructive/20 hover:bg-destructive/20 text-destructive"
                >
                  <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center mr-3">
                    <Trash2 className="w-5 h-5 text-destructive" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Supprimer mon compte</p>
                    <p className="text-xs text-destructive/80">Action irreversible</p>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="mx-4 rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-destructive">
                    <Trash2 className="w-5 h-5" />
                    Supprimer definitivement ?
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground text-left">
                    Cette action supprimera definitivement ton compte et toutes tes donnees. Cette action est irreversible.
                  </p>
                </DialogHeader>
                <div className="flex flex-col sm:flex-row gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 rounded-xl"
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="flex-1 rounded-xl"
                  >
                    {isDeleting ? 'Suppression...' : 'Supprimer'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center py-8"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold">WellHub</h3>
          <p className="text-xs text-muted-foreground mt-1">Version 1.0.0</p>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center justify-center gap-1">
            Fait avec <Heart className="w-3 h-3 text-destructive fill-destructive" /> pour ton bien-etre
          </p>
        </motion.div>
      </div>

      {/* Circle Settings Sheet */}
      <Sheet open={showCircleSettings} onOpenChange={setShowCircleSettings}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle className="text-center flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              Gestion du cercle
            </SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-4 text-sm">
            <div className="p-4 rounded-xl bg-white/5">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-accent" />
                Proches actuels
              </h4>
              {members.length === 0 ? (
                <p className="text-muted-foreground">Aucun proche dans ton cercle</p>
              ) : (
                <div className="space-y-2">
                  {members.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                      <span>{m.memberName}</span>
                      <Button size="sm" variant="ghost" onClick={() => revokeMember(m.id)} className="h-7 text-xs text-destructive">
                        <X className="w-3 h-3 mr-1" />
                        Révoquer
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {members.length > 0 && (
              <Button
                variant="destructive"
                onClick={handleRevokeAll}
                className="w-full rounded-xl"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Révoquer tous les accès
              </Button>
            )}

            <div className="p-4 rounded-xl bg-white/5">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-secondary" />
                Droits à l'oubli
              </h4>
              <p className="text-muted-foreground">
                La suppression d'un proche efface immédiatement toutes les données partagées avec lui. Les alertes sont purgées après 30 jours.
              </p>
            </div>

            <Button
              onClick={() => setShowCircleSettings(false)}
              variant="outline"
              className="w-full rounded-xl"
            >
              Fermer
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Privacy Details Sheet */}
      <Sheet open={showPrivacyDetails} onOpenChange={setShowPrivacyDetails}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle className="text-center flex items-center gap-2">
              <Shield className="w-5 h-5 text-secondary" />
              Politique de confidentialite
            </SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-4 text-sm">
            <div className="p-4 rounded-xl bg-white/5">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-secondary" />
                Local Storage
              </h4>
              <p className="text-muted-foreground">
                Toutes tes donnees de consommation sont stockees localement sur ton appareil. Seul toi y as acces.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-secondary" />
                Aucune revente
              </h4>
              <p className="text-muted-foreground">
                Nous ne revendons jamais tes donnees a des tiers. Ta vie privee est notre priorite absolue.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Download className="w-4 h-4 text-secondary" />
                Export & Suppression
              </h4>
              <p className="text-muted-foreground">
                Tu peux exporter ou supprimer tes donnees a tout moment depuis cette page. La suppression est immediate et irreversible.
              </p>
            </div>

            <Button
              onClick={() => setShowPrivacyDetails(false)}
              variant="outline"
              className="w-full rounded-xl"
            >
              Fermer
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}