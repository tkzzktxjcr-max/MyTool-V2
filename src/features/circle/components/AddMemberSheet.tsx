"use client";

import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Link2, QrCode, Send, X, Check, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AddMemberSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendInvitation: (email: string, message?: string) => Promise<void>;
}

type AddMethod = 'email' | 'link' | 'qr';

export default function AddMemberSheet({ open, onOpenChange, onSendInvitation }: AddMemberSheetProps) {
  const [method, setMethod] = useState<AddMethod>('email');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [linkGenerated, setLinkGenerated] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !email.includes('@')) {
      toast.error('Email invalide');
      return;
    }
    setLoading(true);
    try {
      await onSendInvitation(email.trim(), message.trim() || undefined);
      toast.success('Invitation envoyée !');
      setEmail('');
      setMessage('');
      onOpenChange(false);
    } catch {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    const fakeLink = `https://wellhub.app/invite/${Math.random().toString(36).substring(2, 10)}`;
    navigator.clipboard.writeText(fakeLink).then(() => {
      setLinkGenerated(true);
      toast.success('Lien copié !');
      setTimeout(() => setLinkGenerated(false), 2000);
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader>
          <SheetTitle className="text-center">Ajouter un proche</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Method selector */}
          <div className="grid grid-cols-3 gap-2">
            {([
              { id: 'email' as AddMethod, icon: Mail, label: 'Email' },
              { id: 'link' as AddMethod, icon: Link2, label: 'Lien' },
              { id: 'qr' as AddMethod, icon: QrCode, label: 'QR' },
            ]).map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all",
                    method === m.id
                      ? "border-secondary bg-secondary/10"
                      : "border-white/10 bg-white/5"
                  )}
                >
                  <Icon className={cn("w-5 h-5", method === m.id ? "text-secondary" : "text-muted-foreground")} />
                  <span className={cn("text-xs font-medium", method === m.id ? "text-secondary" : "text-muted-foreground")}>
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {method === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email du proche</label>
                  <Input
                    type="email"
                    placeholder="marie@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message (optionnel)</label>
                  <Input
                    placeholder="Rejoins mon cercle de confiance..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="rounded-xl h-12"
                  />
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !email.trim()}
                  loading={loading}
                  className="w-full h-12 rounded-xl bg-secondary hover:bg-secondary/80"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer l'invitation
                </Button>
              </motion.div>
            )}

            {method === 'link' && (
              <motion.div
                key="link"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 text-center"
              >
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-sm text-muted-foreground mb-4">
                    Partage ce lien avec quelqu'un de confiance
                  </p>
                  <Button
                    onClick={handleCopyLink}
                    className={cn(
                      "w-full h-12 rounded-xl",
                      linkGenerated ? "bg-secondary" : "bg-white/10 hover:bg-white/20"
                    )}
                  >
                    {linkGenerated ? (
                      <><Check className="w-4 h-4 mr-2" /> Copié !</>
                    ) : (
                      <><Copy className="w-4 h-4 mr-2" /> Copier le lien</>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {method === 'qr' && (
              <motion.div
                key="qr"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center space-y-4"
              >
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <div className="w-48 h-48 mx-auto bg-white rounded-xl flex items-center justify-center">
                    <QrCode className="w-24 h-24 text-black" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Scanne ce QR code avec l'appareil de ton proche
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
}