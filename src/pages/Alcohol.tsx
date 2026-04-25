"use client";

import { useEffect, useState } from 'react';
import { useAlcohol } from '@/features/alcohol/hooks';
import { Button } from '@/components/ui/button';
import { Activity, Target, User, Info, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HEALTH_GUIDELINES } from '@/features/alcohol/types';
import type { DrinkType, MoodType } from '@/features/alcohol/types';
import type { Drink } from '@/features/alcohol/service';

import BACCard from './alcohol/BACCard';
import AlcoholInfo from './AlcoholInfo';
import WeeklyProgressCard from './alcohol/WeeklyProgressCard';
import InsightsCard from './alcohol/InsightsCard';
import HistoryCard from './alcohol/HistoryCard';
import { GoalSetterDialog, ProfileEditorDialog, CreateDrinkDialog } from './alcohol/dialogs';
import DrinkPicker from './alcohol/DrinkPicker';
import MoodSelector from './alcohol/MoodSelector';
import QuantitySelector, { calculateUnits } from './alcohol/QuantitySelector';
import TimeSelector from './alcohol/TimeSelector';
import QuickAddBar from './alcohol/QuickAddBar';
import FloatingActionButton from './alcohol/FloatingActionButton';
import ConfettiAnimation from './alcohol/ConfettiAnimation';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function AlcoholPage() {
  const {
    drinks, libraryDrinks, userDrinks, favorites, recentlyUsed, logs, insights, goal, userProfile, lastDeletedLog, bacState, isSafeToDrive,
    loadData, createDrink, quickLog, deleteLog, undoDelete, toggleFavorite,
    setWeeklyGoal, updateUserProfile, getWeeklyUnits,
  } = useAlcohol();

  const [showGoalSetter, setShowGoalSetter] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showCreateDrink, setShowCreateDrink] = useState(false);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showDrinkPicker, setShowDrinkPicker] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Feature states
  const [quantity, setQuantity] = useState(1);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  const [previousWeeklyUnits, setPreviousWeeklyUnits] = useState(0);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const weeklyUnits = getWeeklyUnits();
  const weeklyLimit = goal?.weeklyLimit || HEALTH_GUIDELINES.maxWeeklyUnits;
  const legalLimit = userProfile?.legalLimit || 0.5;

  // Check for goal achievement celebration
  useEffect(() => {
    const wasUnderLimit = previousWeeklyUnits <= weeklyLimit;
    const isNowUnderLimit = weeklyUnits <= weeklyLimit;
    const justReachedLimit = wasUnderLimit && !isNowUnderLimit && weeklyUnits <= weeklyLimit * 1.1;
    
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
    toast.success(`${drink.emoji} ${drink.name} ajouté !`, {
      icon: '✨',
      duration: 2000,
      className: 'premium-toast',
    });
    await quickLog(drink, undefined, 1, undefined);
  };

  const handleConfirmLog = async (mood: string) => {
    if (!selectedDrink) return;
    
    const moodValue = mood === 'none' ? undefined : mood as MoodType;
    await quickLog(selectedDrink, moodValue, quantity, selectedTime);
    
    toast.success(`${selectedDrink.emoji} ${selectedDrink.name} (×${quantity}) ajouté !`, {
      icon: '✅',
      duration: 2000,
      className: 'premium-toast',
    });
    
    setShowMoodSelector(false);
    setSelectedDrink(null);
    setQuantity(1);
    setSelectedTime(undefined);
  };

  const handleCreateDrink = async (data: { name: string; type: DrinkType; abv: number; defaultServingSize: number; emoji: string }) => {
    await createDrink(data, data.emoji);
    toast.success('Boisson créée !', {
      icon: '🎉',
      duration: 2000,
    });
    setShowCreateDrink(false);
  };

  const handleSetGoal = async (limit: number) => {
    await setWeeklyGoal(limit);
    toast.success('Objectif mis à jour !', {
      icon: '🎯',
      duration: 2000,
    });
  };

  const handleUpdateProfile = async (data: { weightKg?: number; sex?: 'male' | 'female' | 'unspecified' }) => {
    await updateUserProfile(data);
    toast.success('Profil mis à jour !', {
      icon: '✅',
      duration: 2000,
    });
  };

  const handleTimeSelect = (timestamp: string) => {
    setSelectedTime(timestamp);
    setShowTimeSelector(false);
  };

  const totalUnits = selectedDrink 
    ? calculateUnits(selectedDrink.defaultServingSize, selectedDrink.abv, quantity)
    : 0;

  const isFirstUse = logs.length === 0;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Confetti Celebration */}
      <ConfettiAnimation 
        show={showConfetti} 
        onComplete={() => setShowConfetti(false)}
        message="Semaine parfaite !"
        emoji="🌟"
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-secondary/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-secondary" />
            </div>
            Bien-être
          </h1>
          <p className="text-sm text-muted-foreground">
            {isFirstUse ? 'Commence ton suivi' : 'Ton espace personnel'}
          </p>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setShowProfileEditor(true)} className="rounded-xl">
            <User className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowGoalSetter(true)} className="rounded-xl">
            <Target className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowInfo(true)} className="rounded-xl">
            <Info className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Undo delete notification */}
      <AnimatePresence>
        {lastDeletedLog && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: -20, scale: 0.95 }} 
            className="bg-accent/15 border border-accent/25 rounded-2xl p-3 flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{lastDeletedLog.drinkEmoji}</span>
              <div>
                <p className="text-sm font-medium">"{lastDeletedLog.drinkName}"</p>
                <p className="text-xs text-muted-foreground">supprimé</p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={undoDelete} className="rounded-xl">
              Annuler
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BAC Card Hero */}
      <BACCard
        currentBAC={bacState.currentBAC}
        peakBAC={bacState.peakBAC}
        peakTime={bacState.peakTime}
        zeroTime={bacState.zeroTime}
        timeline={bacState.timeline}
        isAboveLimit={bacState.isAboveLimit}
        isNearLimit={bacState.isNearLimit}
        legalLimit={legalLimit}
        safeToDriveTime={bacState.safeToDriveTime}
      />

      {/* Quick Add Favorites Bar - Premium avec BAC Preview */}
      <QuickAddBar
        favorites={favorites}
        onQuickAdd={handleQuickAdd}
        onCreateDrink={() => setShowCreateDrink(true)}
        onToggleFavorite={toggleFavorite}
        showBACPreview={true}
        userProfile={{
          weightKg: userProfile?.weightKg || 70,
          sex: userProfile?.sex || 'unspecified'
        }}
        currentBAC={bacState.currentBAC}
        logs={logs}
      />

      {/* Drink Selection & Logging */}
      <div className="space-y-3">
        {/* Drink Picker Button / Area */}
        <AnimatePresence mode="wait">
          {!showMoodSelector ? (
            <motion.div
              key="picker"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {!showDrinkPicker ? (
                <button
                  onClick={() => setShowDrinkPicker(true)}
                  className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-3 text-muted-foreground hover:bg-white/10 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Ajouter une consommation</span>
                </button>
              ) : (
                <div className="rounded-2xl bg-card border border-white/10 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Choisir une boissons</span>
                    <button 
                      onClick={() => setShowDrinkPicker(false)}
                      className="p-1 rounded-lg hover:bg-white/10"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <DrinkPicker 
                    drinks={drinks}
                    libraryDrinks={libraryDrinks}
                    userDrinks={userDrinks}
                    onSelect={handleSelectDrink}
                    onCreate={handleCreateDrink}
                    onToggleFavorite={toggleFavorite}
                  />
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="mood-selector"
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 10 }}
              className="p-5 rounded-2xl bg-card border border-secondary/30 space-y-4 shadow-lg"
            >
              {/* Drink info with quantity */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedDrink?.emoji}</span>
                  <div>
                    <p className="font-semibold text-base">{selectedDrink?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedDrink?.abv}% - {selectedDrink?.defaultServingSize} cl
                    </p>
                  </div>
                </div>
                <QuantitySelector
                  quantity={quantity}
                  onChange={setQuantity}
                />
              </div>

              {/* Time selector toggle */}
              {!selectedTime && (
                <button
                  onClick={() => setShowTimeSelector(!showTimeSelector)}
                  className="w-full py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors border border-white/10 rounded-xl hover:bg-white/5"
                >
                  Modifier l'heure...
                </button>
              )}

              {showTimeSelector && (
                <TimeSelector onSelect={handleTimeSelect} />
              )}

              {selectedTime && (
                <div className="flex items-center justify-between px-3 py-2 bg-accent/10 rounded-xl">
                  <span className="text-sm text-accent">Horodatage personnalisé</span>
                  <button 
                    onClick={() => setSelectedTime(undefined)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Annuler
                  </button>
                </div>
              )}

              {/* Mood selector */}
              <MoodSelector onSelect={handleConfirmLog} />

              {/* Confirm button with total units */}
              <Button 
                onClick={() => handleConfirmLog('none')}
                className="w-full bg-secondary hover:bg-secondary/80 rounded-xl h-12 text-base font-medium"
              >
                Confirmer ({quantity} {quantity === 1 ? 'verre' : 'verres'} = {totalUnits.toFixed(1)} unités)
              </Button>

              {/* Cancel button */}
              <Button 
                variant="ghost" 
                onClick={() => { 
                  setShowMoodSelector(false); 
                  setSelectedDrink(null);
                  setQuantity(1);
                  setSelectedTime(undefined);
                }} 
                className="w-full rounded-xl"
              >
                Annuler
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Weekly Progress */}
      <WeeklyProgressCard weeklyUnits={weeklyUnits} weeklyLimit={weeklyLimit} streak={insights?.streak} />
      
      {/* Insights */}
      <InsightsCard insights={insights} />
      
      {/* History */}
      <HistoryCard logs={logs} onDeleteLog={deleteLog} />

      {/* Dialogs */}
      <GoalSetterDialog
        open={showGoalSetter}
        onOpenChange={setShowGoalSetter}
        onSetGoal={handleSetGoal}
        initialLimit={weeklyLimit}
      />

      <ProfileEditorDialog
        open={showProfileEditor}
        onOpenChange={setShowProfileEditor}
        onUpdateProfile={handleUpdateProfile}
        initialData={{ weightKg: userProfile?.weightKg || 70, sex: userProfile?.sex || 'unspecified' }}
      />

      <CreateDrinkDialog
        open={showCreateDrink}
        onOpenChange={setShowCreateDrink}
        onCreate={handleCreateDrink}
      />

      <AnimatePresence>
        {showInfo && <AlcoholInfo isModal onClose={() => setShowInfo(false)} />}
      </AnimatePresence>

      {/* Premium Toast Styles */}
      <style>{`
        .premium-toast {
          background: linear-gradient(135deg, hsl(222 47% 11%), hsl(222 47% 15%)) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 1rem !important;
          backdrop-filter: blur(12px) !important;
        }
      `}</style>
    </div>
  );
}