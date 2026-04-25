"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Info, ExternalLink, FlaskConical, Scale, Clock, AlertTriangle, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AlcoholInfoProps {
  onClose?: () => void;
  isModal?: boolean;
}

export default function AlcoholInfo({ onClose, isModal = false }: AlcoholInfoProps) {
  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
          <FlaskConical className="w-6 h-6 text-secondary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Comment ça marche ?</h2>
          <p className="text-sm text-muted-foreground">La science derrière ton suivi</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm text-destructive">À visée éducative uniquement</p>
            <p className="text-xs text-muted-foreground mt-1">
              Ces calculs sont des estimations. Ne conduis jamais après avoir bu. 
              La seule façon sûre est d'attendre suffisamment ou d'utiliser un éthylotest.
            </p>
          </div>
        </div>
      </div>

      {/* The Formula */}
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          La formule de Widmark
        </h3>
        
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">1. Calcul de l'alcool absorbé</p>
            <code className="text-sm bg-white/10 px-3 py-2 rounded-lg block">
              Alcool (g) = Volume (cl) × 10 × (Degré% / 100) × 0.789
            </code>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">2. Calcul du pic d'alcoolémie</p>
            <code className="text-sm bg-white/10 px-3 py-2 rounded-lg block">
              BAC pic = Alcool (g) / (Poids × r)
            </code>
            <p className="text-xs text-muted-foreground mt-1">
              r = 0.68 pour homme, 0.55 pour femme
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">3. Élimination progressive</p>
            <code className="text-sm bg-white/10 px-3 py-2 rounded-lg block">
              Élimination = 0.15 g/L par heure
            </code>
          </div>
        </div>
      </div>

      {/* Example */}
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Scale className="w-4 h-4" />
          Exemple concret
        </h3>
        
        <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20">
          <p className="text-sm mb-3">
            <strong>Homme de 80 kg</strong> boit <strong>2 bières de 33cl à 5%</strong>
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Alcool absorbé :</span>
              <span className="font-mono">≈ 26g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pic BAC estimé :</span>
              <span className="font-mono">≈ 0.48 g/L</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Retour à 0 :</span>
              <span className="font-mono">≈ 3h15</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Conduite autorisée :</span>
              <span className="font-mono">≈ 2h00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sources */}
      <div className="space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Sources scientifiques
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="p-3 rounded-lg bg-white/5">
            <p className="font-medium">Formule de Widmark (1932)</p>
            <p className="text-xs text-muted-foreground">
              Widmark, E. M. P. "Die theoretischen Grundlagen der gerichtsmedizinischen Blutalkoholbestimmung." 
              Lunds Universitets Årsskrift (1932)
            </p>
          </div>
          
          <div className="p-3 rounded-lg bg-white/5">
            <p className="font-medium">OMS - Directives sur la consommation d'alcool</p>
            <p className="text-xs text-muted-foreground">
              Organisation Mondiale de la Santé - "Global status report on alcohol and health 2018"
            </p>
          </div>
          
          <div className="p-3 rounded-lg bg-white/5">
            <p className="font-medium">Taux d'élimination moyen</p>
            <p className="text-xs text-muted-foreground">
              Estudos clínicos mostram eliminação média de 0.10-0.15 g/L/hora. 
              Revue médicale suisse, 2019.
            </p>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
        <p className="text-sm font-medium">⚠️ Facteurs non pris en compte</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Variations individuelles (génétique, santé, médicaments)</li>
          <li>Alimentation (estomac vide = absorption plus rapide)</li>
          <li>Hydratation et fatigue</li>
          <li>Éthylotest professionnel (mesure plus précise)</li>
        </ul>
      </div>

      {/* Close button for modal */}
      {onClose && (
        <Button onClick={onClose} className="w-full">
          Fermer
        </Button>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl glass-card-strong p-6"
        >
          {content}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <Card>
        <CardContent className="p-6">
          {content}
        </CardContent>
      </Card>
    </div>
  );
}