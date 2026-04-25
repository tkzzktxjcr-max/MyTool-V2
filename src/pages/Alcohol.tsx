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
import WeeklyProgressCard from './alcohol/WeeklyProgressCard';
import InsightsCard from './alcohol/InsightsCard';
import HistoryCard from './alcohol/HistoryCard';
import { GoalSetterDialog, ProfileEditorDialog, CreateDrinkDialog } from './alcohol/dialogs';
import DrinkPicker from './alcohol/DrinkPicker';
import MoodSelector from './alcohol/MoodSelector';

export default function AlcoholPage() {
  const { 
    drinks, recentlyUsed, logs, insights, goal, userProfile, lastDeletedLog, bacState,
    loadData, createDrink, quickLog, deleteLog, undoDelete,
    setWeeklyGoal, updateUserProfile, getWeeklyUnits,
  } = useAlcohol();

  const [showGoalSetter, setShowGoalSetter] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showCreateDrink, setShowCreateDrink] = useState(false);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);

  useEffect(() => { loadData(); }, [loadData]);

  const weeklyUnits = getWeeklyUnits();
  const weeklyLimit = goal?.weeklyLimit || HEALTH_GUIDELINES.maxWeeklyUnits;
  const legalLimit = userProfile?.legalLimit || 0.5;

  const handleSelectDrink = (drink: Drink) => {
    setSelectedDrink(drink);
    setShowMoodSelector(true);
  };

  const handleConfirmLog = async (mood: string) => {
    if (!selectedDrink) return;
    await quickLog(selectedDrink, mood as MoodType);
    setShowMoodSelector(false);
    setSelectedDrink(null);
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

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
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
        </div>
      </div>

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

      <BACCard
        currentBAC={bacState.currentBAC}
        peakBAC={bacState.peakBAC}
        peakTime={bacState.peakTime}
        zeroTime={bacState.zeroTime}
        timeline={bacState.timeline}
        isAboveLimit={bacState.isAboveLimit}
        isNearLimit={bacState.isNearLimit}
        legalLimit={legalLimit}
      />

      <div className="space-y-3">
        <DrinkPicker 
          drinks={drinks} 
          onSelect={handleSelectDrink}
          onCreate={handleCreateDrink}
        />

        <AnimatePresence>
          {showMoodSelector && selectedDrink && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 10 }}
              className="p-4 rounded-2xl bg-card border border-white/10"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedDrink.emoji}</span>
                  <span className="font-medium">{selectedDrink.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setShowMoodSelector(false); setSelectedDrink(null); }}>
                  Annuler
                </Button>
              </div>
              <MoodSelector onSelect={handleConfirmLog} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <WeeklyProgressCard weeklyUnits={weeklyUnits} weeklyLimit={weeklyLimit} streak={insights?.streak} />
      <InsightsCard insights={insights} />
      <HistoryCard logs={logs} onDeleteLog={deleteLog} />

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
    </div>
  );
}