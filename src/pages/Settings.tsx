"use client";

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Shield, Trash2, Download, Check, Sparkles, Info, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPrivacyDetails, setShowPrivacyDetails] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExportData = async () => {
    // Simulated export - in production this would call the actual export service
    toast.success('Export en cours', {
      description: 'Tes données seront téléchargées dans quelques instants.',
      icon: '📦',
    });
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // Simulated deletion - in production this would call the actual deletion service
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Compte supprimé', {
        description: 'Toutes tes données ont été supprimées.',
      });
      // In production, would also log out and redirect
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

  const privacyChecks = [
    { icon: '✓', label: 'Stockées localement sur ton appareil', description: 'Tes données ne transitent pas par nos serveurs' },
    { icon: '✓', label: 'Jamais revendues ou partagées', description: 'Ton vie privée est notre priorité' },
    { icon: '✓', label: 'Export possible à tout moment', description: 'Télécharge tes données quand tu le souhaites' },
    { icon: '✓', label: 'Suppression en 1 clic', description: 'Supprime définitivement toutes tes données' },
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
        <h1 className="text-lg font-semibold">Paramètres</h1>
      </header>

      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Privacy Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-secondary" />
            <h2 className="text-lg font-semibold">Confidentialité</h2>
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
                <h3 className="text-lg font-semibold">Tes données sont privées</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Nous prenons ta vie privée au sérieux
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
                      <Check className="w-4 h-4 text-secondary" />
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
          <h2 className="text-lg font-semibold mb-4">Actions sur tes données</h2>
          
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
                <p className="font-medium">Exporter mes données</p>
                <p className="text-xs text-muted-foreground">Télécharge une copie de toutes tes données</p>
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
                    <p className="text-xs text-destructive/80">Action irréversible</p>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent className="mx-4 rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-destructive">
                    <Trash2 className="w-5 h-5" />
                    Supprimer définitivement ?
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground text-left">
                    Cette action supprimera définitivement ton compte et toutes tes données. Cette action est irréversible.
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
          <h3 className="font-semibold">Family Hub</h3>
          <p className="text-xs text-muted-foreground mt-1">Version 1.0.0</p>
          <p className="text-xs text-muted-foreground mt-0.5">Fait avec 💜 pour ton bien-être</p>
        </motion.div>
      </div>

      {/* Privacy Details Sheet */}
      <Sheet open={showPrivacyDetails} onOpenChange={setShowPrivacyDetails}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader>
            <SheetTitle className="text-center flex items-center gap-2">
              <Shield className="w-5 h-5 text-secondary" />
              Politique de confidentialité
            </SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-4 text-sm">
            <div className="p-4 rounded-xl bg-white/5">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-secondary" />
                Local Storage
              </h4>
              <p className="text-muted-foreground">
                Toutes tes données de consommation sont stockées localement sur ton appareil. Seul toi y as accès.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-secondary" />
                Aucune revente
              </h4>
              <p className="text-muted-foreground">
                Nous ne revendons jamais tes données à des tiers. Ton vie privée est notre priorité absolue.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Download className="w-4 h-4 text-secondary" />
                Export & Suppression
              </h4>
              <p className="text-muted-foreground">
                Tu peux exporter ou supprimer tes données à tout moment depuis cette page. La suppression est immédiate et irréversible.
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
