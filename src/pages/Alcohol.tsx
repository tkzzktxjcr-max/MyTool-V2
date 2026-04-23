"use client";

import { useEffect, useState } from 'react';
import { useAlcohol } from '@/features/alcohol/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Wine, X, Check, Activity, Target, Undo2, Flame, TrendingUp, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { CreateDrinkForm } from '@/features/alcohol/types';
import { DRINK_TYPES, HEALTH_GUIDELINES } from '@/features/alcohol/types';
import type { DrinkType } from '@/features/alcohol/types';
import { useAuth } from '@/features/auth/context';

const MOOD_EMOJIS: Record<string, string> = {
  happy: '😊', relaxed: '😌', social: '🥂', celebrating: '🎉',
  stressed: '😰', sad: '😢', tired: '😴', neutral: '😐',
};

const DrinkPill = ({ drink, onClick }: { drink: any; onClick: () => void }) => (
  <motion.button 
    whileTap={{ scale: 0.95 }} 
    onClick={onClick} 
    className="flex items-center gap-2 px-4 py-2 rounded-full glass-card hover:bg-white/10 transition-colors"
  >
    <span className="text-lg">{drink.emoji}</span>
    <span className="text-sm font-medium">{drink.name}</span>
  </motion.button>
);

const MoodSelector = ({ onSelect }: { onSelect: (mood: string) => void }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-4 gap-2 p-2">
    {Object.entries(MOOD_EMOJIS).map(([mood, emoji]) => (
      <button key={mood} onClick={() => onSelect(mood)} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-colors">
        <span className="text-2xl">{emoji}</span>
        <span className="text-xs text-muted-foreground capitalize">{mood}</span>
      </button>
    ))}
  </motion.div>
);

export default function AlcoholPage() {
  const { user } = useAuth();
  const { 
    drinks, allDrinks, recentlyUsed, logs, insights, goal, lastDeletedLog,
    loadData, quickLog, deleteLog, undoDelete, createDrink, 
    getTodayUnits, getWeeklyUnits, setWeeklyGoal 
  } = useAlcohol();
  
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [showDrinkCreator, setShowDrinkCreator] = useState(false);
  const [showGoalSetter, setShowGoalSetter] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<any>(null);
  const [showLogSuccess, setShowLogSuccess] = useState(false);
  const [goalForm, setGoalForm] = useState({ weeklyLimit: 14 });
  const [newDrink, setNewDrink] = useState<CreateDrinkForm>({ name: '', type: 'beer', abv: 5, defaultServingSize: 50 });

  useEffect(() => { loadData(); }, [loadData]);

  const todaysUnits = getTodayUnits();
  const weeklyUnits = getWeeklyUnits();
  const weeklyLimit = goal?.weeklyLimit || HEALTH_GUIDELINES.maxWeeklyUnits;
  const weeklyProgress = Math.min((weeklyUnits / weeklyLimit) * 100, 100);
  const remainingUnits = weeklyLimit - weeklyUnits;

  const handleQuickLog = (drink: any) => { setSelectedDrink(drink); setShowMoodSelector(true); };
  
  const confirmLog = async (mood?: string) => {
    if (!selectedDrink) return;
    await quickLog(selectedDrink, mood as any);
    setShowMoodSelector(false); setSelectedDrink(null); setShowLogSuccess(true);
    setTimeout(() => setShowLogSuccess(false), 1500);
  };
  
  const handleCreateDrink = async () => {
    if (!newDrink.name || !user?.$id) return;
    await createDrink(newDrink, DRINK_TYPES[newDrink.type]?.icon, user.$id);
    setShowDrinkCreator(false);
    setNewDrink({ name: '', type: 'beer', abv: 5, defaultServingSize: 50 });
  };

  const handleSetGoal = async () => {
    await setWeeklyGoal(goalForm.weeklyLimit);
    setShowGoalSetter(false);
  };

  const recentLogs = logs.slice(0, 7);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-secondary/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-secondary" />
            </div>
            Bien-être
          </h1>
          <p className="text-sm text-muted-foreground">Suivi discret et personnel</p>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setShowGoalSetter(true)}>
            <Target className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowDrinkCreator(true)}>
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Undo Banner */}
      <AnimatePresence>
        {lastDeletedLog && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-accent/20 border border-accent/30 rounded-xl p-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{lastDeletedLog.drinkEmoji}</span>
              <span className="text-sm">"{lastDeletedLog.drinkName}" supprimé</span>
            </div>
            <Button size="sm" variant="ghost" onClick={undoDelete}>
              <Undo2 className="w-4 h-4 mr-1" />
              Annuler
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weekly Progress */}
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Cette semaine</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm">
                <span className={cn("font-bold", weeklyUnits > weeklyLimit ? "text-destructive" : "text-secondary")}>
                  {weeklyUnits.toFixed(1)}
                </span>
                <span className="text-muted-foreground"> / {weeklyLimit}</span>
              </span>
            </div>
          </div>
          
          <div className="h-3 rounded-full bg-white/10 overflow-hidden mb-3">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${weeklyProgress}%` }}
              transition={{ duration: 0.5 }}
              className={cn(
                "h-full rounded-full",
                weeklyProgress < 70 && "bg-secondary",
                weeklyProgress >= 70 && weeklyProgress < 100 && "bg-accent",
                weeklyProgress >= 100 && "bg-destructive"
              )}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{remainingUnits > 0 ? `${remainingUnits.toFixed(1)} restantes` : 'Objectif atteint 🎉'}</span>
            {insights?.streak ? (
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500" />
                {insights.streak}j sans alcool
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Today's Progress */}
      <Card className={cn("relative overflow-hidden transition-all duration-500", showLogSuccess && "ring-2 ring-secondary")}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Aujourd'hui</p>
              <div className="flex items-baseline gap-1">
                <span className={cn(
                  "text-4xl font-bold",
                  todaysUnits <= 2 && "text-secondary",
                  todaysUnits > 2 && todaysUnits <= 4 && "text-accent",
                  todaysUnits > 4 && "text-destructive"
                )}>{todaysUnits.toFixed(1)}</span>
                <span className="text-muted-foreground">unités</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm">
                {remainingUnits > 0 ? (
                  <span className="text-muted-foreground">{remainingUnits.toFixed(1)} restantes</span>
                ) : (
                  <span className="text-destructive">{Math.abs(remainingUnits).toFixed(1)} au-delà</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">max: {HEALTH_GUIDELINES.maxDailyUnits}</p>
            </div>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((todaysUnits / HEALTH_GUIDELINES.maxDailyUnits) * 100, 100)}%` }}
              transition={{ duration: 0.5 }}
              className={cn(
                "h-full rounded-full",
                todaysUnits <= 2 && "bg-secondary",
                todaysUnits > 2 && todaysUnits <= 4 && "bg-accent",
                todaysUnits > 4 && "bg-destructive"
              )}
            />
          </div>
          <AnimatePresence>
            {showLogSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 flex items-center justify-center bg-secondary/20 rounded-2xl"
              >
                <Check className="w-12 h-12 text-secondary" />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Quick Log */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-sm">Ajouter</h3>
            {recentlyUsed.length > 0 && (
              <span className="text-xs text-muted-foreground">Récents</span>
            )}
          </div>
          
          {recentlyUsed.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-3 -mx-4 px-4">
              {recentlyUsed.map(drink => (
                <motion.button
                  key={drink.id}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleQuickLog(drink)}
                  className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-full bg-secondary/20 text-secondary"
                >
                  <span>{drink.emoji}</span>
                  <span className="text-sm font-medium whitespace-nowrap">{drink.name}</span>
                </motion.button>
              ))}
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
            {allDrinks.slice(0, 8).map(drink => (
              <DrinkPill 
                key={drink.id} 
                drink={drink} 
                onClick={() => handleQuickLog(drink)} 
              />
            ))}
          </div>

          <AnimatePresence>
            {showMoodSelector && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Comment vous sentez-vous ?</span>
                  <button onClick={() => confirmLog()} className="text-xs text-secondary">Passer</button>
                </div>
                <MoodSelector onSelect={confirmLog} />
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Insights */}
      {insights && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Tendances
              </h3>
              <span className={cn(
                "text-sm font-medium",
                insights.riskLevel === 'low' && "text-secondary",
                insights.riskLevel === 'moderate' && "text-accent",
                insights.riskLevel === 'high' && "text-destructive"
              )}>
                {insights.riskLevel === 'low' && '✨ Faible'}
                {insights.riskLevel === 'moderate' && '⚠️ Modéré'}
                {insights.riskLevel === 'high' && '⚠️ Élevé'}
              </span>
            </div>
            
            <div className="flex items-end justify-between h-16 gap-1 mb-3">
              {insights.dailyTrend.map((day, i) => {
                const maxUnits = Math.max(...insights.dailyTrend.map(d => d.units), 1);
                const height = (day.units / maxUnits) * 100;
                const isTodayBar = i === 6;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className="w-full rounded-t-sm"
                      style={{ 
                        height: `${Math.max(height, 4)}%`, 
                        backgroundColor: day.units <= 2 ? 'hsl(142, 71%, 45%)' : day.units <= 4 ? 'hsl(263, 70%, 58%)' : 'hsl(0, 62%, 50%)' 
                      }}
                    />
                    <span className={cn("text-[10px]", isTodayBar && "text-secondary font-medium")}>
                      {format(new Date(day.date), 'EEE', { locale: fr }).charAt(0)}
                    </span>
                  </div>
                );
              })}
            </div>

            {insights.patterns.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {insights.patterns.map((pattern, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-xs text-muted-foreground"
                  >
                    {pattern}
                  </motion.div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-white/10">
              <span>Limite: {HEALTH_GUIDELINES.maxDailyUnits}/jour</span>
              <span>Total: {insights.totalWeeklyUnits.toFixed(1)} / {weeklyLimit}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent History */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-sm mb-4">Historique</h3>
          {recentLogs.length === 0 ? (
            <div className="text-center py-8">
              <Wine className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Aucun enregistrement</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <div className="text-2xl">{log.drinkEmoji}</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{log.drinkName}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(log.timestamp), 'd MMM à HH:mm', { locale: fr })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{log.units.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">unités</p>
                  </div>
                  <button 
                    onClick={() => deleteLog(log.id)}
                    className="p-1 text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Drink Dialog */}
      <Dialog open={showDrinkCreator} onOpenChange={setShowDrinkCreator}>
        <DialogContent className="mx-4">
          <DialogHeader><DialogTitle>Créer une recette</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom</label>
              <Input 
                placeholder="Ma bière préférée"
                value={newDrink.name}
                onChange={(e) => setNewDrink(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select 
                  value={newDrink.type} 
                  onValueChange={(v) => setNewDrink(prev => ({ ...prev, type: v as DrinkType, abv: DRINK_TYPES[v as DrinkType]?.defaultAbv || 5 }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(DRINK_TYPES).map(([type, data]) => (
                      <SelectItem key={type} value={type}>{data.icon} {data.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Degré (%)</label>
                <Input 
                  type="number"
                  min="0.1"
                  max="100"
                  value={newDrink.abv}
                  onChange={(e) => setNewDrink(prev => ({ ...prev, abv: parseFloat(e.target.value) }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Volume (cl)</label>
              <Input 
                type="number"
                min="1"
                max="200"
                value={newDrink.defaultServingSize}
                onChange={(e) => setNewDrink(prev => ({ ...prev, defaultServingSize: parseInt(e.target.value) }))}
              />
            </div>
            <Button onClick={handleCreateDrink} className="w-full">Créer</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Set Goal Dialog */}
      <Dialog open={showGoalSetter} onOpenChange={setShowGoalSetter}>
        <DialogContent className="mx-4">
          <DialogHeader><DialogTitle>Objectif hebdomadaire</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Limite (unités/semaine)</label>
              <Select 
                value={String(goalForm.weeklyLimit)} 
                onValueChange={(v) => setGoalForm({ weeklyLimit: parseInt(v) })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 (strict)</SelectItem>
                  <SelectItem value="10">10 (modéré)</SelectItem>
                  <SelectItem value="14">14 (recommandé)</SelectItem>
                  <SelectItem value="21">21 (souple)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              L'OMS recommande maximum 14 unités par semaine pour un risque faible.
            </p>
            <Button onClick={handleSetGoal} className="w-full">Enregistrer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}