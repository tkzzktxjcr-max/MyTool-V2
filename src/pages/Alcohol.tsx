"use client";

import { useEffect, useState } from 'react';
import { useAlcohol } from '@/features/alcohol/hooks';
import { Button } from '@/components/ui/button';
import { Activity, Target, User, Undo2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HEALTH_GUIDELINES } from '@/features/alcohol/types';
import type { DrinkType } from '@/features/alcohol/types';

import QuickDrinkPanel from './alcohol/QuickDrinkPanel';
import BACCardComponent from './alcohol/BACCardComponent';
import WeeklyProgressComponent from './alcohol/WeeklyProgressComponent';
import InsightsComponent from './alcohol/InsightsComponent';
import HistoryComponent from './alcohol/HistoryComponent';
import { GoalSetterDialog, ProfileEditorDialog } from './alcohol/DialogsComponent';

export default function AlcoholPage() {
  const { 
    drinks, recentlyUsed, logs, insights, goal, userProfile, lastDeletedLog, bacState,
    loadData, createDrink, quickLog, deleteLog, undoDelete,
    setWeeklyGoal, updateUserProfile, getWeeklyUnits,
  } = useAlcohol();

  const [showGoalSetter, setShowGoalSetter] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  useEffect(() => { loadData(); }, [loadData]);

  const weeklyUnits = getWeeklyUnits();
  const weeklyLimit = goal?.weeklyLimit || HEALTH_GUIDELINES.maxWeeklyUnits;
  const legalLimit = userProfile?.legalLimit || 0.5;

  const handleCreateDrink = async (data: { name: string; type: DrinkType; abv: number; defaultServingSize: number; emoji: string }) => {
    await createDrink(data, data.emoji);
  };

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
          <p className="text-sm text-muted-foreground">Ton suivi personnalisé</p>
        </div>
        <div className="flex gap-1">
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
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-accent/20 border border-accent/30 rounded-xl p-3 flex items-center justify-between">
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

      <BACCardComponent
        currentBAC={bacState.currentBAC}
        peakBAC={bacState.peakBAC}
        peakTime={bacState.peakTime}
        zeroTime={bacState.zeroTime}
        timeline={bacState.timeline}
        isAboveLimit={bacState.isAboveLimit}
        isNearLimit={bacState.isNearLimit}
        legalLimit={legalLimit}
      />

      <QuickDrinkPanel
        drinks={drinks}
        recentlyUsed={recentlyUsed}
        logs={logs}
        insights={insights}
        goal={goal}
        userProfile={userProfile}
        bacState={bacState}
        onQuickLog={quickLog as any}
        onCreateDrink={handleCreateDrink}
        onDeleteLog={deleteLog as any}
        onSetWeeklyGoal={setWeeklyGoal as any}
        onUpdateProfile={updateUserProfile as any}
        weeklyUnits={weeklyUnits}
        weeklyLimit={weeklyLimit}
      />

      <WeeklyProgressComponent weeklyUnits={weeklyUnits} weeklyLimit={weeklyLimit} streak={insights?.streak} />
      <InsightsComponent insights={insights} />
      <HistoryComponent logs={logs} onDeleteLog={deleteLog} />

      <GoalSetterDialog
        open={showGoalSetter}
        onOpenChange={setShowGoalSetter}
        onSetGoal={setWeeklyGoal as any}
        initialLimit={weeklyLimit}
      />

      <ProfileEditorDialog
        open={showProfileEditor}
        onOpenChange={setShowProfileEditor}
        onUpdateProfile={updateUserProfile as any}
        initialData={{ weightKg: userProfile?.weightKg || 70, sex: userProfile?.sex || 'unspecified' }}
      />
    </div>
  );
}