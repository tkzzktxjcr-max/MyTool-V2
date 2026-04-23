"use client";

import { useEffect, useState } from 'react';
import { useAlcohol } from '@/features/alcohol/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Wine, AlertTriangle, CheckCircle, Droplet, Trash2, Activity, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { CreateAlcoholLogForm, DrinkType } from '@/features/alcohol/types';
import { DRINK_TYPES, HEALTH_GUIDELINES } from '@/features/alcohol/types';

export default function AlcoholPage() {
  const { logs, insights, loadLogs, createLog, deleteLog, calculateUnits, getTodayUnits } = useAlcohol();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateAlcoholLogForm>({ drinkType: 'beer', volumeCl: 50, abv: 5 });

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createLog(formData);
    setIsDialogOpen(false);
    setFormData({ drinkType: 'beer', volumeCl: 50, abv: 5 });
  };

  const handleDrinkChange = (type: string) => {
    const defaultAbv = DRINK_TYPES[type as DrinkType].defaultAbv;
    setFormData(prev => ({ ...prev, drinkType: type as DrinkType, abv: defaultAbv }));
  };

  const todaysUnits = getTodayUnits();
  const recentLogs = logs.slice(0, 5);

  return (
    <div className="space-y-4 md:space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
              <Activity className="w-4 h-4 md:w-6 md:h-6 text-secondary" />
            </div>
            <span className="hidden sm:inline">Insights Bien-être</span>
          </h1>
          <p className="text-muted-foreground text-sm">Suivi personnel</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Ajouter un verre</span>
              <span className="sm:hidden">Ajouter</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4">
            <DialogHeader><DialogTitle>Enregistrer</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={formData.drinkType} onValueChange={handleDrinkChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(DRINK_TYPES).map(([key, drink]) => <SelectItem key={key} value={key}>{drink.icon} {drink.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Volume (cl)</label>
                  <Input type="number" min="1" max="200" value={formData.volumeCl} onChange={(e) => setFormData(prev => ({ ...prev, volumeCl: parseInt(e.target.value) || 0 }))} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Degré (%)</label>
                  <Input type="number" min="0.1" max="100" step="0.1" value={formData.abv} onChange={(e) => setFormData(prev => ({ ...prev, abv: parseFloat(e.target.value) || 0 }))} required />
                </div>
              </div>
              <div className="p-3 rounded-xl bg-muted/50 text-center">
                <span className="text-sm text-muted-foreground">Unités: </span>
                <span className="text-lg font-bold">{calculateUnits(formData.volumeCl, formData.abv).toFixed(1)}</span>
              </div>
              <Button type="submit" className="w-full">Enregistrer</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Risk Level */}
      {insights && (
        <Card className={cn("border-2", insights.riskLevel === 'low' && "border-secondary/30 bg-secondary/5", insights.riskLevel === 'moderate' && "border-accent/30 bg-accent/5", insights.riskLevel === 'high' && "border-destructive/30 bg-destructive/5")}>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start gap-3 md:gap-4">
              <div className={cn("w-10 h-10 md:w-14 md:h-14 rounded-xl flex items-center justify-center", insights.riskLevel === 'low' && "bg-secondary/20 text-secondary", insights.riskLevel === 'moderate' && "bg-accent/20 text-accent", insights.riskLevel === 'high' && "bg-destructive/20 text-destructive")}>
                {insights.riskLevel === 'low' ? <Sparkles className="w-5 h-5 md:w-6 md:h-6" /> : <AlertTriangle className="w-5 h-5 md:w-6 md:h-6" />}
              </div>
              <div className="flex-1">
                <h3 className={cn("text-lg md:text-xl font-bold mb-1", insights.riskLevel === 'low' && "text-secondary", insights.riskLevel === 'moderate' && "text-accent", insights.riskLevel === 'high' && "text-destructive")}>
                  {insights.riskLevel === 'low' ? 'Risque faible' : insights.riskLevel === 'moderate' ? 'Risque modéré' : 'Risque élevé'}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
                  <div>
                    <p className="text-muted-foreground">Semaine</p>
                    <p className="font-semibold">{insights.totalWeeklyUnits.toFixed(1)} / {HEALTH_GUIDELINES.maxWeeklyUnits}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Moyenne/jour</p>
                    <p className="font-semibold">{insights.averagePerDay.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Progress */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-3 text-sm md:text-base"><Droplet className="h-4 w-4 md:h-5 md:w-5 text-secondary" />Aujourd'hui</h3>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-2xl md:text-4xl font-bold">{todaysUnits.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">unités</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">
                {HEALTH_GUIDELINES.maxDailyUnits - todaysUnits > 0 ? `${(HEALTH_GUIDELINES.maxDailyUnits - todaysUnits).toFixed(1)} restantes` : `${(todaysUnits - HEALTH_GUIDELINES.maxDailyUnits).toFixed(1)} au-delà`}
              </p>
              <p className="text-xs text-muted-foreground">limite: {HEALTH_GUIDELINES.maxDailyUnits}</p>
            </div>
          </div>
          <div className="h-2 md:h-3 rounded-full bg-muted overflow-hidden">
            <div className={cn("h-full rounded-full transition-all", todaysUnits <= HEALTH_GUIDELINES.lowRiskUnits && "bg-secondary", todaysUnits > HEALTH_GUIDELINES.lowRiskUnits && todaysUnits <= HEALTH_GUIDELINES.maxDailyUnits && "bg-accent", todaysUnits > HEALTH_GUIDELINES.maxDailyUnits && "bg-destructive")} style={{ width: `${Math.min((todaysUnits / HEALTH_GUIDELINES.maxDailyUnits) * 100, 100)}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardContent className="p-3 md:p-5">
          <h3 className="font-semibold mb-3 text-sm md:text-base">Historique</h3>
          <AnimatePresence mode="wait">
            {recentLogs.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-6">
                <Wine className="w-8 h-8 md:w-10 md:h-10 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-muted-foreground text-sm">Aucune consommation</p>
              </motion.div>
            ) : (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                {recentLogs.map(log => (
                  <div key={log.id} className="flex items-center gap-3 p-2 md:p-3 rounded-xl bg-white/[0.03]">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-lg md:text-xl">
                      {DRINK_TYPES[log.drinkType]?.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs md:text-sm">{DRINK_TYPES[log.drinkType]?.label} • {log.volumeCl}cl</p>
                      <p className="text-xs text-muted-foreground">{format(parseISO(log.date), 'd MMM à HH:mm', { locale: fr })}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm md:text-base">{log.units.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">unités</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 md:h-7 md:w-7" onClick={() => deleteLog(log.id)}>
                      <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}