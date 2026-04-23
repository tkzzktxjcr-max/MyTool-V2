"use client";

import { useEffect, useState } from 'react';
import { useAlcohol } from '@/features/alcohol/hooks';
import { Button } from '@/components/ui/button';
import { Activity, Target, User, Plus, Undo2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HEALTH_GUIDELINES, DRINK_TYPES } from '@/features/alcohol/types';
import type { DrinkType } from '@/features/alcohol/types';

import BACCardComponent from './alcohol/BACCardComponent';
import WeeklyProgressComponent from './alcohol/WeeklyProgressComponent';
import DrinksList from './alcohol/DrinksList';
import InsightsComponent from './alcohol/InsightsComponent';
import HistoryComponent from './alcohol/HistoryComponent';
import { CreateDrinkDialog, CustomizeDrinkDialog, GoalSetterDialog, ProfileEditorDialog } from './alcohol/DialogsComponent';

export default function AlcoholPage() {
  const { drinks, recentlyUsed, logs, insights, goal, userProfile, lastDeletedLog, bacState, loadData, resetDrinks, createDrink, customizeDrink, quickLog, deleteLog, undoDelete, setWeeklyGoal, updateUserProfile, getTodayUnits, getWeeklyUnits } = useAlcohol();

  const [showDrinkCreator, setShowDrinkCreator] = useState(false);
  const [showDrinkCustomizer, setShowDrinkCustomizer] = useState(false);
  const [showGoalSetter, setShowGoalSetter] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [customizingDrinkType, setCustomizingDrinkType] = useState<DrinkType | null>(null);
  const [customizeForm, setCustomizeForm] = useState({ name: '', abv: 5, defaultServingSize: 33, emoji: '🍺' });

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (userProfile) setCustomizeForm({ name: userProfile.weightKg.toString(), abv: 5, defaultServingSize: 33, emoji: '🍺' });
  }, [userProfile]);

  const weeklyUnits = getWeeklyUnits();
  const weeklyLimit = goal?.weeklyLimit || HEALTH_GUIDELINES.maxWeeklyUnits;
  const legalLimit = userProfile?.legalLimit || 0.5;

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

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-secondary/20 flex items-center justify-center"><Activity className="w-4 h-4 text-secondary" /></div>
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
        <span>💡</span><span>Estimations BAC — ne pas utiliser pour prendre des décisions de conduite</span>
      </div>

      <AnimatePresence>
        {lastDeletedLog && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-accent/20 border border-accent/30 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2"><span className="text-lg">{lastDeletedLog.drinkEmoji}</span><span className="text-sm">"{lastDeletedLog.drinkName}" supprimé</span></div>
            <Button size="sm" variant="ghost" onClick={undoDelete}><Undo2 className="w-4 h-4 mr-1" />Annuler</Button>
          </motion.div>
        )}
      </AnimatePresence>

      <BACCardComponent currentBAC={bacState.currentBAC} peakBAC={bacState.peakBAC} peakTime={bacState.peakTime} zeroTime={bacState.zeroTime} timeline={bacState.timeline} isAboveLimit={bacState.isAboveLimit} isNearLimit={bacState.isNearLimit} legalLimit={legalLimit} />

      <WeeklyProgressComponent weeklyUnits={weeklyUnits} weeklyLimit={weeklyLimit} streak={insights?.streak} />

      <DrinksList drinks={drinks} recentlyUsed={recentlyUsed} onQuickLog={quickLog} onCustomize={openCustomizer} onReset={resetDrinks} />

      <InsightsComponent insights={insights} />

      <HistoryComponent logs={logs} onDeleteLog={deleteLog} />

      <CreateDrinkDialog open={showDrinkCreator} onOpenChange={setShowDrinkCreator} onCreate={createDrink} />

      <CustomizeDrinkDialog open={showDrinkCustomizer} onOpenChange={setShowDrinkCustomizer} onCustomize={async (data) => { if (customizingDrinkType) { await customizeDrink(customizingDrinkType, data); setShowDrinkCustomizer(false); setCustomizingDrinkType(null); } }} drinkType={customizingDrinkType} initialData={customizeForm} />

      <GoalSetterDialog open={showGoalSetter} onOpenChange={setShowGoalSetter} onSetGoal={setWeeklyGoal} initialLimit={goal?.weeklyLimit || HEALTH_GUIDELINES.maxWeeklyUnits} />

      <ProfileEditorDialog open={showProfileEditor} onOpenChange={setShowProfileEditor} onUpdateProfile={updateUserProfile} initialData={{ weightKg: userProfile?.weightKg || 70, sex: userProfile?.sex || 'unspecified' }} />
    </div>
  );
}