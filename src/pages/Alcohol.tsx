"use client";

import { useEffect, useState } from 'react';
import { useAlcohol } from '@/features/alcohol/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Wine, AlertTriangle, CheckCircle, Droplet, Trash2, Activity, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
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
  const recentLogs = logs.slice(0, 7);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
              <Activity className="w-6 h-6 text-secondary" />
            </div>
            Insights Bien-être
          </h1>
          <p className="text-muted-foreground mt-1">Suivi personnel privé</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Enregistrer une consommation</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type de drink</label>
                <Select value={formData.drinkType} onValueChange={handleDrinkChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(DRINK_TYPES).map(([key, drink]) => (
                      <SelectItem key={key} value={key}>
                        <span className="mr-2">{drink.icon}</span>
                        {drink.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Volume (cl)</label>
                  <Input 
                    type="number" 
                    min="1" 
                    max="200" 
                    value={formData.volumeCl} 
                    onChange={(e) => setFormData(prev => ({ ...prev, volumeCl: parseInt(e.target.value) || 0 }))} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Degré (%)</label>
                  <Input 
                    type="number" 
                    min="0.1" 
                    max="100" 
                    step="0.1" 
                    value={formData.abv} 
                    onChange={(e) => setFormData(prev => ({ ...prev, abv: parseFloat(e.target.value) || 0 }))} 
                    required 
                  />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] text-center">
                <span className="text-sm text-muted-foreground block mb-1">Unités calculées</span>
                <span className="text-2xl font-bold">{calculateUnits(formData.volumeCl, formData.abv).toFixed(1)}</span>
              </div>
              <Button type="submit" className="w-full">Enregistrer</Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Risk Level Card */}
      {insights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className={cn(
            "border-2",
            insights.riskLevel === 'low' && "border-secondary/30 bg-secondary/5",
            insights.riskLevel === 'moderate' && "border-accent/30 bg-accent/5",
            insights.riskLevel === 'high' && "border-destructive/30 bg-destructive/5"
          )}>
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center",
                    insights.riskLevel === 'low' && "bg-secondary/20 text-secondary",
                    insights.riskLevel === 'moderate' && "bg-accent/20 text-accent",
                    insights.riskLevel === 'high' && "bg-destructive/20 text-destructive"
                  )}
                >
                  {insights.riskLevel === 'low' ? (
                    <Sparkles className="w-8 h-8" />
                  ) : (
                    <AlertTriangle className="w-8 h-8" />
                  )}
                </motion.div>
                
                <div className="flex-1">
                  <h3 className={cn(
                    "text-2xl font-bold mb-2",
                    insights.riskLevel === 'low' && "text-secondary",
                    insights.riskLevel === 'moderate' && "text-accent",
                    insights.riskLevel === 'high' && "text-destructive"
                  )}>
                    {insights.riskLevel === 'low' ? 'Risque faible' : insights.riskLevel === 'moderate' ? 'Risque modéré' : 'Risque élevé'}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Cette semaine</p>
                      <p className="text-xl font-bold">
                        {insights.totalWeeklyUnits.toFixed(1)} / {HEALTH_GUIDELINES.maxWeeklyUnits} unités
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Moyenne / jour</p>
                      <p className="text-xl font-bold">
                        {insights.averagePerDay.toFixed(1)} unités
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Today's Progress */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Droplet className="h-5 w-5 text-secondary" />
              Aujourd'hui
            </h3>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-4xl font-bold">{todaysUnits.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">unités aujourd'hui</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">
                  {HEALTH_GUIDELINES.maxDailyUnits - todaysUnits > 0 
                    ? `${(HEALTH_GUIDELINES.maxDailyUnits - todaysUnits).toFixed(1)} restantes`
                    : `${(todaysUnits - HEALTH_GUIDELINES.maxDailyUnits).toFixed(1)} au-delà`
                  }
                </p>
                <p className="text-xs text-muted-foreground">limite: {HEALTH_GUIDELINES.maxDailyUnits}</p>
              </div>
            </div>
            
            <div className="mt-4 h-4 rounded-full bg-white/10 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((todaysUnits / HEALTH_GUIDELINES.maxDailyUnits) * 100, 100)}%` }}
                transition={{ duration: 0.5 }}
                className={cn(
                  "h-full rounded-full",
                  todaysUnits <= HEALTH_GUIDELINES.lowRiskUnits && "bg-secondary",
                  todaysUnits > HEALTH_GUIDELINES.lowRiskUnits && todaysUnits <= HEALTH_GUIDELINES.maxDailyUnits && "bg-accent",
                  todaysUnits > HEALTH_GUIDELINES.maxDailyUnits && "bg-destructive"
                )}
              />
            </div>
            
            {/* Weekly Chart */}
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-3">7 derniers jours</p>
              <div className="flex items-end gap-2 h-16">
                {insights?.dailyTrend.map((day, i) => {
                  const maxUnits = 6;
                  const height = Math.min((day.units / maxUnits) * 100, 100);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                        className={cn(
                          "w-full rounded-t-lg",
                          day.units <= 2 && "bg-secondary/60",
                          day.units > 2 && day.units <= 4 && "bg-accent/60",
                          day.units > 4 && "bg-destructive/60"
                        )}
                      />
                      <span className="text-[10px] text-muted-foreground">
                        {format(parseISO(day.date), 'EEE', { locale: fr }).charAt(0)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent History */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4">Historique récent</h3>
            
            <AnimatePresence mode="wait">
              {recentLogs.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12"
                >
                  <Wine className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">Aucune consommation enregistrée</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {recentLogs.map(log => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03]"
                    >
                      <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-2xl">
                        {DRINK_TYPES[log.drinkType]?.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">
                          {DRINK_TYPES[log.drinkType]?.label} • {log.volumeCl}cl à {log.abv}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(log.date), 'd MMM à HH:mm', { locale: fr })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{log.units.toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">unités</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteLog(log.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}