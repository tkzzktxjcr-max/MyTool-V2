import { motion } from 'framer-motion';
import { Trophy, Lock, Star, Award, Gem, Leaf, Zap } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export interface Badge {
  id: string;
  emoji: string;
  name: string;
  description: string;
  requirement: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

interface BadgesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStreak: number;
  weeklyUnits: number;
  weeklyLimit: number;
  totalDaysTracked: number;
}

// Badge icon mapping
const BADGE_ICON_MAP: Record<string, { icon: React.ComponentType<any>; color: string }> = {
  'first-week': { icon: Award, color: '#F59E0B' },
  'streak-7': { icon: Trophy, color: '#FBBF24' },
  'streak-30': { icon: Trophy, color: '#FCD34D' },
  'rhythm-master': { icon: Gem, color: '#A78BFA' },
  'first-log': { icon: Star, color: '#FBBF24' },
  'week-perfect': { icon: Gem, color: '#8B5CF6' },
  'moderate-month': { icon: Leaf, color: '#22C55E' },
  'mindful-sipper': { icon: Leaf, color: '#86EFAC' },
  'weekend-warrior': { icon: Zap, color: '#FB923C' },
};

const BADGES: Badge[] = [
  {
    id: 'first-week',
    emoji: '1ère semaine',
    name: "1ère semaine",
    description: '追踪了一周',
    requirement: '使用应用7天',
    unlocked: false,
  },
  {
    id: 'streak-7',
    emoji: 'Série de 7',
    name: 'Série de 7',
    description: '7 jours sans alcool',
    requirement: '连续7天不饮酒',
    unlocked: false,
  },
  {
    id: 'streak-30',
    emoji: 'Série de 30',
    name: 'Série de 30',
    description: '30 jours sobre',
    requirement: '连续30天不饮酒',
    unlocked: false,
  },
  {
    id: 'rhythm-master',
    emoji: 'Maître du rythme',
    name: 'Maître du rythme',
    description: '3 semaines sous objectif',
    requirement: '3周低于目标',
    unlocked: false,
  },
  {
    id: 'first-log',
    emoji: 'Premier pas',
    name: 'Premier pas',
    description: '记录第一杯',
    requirement: '记录你的第一杯饮品',
    unlocked: false,
  },
  {
    id: 'week-perfect',
    emoji: 'Semaine parfaite',
    name: 'Semaine parfaite',
    description: '0酒精摄入的一周',
    requirement: '整整一周不饮酒',
    unlocked: false,
  },
  {
    id: 'moderate-month',
    emoji: 'Modéré du mois',
    name: 'Modéré du mois',
    description: 'Monthly moderate',
    requirement: '连续4周适度饮酒',
    unlocked: false,
  },
  {
    id: 'mindful-sipper',
    emoji: 'Sippeur conscient',
    name: 'Sippeur conscient',
    description: 'mindful sipper',
    requirement: '连续10天只喝1-2杯',
    unlocked: false,
  },
  {
    id: 'weekend-warrior',
    emoji: 'Guerrier du week-end',
    name: 'Guerrier du week-end',
    description: '周末战士',
    requirement: '连续8周周末饮酒少于5杯',
    unlocked: false,
  },
];

export default function BadgesSheet({
  open,
  onOpenChange,
  currentStreak,
  weeklyUnits,
  weeklyLimit,
  totalDaysTracked,
}: BadgesSheetProps) {
  // Calculate badge unlock status
  const calculateBadges = (): Badge[] => {
    return BADGES.map(badge => {
      let unlocked = false;
      let progress = 0;

      switch (badge.id) {
        case 'first-week':
          unlocked = totalDaysTracked >= 7;
          progress = Math.min((totalDaysTracked / 7) * 100, 100);
          break;
        case 'streak-7':
          unlocked = currentStreak >= 7;
          progress = Math.min((currentStreak / 7) * 100, 100);
          break;
        case 'streak-30':
          unlocked = currentStreak >= 30;
          progress = Math.min((currentStreak / 30) * 100, 100);
          break;
        case 'rhythm-master':
          unlocked = weeklyUnits <= weeklyLimit && currentStreak >= 21;
          progress = currentStreak >= 21 ? 100 : 0;
          break;
        case 'first-log':
          unlocked = totalDaysTracked >= 1;
          progress = totalDaysTracked >= 1 ? 100 : 0;
          break;
        case 'week-perfect':
          unlocked = weeklyUnits === 0 && totalDaysTracked >= 7;
          progress = weeklyUnits === 0 ? 100 : 0;
          break;
        case 'moderate-month':
          unlocked = currentStreak >= 28;
          progress = Math.min((currentStreak / 28) * 100, 100);
          break;
        case 'mindful-sipper':
          unlocked = currentStreak >= 10;
          progress = Math.min((currentStreak / 10) * 100, 100);
          break;
        case 'weekend-warrior':
          unlocked = currentStreak >= 56;
          progress = Math.min((currentStreak / 56) * 100, 100);
          break;
      }

      return { ...badge, unlocked, progress };
    });
  };

  const badges = calculateBadges();
  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader>
          <div className="flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5 text-accent" />
            <SheetTitle>Tes achievements</SheetTitle>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {unlockedCount}/{badges.length} débloqués
          </p>
        </SheetHeader>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {badges.map((badge, index) => {
            const badgeConfig = BADGE_ICON_MAP[badge.id] || { icon: Award, color: '#9CA3AF' };
            const IconComponent = badgeConfig.icon;
            
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex flex-col items-center p-3 rounded-2xl text-center transition-all relative",
                  badge.unlocked
                    ? "bg-accent/20 border border-accent/30"
                    : "bg-white/5 border border-white/10 opacity-60"
                )}
              >
                {badge.unlocked ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 10 }}
                    className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                    style={{ backgroundColor: badgeConfig.color + '30' }}
                  >
                    <IconComponent className="w-5 h-5" style={{ color: badgeConfig.color }} />
                  </motion.div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted/20 flex items-center justify-center mb-2">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                <p className={cn(
                  "text-xs font-medium",
                  badge.unlocked ? "text-accent" : "text-muted-foreground"
                )}>
                  {badge.unlocked ? badge.name : '???'}
                </p>
                
                {/* Progress bar for locked badges */}
                {!badge.unlocked && badge.progress !== undefined && badge.progress > 0 && (
                  <div className="w-full mt-2 h-1 rounded-full bg-muted/20 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${badge.progress}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-accent/50 rounded-full"
                    />
                  </div>
                )}

                {/* Sparkle effect for unlocked badges */}
                {badge.unlocked && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    className="absolute -top-1 -right-1"
                  >
                    <Star className="w-3 h-3 text-accent fill-accent" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Motivation message */}
        <div className="mt-6 p-4 rounded-2xl bg-secondary/10 border border-secondary/20">
          {unlockedCount === 0 ? (
            <p className="text-sm text-center text-secondary">
              Chaque parcours commence par un premier pas. Continue !
            </p>
          ) : unlockedCount < badges.length / 2 ? (
            <p className="text-sm text-center text-secondary">
              Tu es sur la bonne voie ! {badges.length - unlockedCount} badges à débloquer.
            </p>
          ) : (
            <p className="text-sm text-center text-secondary">
              Impressionnant ! Tu es un vrai champion du rythme.
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}