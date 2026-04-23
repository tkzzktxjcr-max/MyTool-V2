"use client";

import { useEffect, useState } from 'react';
import { useAlcohol } from '@/features/alcohol/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Wine, X, Check, Activity, Sparkles, Heart, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { CreateDrinkForm } from '@/features/alcohol/types';
import { DRINK_TYPES, HEALTH_GUIDELINES } from '@/features/alcohol/types';
import type { DrinkType } from '@/features/alcohol/types';

// Mini bar chart component
const MiniBar = ({ value, max }: { value: number; max: number }) => (
  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${Math.min((value / max) * 100, 100)}%` }}
      className={cn(
        "h-full rounded-full",
        value <= 2 && "bg-green-500",
        value > 2 && value <= 4 && "bg-purple-500",
        value > 4 && "bg-red-500"
      )}
    />
  </div>
);

// Drink pill button
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

// Mood selector
const MoodSelector = ({ onSelect }: { onSelect: (mood: string) => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
    className="grid grid-cols-4 gap-2 p-2"
  >
    {Object.entries({
      happy: '😊',
      relaxed: '😌',
      social: '🥂',
      celebrating: '🎉',
      stressed: '😰',
      sad: '😢',
      tired: '😴',
      neutral: '😐',
    }).map(([mood, emoji]) => (
      <button
        key={mood}
        onClick={() => onSelect(mood)}
        className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-colors"
      >
        <span className="text-2xl">{emoji}</span>
        <span className="text-xs text-muted-foreground capitalize">{mood}</span>
      </button>
    ))}
  </motion.div>
);

export default function AlcoholPage() {
  const { 
    allDrinks, 
    recentlyUsed, 
    logs, 
    insights, 
    loading, 
    loadData, 
    quickLog, 
    deleteLog, 
    createDrink,
    getTodayUnits,
    calculateUnits,
  } = useAlcohol();

  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [showDrinkCreator, setShowDrinkCreator] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<any>(null);
  const [showLogSuccess, setShowLogSuccess] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | undefined>();

  // New drink form
  const [newDrink, setNewDrink] = useState<CreateDrinkForm>({
    name: '',
    type: 'beer',
    abv: 5,
    defaultServingSize: 50,
  });

  useEffect(() => { loadData(); }, [loadData]);

  const todaysUnits = getTodayUnits();

  const handleQuickLog = (drink: any) => {
    setSelectedDrink(drink);
    setShowMoodSelector(true);
  };

  const confirmLog = async (mood?: string) => {
    if (!selectedDrink) return;
    await quickLog(selectedDrink, 1, mood as any);
    setShowMoodSelector(false);
    setSelectedDrink(null);
    setSelectedMood(undefined);
    setShowLogSuccess(true);
    setTimeout(() => setShowLogSuccess(false), 1500);
  };

  const handleCreateDrink = async () => {
    if (!newDrink.name) return;
    await createDrink(newDrink, DRINK_TYPES[newDrink.type]?.icon);
    setShowDrinkCreator(false);
    setNewDrink({ name: '', type: 'beer', abv: 5, defaultServingSize: 50 });
  };

  const recentLogs = logs.slice(0, 7);
  const todaysLogs = logs.filter(l => isToday(parseISO(l.timestamp));

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-secondary/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-secondary" />
            </div>
            Insights Bien-être
          </h1>
          <p className="text-sm text-muted-foreground">Suivi discret et personnel</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setShowDrinkCreator(true)}>
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      {/* Today's Progress */}
      <Card className={cn(
        "relative overflow-hidden transition-all duration-500",
        showLogSuccess && "ring-2 ring-secondary"
      )}>
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
                )}>
                  {todaysUnits.toFixed(1)}
                </span>
                <span className="text-muted-foreground">unités</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm">
                {HEALTH_GUIDELINES.maxDailyUnits - todaysUnits > 0 ? (
                  <span className="text-muted-foreground">{HEALTH_GUIDELINES.maxDailyUnits - todaysUnits.toFixed(1)} restantes</span>
                ) : (
                  <span className="text-destructive">{(todaysUnits - HEALTH_GUIDELINES.maxDailyUnits).toFixed(1)} au-delà</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">max: {HEALTH_GUIDELINES.maxDailyUnits}</p>
            </div>
          </div>
          
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((todaysUnits / HEALTH_GUIDELINES.maxDailyUnits) * 100, 100}%` }}
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

      {/* Quick Log Section */}
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

      {/* Weekly Chart */}
      {insights && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-sm">Cette semaine</h3>
              <span className={cn(
                "text-sm font-medium",
                insights.riskLevel === 'low' && "text-secondary",
                insights.riskLevel === 'moderate' && "text-accent",
                insights.riskLevel === 'high' && "text-destructive"
              )}>
                {insights.riskLevel === 'low' && '✨ Dans les limites'}
                {insights.riskLevel === 'moderate' && '⚠️ Modéré'}
                {insights.riskLevel === 'high' && '⚠️ Élevé'}
              </span>
            </div>
            
            <div className="flex items-end justify-between h-16 gap-1 mb-3">
              {insights.dailyTrend.map((day, i) => {
                const maxUnits = Math.max(...insights.dailyTrend.map(d => d.units), 1);
                const height = (day.units / maxUnits) * 100;
                const isToday = i === 6;
                
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className="w-full rounded-t-sm"
                      style={{ height: `${Math.max(height, 4}%`, backgroundColor: day.units <= 2 ? 'hsl(142, 71%, 45%)' : day.units <= 4 ? 'hsl(263, 70%, 58%)' : 'hsl(0, 62%, 50%)' }}
                    />
                    <span className={cn("text-[10px]", isToday && "text-secondary font-medium")}>
                      {format(new Date(day.date), 'EEE', { locale: fr }).charAt(0)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Limite: {HEALTH_GUIDELINES.maxDailyUnits} unités/jour</span>
              <span>Total: {insights.totalWeeklyUnits.toFixed(1)} / {HEALTH_GUIDELINES.maxWeeklyUnits}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Patterns */}
      {insights && insights.patterns.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-sm mb-3">Observations</h3>
            <div className="space-y-2">
              {insights.patterns.map((pattern, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-sm text-muted-foreground"
                >
                  {pattern}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Timeline */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-sm mb-4">Historique récent</h3>
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
          <DialogHeader>
            <DialogTitle>Créer une recette</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom</label>
              <Input 
                placeholder="Mon cocktail préféré"
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
                      <SelectItem key={type} value={type}>
                        {data.icon} {data.label}
                      </SelectItem>
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
                  onChange={(e) => setNewDrink(prev => ({ ...prev, abv: parseFloat(e.target.value) })}
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
                onChange={(e) => setNewDrink(prev => ({ ...prev, defaultServingSize: parseInt(e.target.value) })}
              />
            </div>
            <Button onClick={handleCreateDrink} className="w-full">
              Créer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}