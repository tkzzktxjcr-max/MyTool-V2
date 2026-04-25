"use client";

import { useEffect, useState } from 'react';
import { useAlcohol } from '@/features/alcohol/hooks';
import { Button } from '@/components/ui/button';
import { Activity, Target, User, Undo2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HEALTH_GUIDELINES } from '@/features/alcohol/types';
import type { DrinkType, MoodType } from '@/features/alcohol/types';
import type { Drink } from '@/features/alcohol/services/drinks.service';

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

export default function AlcoholPage() {
  console.log('[AlcoholPage] Component rendered');
  
  const {
      drinks, libraryDrinks, userDrinks, favorites, recentlyUsed, logs, insights, goal, userProfile, lastDeletedLog, bacState, isSafeToDrive,
      loadData, createDrink, quickLog, deleteLog, undoDelete, toggleFavorite,
      setWeeklyGoal, updateUserProfile, getWeeklyUnits,
    } = useAlcohol();

  console.log('[AlcoholPage] drinks from hook:', drinks.length, 'libraryDrinks:', libraryDrinks.length);

  const [showGoalSetter, setShowGoalSetter] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showCreateDrink, setShowCreateDrink] = useState(false);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  
  // Feature states
  const [quantity, setQuantity] = useState(1);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [showTimeSelector, setShowTimeSelector] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    console.log('[AlcoholPage] useEffect calling loadData');
    loadData();
  }, [loadData]);

  const weeklyUnits = getWeeklyUnits();
  const weeklyLimit = goal?.weeklyLimit || HEALTH_GUIDELINES.maxWeeklyUnits;
  const legalLimit = userProfile?.legalLimit || 0.5;

  const handleSelectDrink = (drink: Drink) => {
    setSelectedDrink(drink);
    setQuantity(1);
    setSelectedTime(undefined);
    setShowTimeSelector(false);
    setShowMoodSelector(true);
  };

  const handleQuickAdd = async (drink: Drink) => {
    // Quick add with default settings (no mood prompt)
    await quickLog(drink, undefined, 1, undefined);
  };

  const handleConfirmLog = async (mood: string) => {
    if (!selectedDrink) return;
    
    const moodValue = mood === 'none' ? undefined : mood as MoodType;
    await quickLog(selectedDrink, moodValue, quantity, selectedTime);
    
    setShowMoodSelector(false);
    setSelectedDrink(null);
    setQuantity(1);
    setSelectedTime(undefined);
  };

  const handleCreateDrink = async (data: { name: string; type: DrinkType; abv: number; defaultServingSize: number; emoji: string }) => {
    await createDrink(data, data.emoji);
    setShowCreateDrink(false);
  };

  const handleSetGoal = async (limit: number) => {
    await setWeeklyGoal(limit);
  };

  const handleUpdateProfile = async (data: { weightKg?: number; sex?: 'male' | 'female' | 'unspecified' }) => {
    await updateUserProfile(data);
  };

  const handleTimeSelect = (timestamp: string) => {
    setSelectedTime(timestamp);
    setShowTimeSelector(false);
  };

  const totalUnits = selectedDrink 
    ? calculateUnits(selectedDrink.defaultServingSize, selectedDrink.abv, quantity)
    : 0;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-secondary/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-secondary" />
            </div>
            Bien-etre
          </h1>
          <p className="text-sm text-muted-foreground">Ton suivi personnalise</p>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => setShowCreateDrink(true)}>
            <span className="text-lg">+</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowProfileEditor(true)}>
            <User className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowGoalSetter(true)}>
                      <Target className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setShowInfo(true)}>
                      <Info className="w-5 h-5" />
                    </Button>
        </div>
      </div>

      {/* Undo delete notification */}
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
              <span className="text-sm">"{lastDeletedLog.drinkName}" supprime</span>
            </div>
            <Button size="sm" variant="ghost" onClick={undoDelete}>
              <Undo2 className="w-4 h-4 mr-1" />
              Annuler
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BAC Card with Sober Countdown */}
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

      {/* Quick Add Favorites Bar */}
      <QuickAddBar
        favorites={favorites}
        onQuickAdd={handleQuickAdd}
        onCreateDrink={() => setShowCreateDrink(true)}
        onToggleFavorite={toggleFavorite}
      />

      {/* Drink Selection & Logging */}
      <div className="space-y-3">
        <DrinkPicker 
          drinks={drinks}
          libraryDrinks={libraryDrinks}
          userDrinks={userDrinks}
          onSelect={handleSelectDrink}
          onCreate={handleCreateDrink}
          onToggleFavorite={toggleFavorite}
        />

        {/* Mood Selection with Quantity & Time */}
        <AnimatePresence>
          {showMoodSelector && selectedDrink && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 10 }}
              className="p-4 rounded-2xl bg-card border border-white/10 space-y-4"
            >
              {/* Drink info with quantity */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedDrink.emoji}</span>
                  <div>
                    <p className="font-medium">{selectedDrink.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedDrink.abv}% - {selectedDrink.defaultServingSize} cl
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
                  className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors border border-white/10 rounded-xl"
                >
                  Modifier l'heure...
                </button>
              )}

              {showTimeSelector && (
                <TimeSelector onSelect={handleTimeSelect} />
              )}

              {selectedTime && (
                <div className="flex items-center justify-between px-3 py-2 bg-accent/10 rounded-xl">
                  <span className="text-sm text-accent">Horodatage personnalise</span>
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
                className="w-full bg-secondary hover:bg-secondary/80"
              >
                Confirmer ({quantity} {quantity === 1 ? 'verre' : 'verres'} = {totalUnits.toFixed(1)} unites)
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
                className="w-full"
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
      
      {/* History with retroactive indicators */}
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
    </div>
  );
}