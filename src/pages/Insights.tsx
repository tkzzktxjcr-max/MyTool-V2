import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlcohol } from '@/features/alcohol/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Trophy, Flame, Sparkles, TrendingUp, Calendar, Target, ChevronRight, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import BadgesSheet from '@/features/alcohol/components/BadgesSheet';
import MonthlyHeatmap from '@/features/alcohol/components/MonthlyHeatmap';
import InsightsCard from '@/features/alcohol/components/InsightsCard';
import WeeklyProgressCard from '@/features/alcohol/components/WeeklyProgressCard';
import { HEALTH_GUIDELINES } from '@/features/alcohol/types';

export default function InsightsPage() {
  const navigate = useNavigate();
  const { insights, logs, goal, userProfile, getWeeklyUnits } = useAlcohol();
  
  const [showBadges, setShowBadges] = useState(false);

  const weeklyUnits = getWeeklyUnits();
  const weeklyLimit = goal?.weeklyLimit || HEALTH_GUIDELINES.maxWeeklyUnits;
  const currentStreak = insights?.streak || 0;

  const totalDaysTracked = logs.length > 0 
    ? Math.ceil((Date.now() - new Date(logs[logs.length - 1]?.timestamp || Date.now()).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-secondary/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-secondary" />
            </div>
            Insights
          </h1>
          <p className="text-sm text-muted-foreground">
            Comprends tes habitudes
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setShowBadges(true)} className="rounded-xl" title="Badges">
          <Trophy className="w-5 h-5" />
        </Button>
      </div>

      {/* Weekly Progress Card */}
      <WeeklyProgressCard 
        weeklyUnits={weeklyUnits} 
        weeklyLimit={weeklyLimit} 
        streak={currentStreak} 
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="flex items-center justify-center gap-1 text-secondary mb-1">
              <Flame className="w-5 h-5" />
              <span className="text-2xl font-bold">{currentStreak}</span>
            </div>
            <p className="text-xs text-muted-foreground">Jours sobre</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold mb-1">
              {insights?.totalWeeklyUnits.toFixed(1) || '0'}
            </div>
            <p className="text-xs text-muted-foreground">Unités/semaine</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold mb-1">
              {insights?.averagePerDay.toFixed(1) || '0'}
            </div>
            <p className="text-xs text-muted-foreground">Moyenne/jour</p>
          </CardContent>
        </Card>
      </div>

      {/* Insights Card */}
      <InsightsCard insights={insights} />

      {/* Monthly Heatmap */}
      <MonthlyHeatmap logs={logs} />

      {/* Patterns & Tips */}
      {insights?.patterns && insights.patterns.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-secondary" />
              Tes patterns
            </h3>
            <div className="space-y-3">
              {insights.patterns.map((pattern, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/5"
                >
                  <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-secondary" />
                  </div>
                  <p className="text-sm">{pattern}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {insights?.recommendations && insights.recommendations.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-accent" />
              Recommandations
            </h3>
            <div className="space-y-3">
              {insights.recommendations.map((rec, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-accent/10 border border-accent/20"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4 text-accent" />
                  </div>
                  <p className="text-sm text-accent">{rec}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-muted-foreground">Actions rapides</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate('/wellbeing')}
            className="h-14 rounded-xl justify-start px-4 bg-white/5 border-white/10 hover:bg-white/10"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center mr-3">
              <Sparkles className="w-5 h-5 text-secondary" />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">Ajouter un verre</p>
              <p className="text-xs text-muted-foreground">Enregistrer une consommation</p>
            </div>
          </Button>

          <Button 
            variant="outline" 
            onClick={() => navigate('/budget')}
            className="h-14 rounded-xl justify-start px-4 bg-white/5 border-white/10 hover:bg-white/10"
          >
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center mr-3">
              <BarChart3 className="w-5 h-5 text-accent" />
            </div>
            <div className="text-left">
              <p className="font-medium text-sm">Voir le budget</p>
              <p className="text-xs text-muted-foreground">Gérer mes dépenses</p>
            </div>
          </Button>
        </div>
      </div>

      {/* Badges Sheet */}
      <BadgesSheet
        open={showBadges}
        onOpenChange={setShowBadges}
        currentStreak={currentStreak}
        weeklyUnits={weeklyUnits}
        weeklyLimit={weeklyLimit}
        totalDaysTracked={totalDaysTracked}
      />
    </div>
  );
}