"use client";

import { useState } from 'react';
import { useSeedDrinks, LIBRARY_DRINKS } from '@/lib/seed-drinks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Database, CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SeedDrinksPage() {
  const { seed, loading, progress, result } = useSeedDrinks();
  const [hasSeeded, setHasSeeded] = useState(false);

  const handleSeed = async () => {
    await seed();
    setHasSeeded(true);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center mx-auto mb-4">
            <Database className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">Seed Drinks</h1>
          <p className="text-muted-foreground mt-2">
            Alimente la bibliotheque avec {LIBRARY_DRINKS.length} boissons
          </p>
        </div>

        {/* Info Card */}
        <Card className="border-accent/30 bg-accent/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-accent mb-1">Une seule fois</p>
                <p className="text-muted-foreground">
                  Cette operation ajoute les boissons a ta base de donnees Appwrite. 
                  Les doublons seront ignores. Tu peux l'executer plusieurs fois sans risque.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Categories incluses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div className="p-2 rounded-lg bg-white/5">
                <span className="text-lg mr-1">🍺</span> Bieres ({LIBRARY_DRINKS.filter(d => ['lager', 'wheat_beer', 'ale', 'stout', 'ipa', 'pilsner', 'craft'].includes(d.category)).length})
              </div>
              <div className="p-2 rounded-lg bg-white/5">
                <span className="text-lg mr-1">🍷</span> Vins ({LIBRARY_DRINKS.filter(d => ['red_wine', 'white_wine', 'rose_wine'].includes(d.category)).length})
              </div>
              <div className="p-2 rounded-lg bg-white/5">
                <span className="text-lg mr-1">🥃</span> Spiritueux ({LIBRARY_DRINKS.filter(d => ['whisky', 'vodka', 'gin', 'rum', 'tequila', 'cognac', 'spirit'].includes(d.category)).length})
              </div>
              <div className="p-2 rounded-lg bg-white/5">
                <span className="text-lg mr-1">🍹</span> Cocktails ({LIBRARY_DRINKS.filter(d => d.category === 'cocktail').length})
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seed Button / Progress / Result */}
        {!result ? (
          <div className="space-y-4">
            {loading && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Seed en cours...
                      </span>
                      <span className="text-muted-foreground">
                        {progress.current} / {progress.total}
                      </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-secondary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(progress.current / progress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button 
              onClick={handleSeed} 
              disabled={loading}
              className="w-full h-14 text-lg"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Seed en cours...
                </>
              ) : (
                <>
                  <Database className="w-5 h-5 mr-2" />
                  Seed {LIBRARY_DRINKS.length} boissons
                </>
              )}
            </Button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card className={result.failed === 0 ? "border-secondary/30" : "border-accent/30"}>
              <CardContent className="pt-6">
                <div className="text-center">
                  {result.failed === 0 ? (
                    <CheckCircle2 className="w-16 h-16 text-secondary mx-auto mb-3" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-3">
                      <span className="text-3xl">{result.success > 0 ? '✓' : '✗'}</span>
                    </div>
                  )}
                  <h3 className="text-xl font-bold mb-1">
                    {result.failed === 0 ? 'Seed termine !' : 'Seed termine avec des erreurs'}
                  </h3>
                  <p className="text-muted-foreground">
                    {result.success} boissons ajoutees
                    {result.failed > 0 && `, ${result.failed} erreurs`}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => window.location.href = '/alcohol'}
              >
                Aller a Bien-etre
              </Button>
              <Button 
                variant="ghost"
                className="flex-1"
                onClick={() => setHasSeeded(false)}
              >
                Seed a nouveau
              </Button>
            </div>
          </motion.div>
        )}

        {/* Note */}
        <p className="text-center text-xs text-muted-foreground">
          Apres le seed, les boissons seront disponibles dans la section Bien-etre
        </p>
      </div>
    </div>
  );
}