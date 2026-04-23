"use client";

import { useEffect, useState } from 'react';
import { useAlcohol } from '@/features/alcohol/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Check, Activity, Target, Undo2, Flame, TrendingUp, Calendar, AlertTriangle, Scale, User, Info, RotateCcw, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, ReferenceLine, CartesianGrid } from 'recharts';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { CreateDrinkForm } from '@/features/alcohol/types';
import { DRINK_TYPES, HEALTH_GUIDELINES } from '@/features/alcohol/types';
import type { DrinkType } from '@/features/alcohol/types';

const MOOD_EMOJIS: Record<string, string> = {
  happy: '😊', relaxed: '😌', social: '🥂', celebrating: '🎉',
  stressed: '😰', sad: '😢', tired: '😴', neutral: '😐',
};

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
  const { 
    drinks, allDrinks, recentlyUsed, logs, insights, goal, userProfile, lastDeletedLog, bacState,
    loadData, resetDrinks, quickLog, deleteLog, undoDelete, createDrink, customizeDrink,
    getTodayUnits, getWeeklyUnits, setWeeklyGoal, updateUserProfile 
  } = useAlcohol();
  
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [showDrinkCreator, setShowDrinkCreator] = useState(false);
  const [showDrinkCustomizer, setShowDrinkCustomizer] = useState(false);
  const [showGoalSetter, setShowGoalSetter] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<any>(null);
  const [showLogSuccess, setShowLogSuccess] = useState(false);
  const [goalForm, setGoalForm] = useState({ weeklyLimit: 14 });
  const [profileForm, setProfileForm] = useState({ weightKg: 70, sex: 'unspecified' as 'male' | 'female' | 'unspecified' });
  const [newDrink, setNewDrink] = useState<CreateDrinkForm>({ name: 'Bière', type: 'beer', abv: 5, defaultServingSize: 33 });
  const [customizingDrinkType, setCustomizingDrinkType] = useState<DrinkType | null>(null);
  const [customizeForm, setCustomizeForm] = useState({ name: '', abv: 5, defaultServingSize: 33, emoji: '🍺' });
  const [expandedDrink, setExpandedDrink] = useState<string | null>(null);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (userProfile) {
      setProfileForm({ weightKg: userProfile.weightKg, sex: userProfile.sex });
    }
  }, [userProfile]);

  const todaysUnits = getTodayUnits();
  const weeklyUnits = getWeeklyUnits();
  const weeklyLimit = goal?.weeklyLimit || HEALTH_GUIDELINES.maxWeeklyUnits;
  const weeklyProgress = Math.min((weeklyUnits / weeklyLimit) * 100, 100);
  const remainingUnits = weeklyLimit - weeklyUnits;
  const legalLimit = userProfile?.legalLimit || 0.5;

  const handleQuickLog = (drink: any) => { setSelectedDrink(drink); setShowMoodSelector(true); };
  
  const confirmLog = async (mood?: string) => {
    if (!selectedDrink) return;
    await quickLog(selectedDrink, mood as any);
    setShowMoodSelector(false); setSelectedDrink(null); setShowLogSuccess(true);
    setTimeout(() => setShowLogSuccess(false), 1500);
  };
  
  const handleCreateDrink = async () => {
    if (!newDrink.name) return;
    await createDrink(newDrink, DRINK_TYPES[newDrink.type]?.icon);
    setShowDrinkCreator(false);
    setNewDrink({ name: DRINK_TYPES[newDrink.type]?.label || 'Boisson', type: newDrink.type, abv: DRINK_TYPES[newDrink.type]?.defaultAbv || 5, defaultServingSize: DRINK_TYPES[newDrink.type]?.label === 'Vin' ? 12 : DRINK_TYPES[newDrink.type]?.label === 'Spiritueux' ? 4 : 33 });
  };

  const openCustomizer = (drinkType: DrinkType) => {
    const existingDrink = drinks.find(d => d.type === drinkType);
    const defaultData = DRINK_TYPES[drinkType];
    
    setCustomizingDrinkType(drinkType);
    setCustomizeForm({
      name: existingDrink?.name || defaultData?.label || 'Boisson',
      abv: existingDrink?.abv || defaultData?.defaultAbv || 5,
      defaultServingSize: existingDrink?.defaultServingSize || 33,
      emoji: existingDrink?.emoji || defaultData?.icon || '🥤',
    });
    setShowDrinkCustomizer(true);
  };

  const handleCustomizeDrink = async () => {
    if (!customizingDrinkType) return;
    await customizeDrink(customizingDrinkType, customizeForm);
    setShowDrinkCustomizer(false);
    setCustomizingDrinkType(null);
  };

  const handleSetGoal = async () => {
    await setWeeklyGoal(goalForm.weeklyLimit);
    setShowGoalSetter(false);
  };

  const handleUpdateProfile = async () => {
    await updateUserProfile(profileForm);
    setShowProfileEditor(false);
  };

  const handleResetDrinks = async () => {
    if (confirm('Supprimer toutes les boissons personnalisées et réinitialiser ?')) {
      await resetDrinks();
    }
  };

  const recentLogs = logs.slice(0, 7);
  const chartData = bacState.timeline.map(point => ({
    time: format(point.time, 'HH:mm'),
    bac: point.bac,
  }));

  // Grouper les drinks par type
  const drinksByType = drinks.reduce((acc, drink) => {
    if (!acc[drink.type]) acc[drink.type] = [];
    acc[drink.type].push(drink);
    return acc;
  }, {} as Record<DrinkType, typeof drinks>);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
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
          <Button variant="ghost" size="icon" onClick={() => setShowProfileEditor(true)}><User className="w-5 h-5" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setShowGoalSetter(true)}><Target className="w-5 h-5" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setShowDrinkCreator(true)}><Plus className="w-5 h-5" /></Button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/5 rounded-xl p-3">
        <Info className="w-4 h-4 flex-shrink-0" />
        <span>Estimations BAC — ne pas utiliser pour prendre des décisions de conduite</span>
      </div>

      <AnimatePresence>
        {lastDeletedLog && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="bg-accent/20 border border-accent/30 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{lastDeletedLog.drinkEmoji}</span>
              <span className="text-sm">"{lastDeletedLog.drinkName}" supprimé</span>
            </div>
            <Button size="sm" variant="ghost" onClick={undoDelete}><Undo2 className="w-4 h-4 mr-1" />Annuler</Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BAC Card */}
      <Card className={cn("overflow-hidden", bacState.isAboveLimit && "ring-2 ring-destructive/50", bacState.isNearLimit && "ring-2 ring-accent/50")}>
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground mb-1">Alcoolémie actuelle</p>
            <motion.div key={bacState.currentBAC} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className={cn("text-5xl md:text-7xl font-bold",
                bacState.isAboveLimit && "text-destructive",
                bacState.isNearLimit && "text-accent",
                !bacState.isAboveLimit && !bacState.isNearLimit && bacState.currentBAC > 0 && "text-secondary",
                bacState.currentBAC === 0 && "text-muted-foreground"
              )}>
              {bacState.currentBAC.toFixed(2)}
            </motion.div>
            <p className="text-xl text-muted-foreground">g/L</p>
            {bacState.peakBAC > 0 && (
              <div className="mt-2 p-2 rounded-lg bg-white/5 inline-block">
                <p className="text-sm">Pic attendu : <span className="font-bold text-accent">{bacState.peakBAC.toFixed(2)} g/L</span> à {format(bacState.peakTime, 'HH:mm')}</p>
              </div>
            )}
          </div>

          {bacState.isAboveLimit && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 mb-4 p-3 rounded-xl bg-destructive/10 text-destructive">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Au-dessus de la limite légale (0.5 g/L)</span>
            </motion.div>
          )}

          {bacState.timeline.length > 0 && bacState.currentBAC > 0 && (
            <div className="h-40 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                  <defs>
                    <linearGradient id="bacGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(215, 20%, 65%)' }} axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} tickLine={false} />
                  <YAxis domain={[0, Math.ceil(Math.max(...bacState.timeline.map(p => p.bac), legalLimit) * 10) / 10]} tick={{ fontSize: 10, fill: 'hsl(215, 20%, 65%)' }} axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} tickLine={false} tickFormatter={(v) => v.toFixed(1)} />
                  <ReferenceLine y={legalLimit} stroke="hsl(0, 62%, 50%)" strokeDasharray="5 5" strokeWidth={2} />
                  <Area type="monotone" dataKey="bac" stroke="hsl(142, 71%, 45%)" strokeWidth={3} fill="url(#bacGradient)" />
                  <Line type="monotone" dataKey="bac" stroke="hsl(142, 71%, 45%)" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: 'hsl(142, 71%, 45%)' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="flex items-center justify-around text-center border-t border-white/10 pt-4">
            <div>
              <p className="text-xs text-muted-foreground">Pic estimé</p>
              <p className="text-lg font-bold">{bacState.peakBAC > 0 ? format(bacState.peakTime, 'HH:mm') : '—'}</p>
              {bacState.peakBAC > bacState.currentBAC && bacState.peakBAC > 0 && (
                <p className="text-xs text-accent">dans {formatDistanceToNow(bacState.peakTime)}</p>
              )}
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div>
              <p className="text-xs text-muted-foreground">Retour à 0</p>
              <p className="text-lg font-bold">{bacState.zeroTime && bacState.currentBAC > 0 ? format(bacState.zeroTime, 'HH:mm') : '—'}</p>
              {bacState.zeroTime && bacState.currentBAC > 0 && (
                <p className="text-xs text-muted-foreground">{formatDistanceToNow(bacState.zeroTime, { addSuffix: true })}</p>
              )}
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div>
              <p className="text-xs text-muted-foreground">Limite</p>
              <p className="text-lg font-bold text-destructive">{legalLimit} g/L</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Progress Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Cette semaine</span>
            </div>
            <span className="text-sm">
              <span className={cn("font-bold", weeklyUnits > weeklyLimit ? "text-destructive" : "text-secondary")}>{weeklyUnits.toFixed(1)}</span>
              <span className="text-muted-foreground"> / {weeklyLimit} unités</span>
            </span>
          </div>
          <div className="h-3 rounded-full bg-white/10 overflow-hidden mb-3">
            <motion.div initial={{ width: 0 }} animate={{ width: `${weeklyProgress}%` }}
              className={cn("h-full rounded-full", weeklyProgress < 70 && "bg-secondary", weeklyProgress >= 70 && weeklyProgress < 100 && "bg-accent", weeklyProgress >= 100 && "bg-destructive")} />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{remainingUnits > 0 ? `${remainingUnits.toFixed(1)} restantes` : 'Objectif atteint 🎉'}</span>
            {insights?.streak ? (
              <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-orange-500" />{insights.streak}j sans alcool</span>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Customizable Drinks Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-sm">Mes boissons</h3>
            <Button variant="ghost" size="sm" onClick={handleResetDrinks}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Réinitialiser
            </Button>
          </div>
          
          {recentlyUsed.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">Récents</p>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                {recentlyUsed.map(drink => (
                  <motion.button key={drink.id} whileTap={{ scale: 0.9 }} onClick={() => handleQuickLog(drink)}
                    className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-full bg-secondary/20 text-secondary">
                    <span>{drink.emoji}</span>
                    <span className="text-sm font-medium whitespace-nowrap">{drink.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            {Object.entries(drinksByType).map(([type, typeDrinks]) => (
              <div key={type} className="rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedDrink(expandedDrink === type ? null : type)}
                  className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{typeDrinks[0]?.emoji}</span>
                    <div className="text-left">
                      <p className="font-medium text-sm">{typeDrinks[0]?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {typeDrinks[0]?.defaultServingSize} cl · {typeDrinks[0]?.abv}%
                        {typeDrinks[0]?.userId && <span className="ml-2 text-secondary">✎</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={(e) => { e.stopPropagation(); openCustomizer(type as DrinkType); }}
                      className="text-xs"
                    >
                      <Settings className="w-3 h-3" />
                    </Button>
                    {expandedDrink === type ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                
                <AnimatePresence>
                  {expandedDrink === type && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 border-t border-white/10 space-y-2">
                        <p className="text-xs text-muted-foreground mb-2">Consommation rapide</p>
                        <div className="grid grid-cols-3 gap-2">
                          {typeDrinks.map(drink => (
                            <motion.button
                              key={drink.id}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleQuickLog(drink)}
                              className="p-3 rounded-xl bg-white/5 hover:bg-secondary/20 text-center"
                            >
                              <p className="text-lg font-bold">{drink.defaultServingSize}</p>
                              <p className="text-xs text-muted-foreground">cl</p>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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

      {/* Insights Card */}
      {insights && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4" />Tendances</h3>
              <span className={cn("text-sm font-medium", insights.riskLevel === 'low' && "text-secondary", insights.riskLevel === 'moderate' && "text-accent", insights.riskLevel === 'high' && "text-destructive")}>
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
                    <div className="w-full rounded-t-sm" style={{ height: `${Math.max(height, 4)}%`, backgroundColor: day.units <= 2 ? 'hsl(142, 71%, 45%)' : day.units <= 4 ? 'hsl(263, 70%, 58%)' : 'hsl(0, 62%, 50%)' }} />
                    <span className={cn("text-[10px]", isTodayBar && "text-secondary font-medium")}>{format(new Date(day.date), 'EEE', { locale: fr }).charAt(0)}</span>
                  </div>
                );
              })}
            </div>
            {insights.patterns.length > 0 && (
              <div className="space-y-1.5">
                {insights.patterns.map((pattern, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="text-xs text-muted-foreground">{pattern}</motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* History Card */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-sm mb-4">Historique</h3>
          {recentLogs.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">Aucun enregistrement</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log, i) => (
                <motion.div key={log.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <div className="text-2xl">{log.drinkEmoji}</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{log.drinkName}</p>
                    <p className="text-xs text-muted-foreground">{format(parseISO(log.timestamp), 'd MMM à HH:mm', { locale: fr })}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{log.units.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">unités</p>
                  </div>
                  <button onClick={() => deleteLog(log.id)} className="p-1 text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></button>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Drink Dialog */}
      <Dialog open={showDrinkCreator} onOpenChange={setShowDrinkCreator}>
        <DialogContent className="mx-4">
          <DialogHeader><DialogTitle>Créer une consommation</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom</label>
              <Input placeholder="Ma bière préférée" value={newDrink.name} onChange={(e) => setNewDrink(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={newDrink.type} onValueChange={(v) => setNewDrink(prev => ({ ...prev, type: v as DrinkType, name: DRINK_TYPES[v as DrinkType]?.label || 'Boisson', abv: DRINK_TYPES[v as DrinkType]?.defaultAbv || 5 }))}>
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
                <Input type="number" min="0.1" max="100" step="0.1" value={newDrink.abv} onChange={(e) => setNewDrink(prev => ({ ...prev, abv: parseFloat(e.target.value) }))} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Volume (cl)</label>
              <Input type="number" min="1" max="200" value={newDrink.defaultServingSize} onChange={(e) => setNewDrink(prev => ({ ...prev, defaultServingSize: parseInt(e.target.value) }))} />
            </div>
            <Button onClick={handleCreateDrink} className="w-full">Créer</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customize Drink Dialog */}
      <Dialog open={showDrinkCustomizer} onOpenChange={setShowDrinkCustomizer}>
        <DialogContent className="mx-4">
          <DialogHeader><DialogTitle>Personnaliser "{DRINK_TYPES[customizingDrinkType!]?.label}"</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom personnalisé</label>
              <Input placeholder="Ma bière du Friday" value={customizeForm.name} onChange={(e) => setCustomizeForm(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Volume (cl)</label>
                <Select value={String(customizeForm.defaultServingSize)} onValueChange={(v) => setCustomizeForm(prev => ({ ...prev, defaultServingSize: parseInt(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[20, 25, 33, 40, 50, 75, 100].map(size => (
                      <SelectItem key={size} value={String(size)}>{size} cl</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Degré (%)</label>
                <Select value={String(customizeForm.abv)} onValueChange={(v) => setCustomizeForm(prev => ({ ...prev, abv: parseFloat(v) }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 40].map(abv => (
                      <SelectItem key={abv} value={String(abv)}>{abv}%</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Émoji</label>
              <div className="flex gap-2 flex-wrap">
                {['🍺', '🍻', '🍷', '🥃', '🍹', '🍾', '🥂', '🍸', '🧃', '🥤'].map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setCustomizeForm(prev => ({ ...prev, emoji }))}
                    className={cn("w-10 h-10 rounded-lg text-xl flex items-center justify-center", customizeForm.emoji === emoji ? "bg-secondary/30 ring-2 ring-secondary" : "bg-white/10 hover:bg-white/20")}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleCustomizeDrink} className="w-full">Enregistrer</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Goal Setter Dialog */}
      <Dialog open={showGoalSetter} onOpenChange={setShowGoalSetter}>
        <DialogContent className="mx-4">
          <DialogHeader><DialogTitle>Objectif hebdomadaire</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Limite (unités/semaine)</label>
              <Select value={String(goalForm.weeklyLimit)} onValueChange={(v) => setGoalForm({ weeklyLimit: parseInt(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 (strict)</SelectItem>
                  <SelectItem value="10">10 (modéré)</SelectItem>
                  <SelectItem value="14">14 (recommandé OMS)</SelectItem>
                  <SelectItem value="21">21 (souple)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">L'OMS recommande maximum 14 unités par semaine pour les hommes, 7 pour les femmes.</p>
            <Button onClick={handleSetGoal} className="w-full">Enregistrer</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Editor Dialog */}
      <Dialog open={showProfileEditor} onOpenChange={setShowProfileEditor}>
        <DialogContent className="mx-4">
          <DialogHeader><DialogTitle>Paramètres</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2"><Scale className="w-4 h-4" />Poids (kg)</label>
              <Input type="number" min="30" max="200" value={profileForm.weightKg} onChange={(e) => setProfileForm(prev => ({ ...prev, weightKg: parseInt(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sexe (pour estimation BAC)</label>
              <Select value={profileForm.sex} onValueChange={(v) => setProfileForm(prev => ({ ...prev, sex: v as 'male' | 'female' | 'unspecified' }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unspecified">Non spécifié</SelectItem>
                  <SelectItem value="male">Homme (r=0.68)</SelectItem>
                  <SelectItem value="female">Femme (r=0.55)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleUpdateProfile} className="w-full">Enregistrer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}