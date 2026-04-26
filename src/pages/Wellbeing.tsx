"use client";

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlcohol } from '@/features/alcohol/hooks';
import { Button } from '@/components/ui/button';
import { Activity, Target, User, Info, Plus, X, RotateCcw, Settings, Check, Beer, Sparkles, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HEALTH_GUIDELINES } from '@/features/alcohol/types';
import type { DrinkType, MoodType } from '@/features/alcohol/types';
import type { Drink } from '@/features/alcohol/services';
import { calculateUnits, calculateUnitsWithQuantity } from '@/features/alcohol/utils/units';
import { getTimeOfDay, type TimeOfDay } from '@/features/alcohol/services';

import BACCard from './alcohol/BACCard';
import AlcoholInfo from './AlcoholInfo';
import WeeklyProgressCard from './alcohol/WeeklyProgressCard';
import InsightsCard from './alcohol/InsightsCard';
import HistoryCard from './alcohol/HistoryCard';
import MonthlyHeatmap from './alcohol/MonthlyHeatmap';
import BadgesSheet from './alcohol/BadgesSheet';
import { GoalSetterDialog, ProfileEditorDialog, CreateDrinkDialog } from './alcohol/dialogs';
import DrinkPicker from './alcohol/DrinkPicker';
import MoodSelector from './alcohol/MoodSelector';
import QuantitySelector from './alcohol/QuantitySelector';
import TimeSelector from './alcohol/TimeSelector';
import QuickAddBar from './alcohol/QuickAddBar';
import ConfettiAnimation from './alcohol/ConfettiAnimation';
import { toast } from 'sonner';
import { AlcoholOnboardingWizard } from '@/components/onboarding/alcohol/AlcoholOnboardingWizard';
import { useAlcoholOnboarding } from '@/components/onboarding/alcohol/useAlcoholOnboarding';

const TIME_LABELS: Record<TimeOfDay, { icon: string; label: string }> = {
  morning: { icon: '☀️', label: 'Bon matin' },
  afternoon: { icon: '☀️', label: 'Bon aprem' },
  evening: { icon: '🌆', label: 'Bonne soiree' },
  night: { icon: '🌙', label: 'Bonne nuit' },
};

export default function WellbeingPage() {
  const navigate = useNavigate();
  const {
    drinks, favorites, suggestedFavorites, currentTimeOfDay,
    logs, insights, goal, userProfile, lastDeletedLog, bacState,
    loadData, createDrink, quickLog, deleteLog, undoDelete, deleteDrink, toggleFavorite,
    setWeeklyGoal, updateUserProfile, getWeeklyUnits,
  } = useAlcohol();

  const { hasCompleted: onboardingCompleted, reset: resetOnboarding } = useAlcoholOnboarding();

  const [showGoalSetter, setShowGoalSetter] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showCreateDrink, setShowCreateDrink] = useState(false);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showDrinkPicker, setShowDrinkPicker] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  const [previousWeeklyUnits, setPreviousWeeklyUnits] = useState(0);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!onboardingCompleted) setShowOnboarding(true);
  }, [onboardingCompleted]);

  const weeklyUnits = getWeeklyUnits();
  const weeklyLimit = goal?.weeklyLimit || HEALTH_GUIDELINES.maxWeeklyUnits;
  const legalLimit = userProfile?.legalLimit || 0.5;

  useEffect(() => {
    if (weeklyUnits > 0 && weeklyUnits <= weeklyLimit * 0.8 && previousWeeklyUnits > weeklyLimit * 0.8) {
      setShowConfetti(true);
    }
    setPreviousWeeklyUnits(weeklyUnits);
  }, [weeklyUnits, weeklyLimit]);

  const handleSelectDrink = (drink: Drink) => {
    setSelectedDrink(drink);
    setQuantity(1);
    setSelectedTime(undefined);
    setShowTimeSelector(false);
    setShowDrinkPicker(false);
    setShowMoodSelector(true);
  };

  const handleQuickAdd = async (drink: Drink) => {
    const drinkUnits = calculateUnits(drink.defaultServingSize, drink.abv);
    const r = userProfile?.sex === 'female' ? 0.55 : 0.68;
    const weight = userProfile?.weightKg || 70;
    const newBAC = bacState.currentBAC + (drinkUnits * 10 * 0.789) / (weight * r);
    const status = newBAC <= legalLimit * 0.8 ? 'OK' : newBAC <= legalLimit ? 'Bientot' : 'Attendre';
    toast.success(`${drink.name}`, { description: `${status} ~${newBAC.toFixed(2)} g/L`, duration: 3000 });
    await quickLog(drink, undefined, 1, undefined);
  };

  const handleConfirmLog = async (mood: string) => {
    if (!selectedDrink) return;
    const moodValue = mood === 'none' ? undefined : mood as MoodType;
    await quickLog(selectedDrink, moodValue, quantity, selectedTime);
    toast.success(`${selectedDrink.name} (x${quantity})`, { description: `+${calculateUnitsWithQuantity(selectedDrink.defaultServingSize, selectedDrink.abv, quantity).toFixed(1)} unites`, duration: 3000 });
    setShowMoodSelector(false);
    setSelectedDrink(null);
    setQuantity(1);
    setSelectedTime(undefined);
  };

  const handleCreateDrink = async (data: { name: string; type: DrinkType; abv: number; defaultServingSize: number; emoji: string }) => {
    await createDrink({ name: data.name, type: data.type, abv: data.abv, defaultServingSize: data.defaultServingSize }, data.emoji);
    toast.success('Boisson creee !');
    setShowCreateDrink(false);
  };

  const handleDeleteDrink = async (drinkId: string) => {
    await deleteDrink(drinkId);
    toast.success('Boisson supprimee');
  };

  const handleSetGoal = async (limit: number) => {
    await setWeeklyGoal(limit);
    toast.success('Objectif mis a jour !');
  };

  const handleUpdateProfile = async (data: { weightKg?: number; sex?: 'male' | 'female' | 'unspecified' }) => {
    await updateUserProfile(data);
    toast.success('Profil mis a jour !');
  };

  const handleTimeSelect = (timestamp: string) => {
    setSelectedTime(timestamp);
    setShowTimeSelector(false);
  };

  const handleOnboardingComplete = () => setShowOnboarding(false);
  const handleRestartOnboarding = () => { resetOnboarding(); setShowOnboarding(true); };

  const totalUnits = selectedDrink ? calculateUnitsWithQuantity(selectedDrink.defaultServingSize, selectedDrink.abv, quantity) : 0;
  const timeInfo = TIME_LABELS[currentTimeOfDay];

  if (showOnboarding && !onboardingCompleted) {
    return <AlcoholOnboardingWizard onComplete={handleOnboardingComplete} onSkip={handleOnboardingComplete} />;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <ConfettiAnimation show={showConfetti} onComplete={() => setShowConfetti(false)} message="Semaine parfaite !" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-secondary/20 flex items-center justify-center"><Activity className="w-4 h-4 text-secondary" /></div>
            Bien-etre
          </h1>
          <p className="text-sm text-muted-foreground">{timeInfo.icon} {timeInfo.label}</p>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={handleRestartOnboarding} className="rounded-xl"><RotateCcw className="w-5 h-5" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setShowProfileEditor(true)} className="rounded-xl"><User className="w-5 h-5" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setShowGoalSetter(true)} className="rounded-xl"><Target className="w-5 h-5" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setShowInfo(true)} className="rounded-xl"><Info className="w-5 h-5" /></Button>
          <Button variant="ghost" size="icon" onClick={() => setShowBadges(true)} className="rounded-xl"><Trophy className="w-5 h-5" /></Button>
          <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} className="rounded-xl"><Settings className="w-5 h-5" /></Button>
        </div>
      </div>

      <AnimatePresence>
        {lastDeletedLog && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-accent/15 border border-accent/25 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><Beer className="w-5 h-5" /></div>
              <div><p className="text-sm font-medium">"{lastDeletedLog.drinkName}"</p><p className="text-xs text-muted-foreground">supprime</p></div>
            </div>
            <Button size="sm" variant="outline" onClick={undoDelete} className="rounded-xl">Annuler</Button>
          </motion.div>
        )}
      </AnimatePresence>

      <BACCard currentBAC={bacState.currentBAC} peakBAC={bacState.peakBAC} peakTime={bacState.peakTime} zeroTime={bacState.zeroTime} timeline={bacState.timeline} isAboveLimit={bacState.isAboveLimit} isNearLimit={bacState.isNearLimit} legalLimit={legalLimit} safeToDriveTime={bacState.safeToDriveTime} />

      <QuickAddBar favorites={favorites} suggestedFavorites={suggestedFavorites} onQuickAdd={handleQuickAdd} onCreateDrink={() => setShowCreateDrink(true)} onToggleFavorite={toggleFavorite} userProfile={{ weightKg: userProfile?.weightKg || 70, sex: userProfile?.sex || 'unspecified' }} currentBAC={bacState.currentBAC} legalLimit={legalLimit} onShowAllDrinks={() => setShowDrinkPicker(true)} />

      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {!showMoodSelector ? (
            <motion.div key="picker" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {!showDrinkPicker ? (
                <button onClick={() => setShowDrinkPicker(true)} className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 text-muted-foreground hover:bg-white/10">
                  <Plus className="w-5 h-5" /><span className="font-medium">Ajouter une consommation</span>
                </button>
              ) : (
                <div className="rounded-2xl bg-card border border-white/10 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Toutes les boissons</span>
                    <button onClick={() => setShowDrinkPicker(false)} className="p-1 rounded-lg hover:bg-white/10"><X className="w-5 h-5" /></button>
                  </div>
                  <DrinkPicker drinks={drinks} onSelect={handleSelectDrink} onCreate={handleCreateDrink} onToggleFavorite={toggleFavorite} onDeleteDrink={handleDeleteDrink} />
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="mood" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="p-5 rounded-2xl bg-card border border-secondary/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center"><Beer className="w-6 h-6 text-secondary" /></div>
                  <div><p className="font-semibold text-base">{selectedDrink?.name}</p><p className="text-xs text-muted-foreground">{selectedDrink?.abv}% - {selectedDrink?.defaultServingSize} cl</p></div>
                </div>
                <QuantitySelector quantity={quantity} onChange={setQuantity} />
              </div>
              {!selectedTime && <button onClick={() => setShowTimeSelector(!showTimeSelector)} className="w-full py-2.5 text-sm text-muted-foreground border border-white/10 rounded-xl hover:bg-white/5">Modifier l'heure...</button>}
              {showTimeSelector && <TimeSelector onSelect={handleTimeSelect} />}
              {selectedTime && <div className="flex items-center justify-between px-3 py-2 bg-accent/10 rounded-xl"><span className="text-sm text-accent">Horodatage personnalise</span><button onClick={() => setSelectedTime(undefined)} className="text-xs text-muted-foreground">Annuler</button></div>}
              <MoodSelector onSelect={handleConfirmLog} />
              <Button onClick={() => handleConfirmLog('none')} className="w-full bg-secondary hover:bg-secondary/80 rounded-xl h-12 text-base font-medium">Confirmer ({quantity} = {totalUnits.toFixed(1)} unites)</Button>
              <Button variant="ghost" onClick={() => { setShowMoodSelector(false); setSelectedDrink(null); setQuantity(1); setSelectedTime(undefined); }} className="w-full rounded-xl">Annuler</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <WeeklyProgressCard weeklyUnits={weeklyUnits} weeklyLimit={weeklyLimit} streak={insights?.streak} />
      <InsightsCard insights={insights} />
      <MonthlyHeatmap logs={logs} onAddDrink={() => setShowDrinkPicker(true)} />
      <HistoryCard logs={logs} onDeleteLog={deleteLog} />

      <GoalSetterDialog open={showGoalSetter} onOpenChange={setShowGoalSetter} onSetGoal={handleSetGoal} initialLimit={weeklyLimit} />
      <ProfileEditorDialog open={showProfileEditor} onOpenChange={setShowProfileEditor} onUpdateProfile={handleUpdateProfile} initialData={{ weightKg: userProfile?.weightKg || 70, sex: userProfile?.sex || 'unspecified' }} />
      <CreateDrinkDialog open={showCreateDrink} onOpenChange={setShowCreateDrink} onCreate={handleCreateDrink} />
      <AnimatePresence>{showInfo && <AlcoholInfo isModal onClose={() => setShowInfo(false)} />}</AnimatePresence>
      <BadgesSheet open={showBadges} onOpenChange={setShowBadges} currentStreak={insights?.streak || 0} weeklyUnits={weeklyUnits} weeklyLimit={weeklyLimit} totalDaysTracked={logs.length > 0 ? Math.ceil((Date.now() - new Date(logs[logs.length - 1].timestamp).getTime()) / 86400000) : 0} />
    </div>
  );
}