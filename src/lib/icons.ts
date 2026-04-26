import { 
  Beer, Wine, Apple, Coffee, GlassWater, WineOff,
  Target, Scale, TrendingDown, Dumbbell, Ban, Circle,
  Award, Trophy, Star, Gem, Leaf, Zap,
  Smile, PartyPopper, Frown, Moon, Heart,
  Sparkles, Check, CheckCircle2, AlertCircle, Clock, AlertTriangle,
  Plus, X, RotateCcw, Settings,
  ThumbsUp, ThumbsDown, TrendingUp, Shield, Lock,
  Home, Calendar, Users, User, UserRound, LogOut,
  Flame, Sun, Sunset, CupSoda
} from 'lucide-react';

export const DRINK_ICONS: Record<string, { icon: React.ComponentType<any>; color?: string }> = {
  beer: { icon: Beer, color: '#F59E0B' },
  lager: { icon: Beer, color: '#F59E0B' },
  pilsner: { icon: Beer, color: '#F59E0B' },
  stout: { icon: Beer, color: '#1F2937' },
  wheat_beer: { icon: Beer, color: '#FCD34D' },
  ipa: { icon: Beer, color: '#F59E0B' },
  ale: { icon: Beer, color: '#F59E0B' },
  wine: { icon: Wine, color: '#7C3AED' },
  red_wine: { icon: Wine, color: '#7C3AED' },
  white_wine: { icon: Wine, color: '#A78BFA' },
  rose_wine: { icon: Wine, color: '#F472B6' },
  champagne: { icon: Wine, color: '#FBBF24' },
  sparkling: { icon: Wine, color: '#FCD34D' },
  spirit: { icon: GlassWater, color: '#EF4444' },
  whisky: { icon: GlassWater, color: '#EF4444' },
  vodka: { icon: GlassWater, color: '#3B82F6' },
  rum: { icon: GlassWater, color: '#F97316' },
  tequila: { icon: GlassWater, color: '#22C55E' },
  gin: { icon: GlassWater, color: '#06B6D4' },
  brandy: { icon: GlassWater, color: '#A16207' },
  cognac: { icon: GlassWater, color: '#A16207' },
  calvados: { icon: Apple, color: '#92400E' },
  cocktail: { icon: CupSoda, color: '#EC4899' },
  martini: { icon: CupSoda, color: '#D946EF' },
  mojito: { icon: CupSoda, color: '#22C55E' },
  margarita: { icon: CupSoda, color: '#F59E0B' },
  old_fashioned: { icon: GlassWater, color: '#92400E' },
  cosmopolitan: { icon: CupSoda, color: '#EC4899' },
  daiquiri: { icon: CupSoda, color: '#FCD34D' },
  pina_colada: { icon: CupSoda, color: '#FCD34D' },
  aperol_spritz: { icon: Wine, color: '#FB923C' },
  cider: { icon: Apple, color: '#A3E635' },
  sake: { icon: CupSoda, color: '#E5E7EB' },
  soju: { icon: GlassWater, color: '#3B82F6' },
  sangria: { icon: Wine, color: '#DC2626' },
  sherry: { icon: Wine, color: '#A16207' },
  port: { icon: Wine, color: '#7C2D12' },
  other: { icon: CupSoda, color: '#9CA3AF' },
  custom: { icon: Sparkles, color: '#A78BFA' },
};

export const GOAL_ICONS: Record<string, React.ComponentType<any>> = {
  discover: Target, moderate: Scale, reduce: TrendingDown, sport: Dumbbell, quit: Ban,
};

export const BADGE_ICONS: Record<string, { icon: React.ComponentType<any>; name: string }> = {
  'first-week': { icon: Award, name: 'Badge' },
  'streak-7': { icon: Trophy, name: 'Badge' },
  'streak-30': { icon: Trophy, name: 'Badge' },
  'rhythm-master': { icon: Trophy, name: 'Badge' },
  'first-log': { icon: Star, name: 'Badge' },
  'week-perfect': { icon: Gem, name: 'Badge' },
  'moderate-month': { icon: Leaf, name: 'Badge' },
  'mindful-sipper': { icon: Leaf, name: 'Badge' },
  'weekend-warrior': { icon: Zap, name: 'Badge' },
};

export const MOOD_ICONS: Record<string, { icon: React.ComponentType<any>; label: string }> = {
  happy: { icon: Smile, label: 'Heureux' },
  relaxed: { icon: Coffee, label: 'Détendu' },
  social: { icon: Users, label: 'Social' },
  celebrating: { icon: PartyPopper, label: 'Fête' },
  stressed: { icon: AlertCircle, label: 'Stress' },
  sad: { icon: Frown, label: 'Triste' },
  tired: { icon: Moon, label: 'Fatigue' },
  neutral: { icon: Circle, label: 'Neutre' },
};

export const UI_ICONS = {
  celebration: PartyPopper, sparkle: Sparkles, heart: Heart, check: Check, checkCircle: CheckCircle2, alert: AlertCircle, clock: Clock, warning: AlertTriangle,
};

export const TIME_ICONS = {
  morning: { icon: Coffee, label: 'Matin' },
  afternoon: { icon: Sun, label: 'Après-midi' },
  evening: { icon: Sunset, label: 'Soirée' },
  night: { icon: Moon, label: 'Nuit' },
};

export const getDrinkIcon = (type: string) => DRINK_ICONS[type] || { icon: CupSoda, color: '#9CA3AF' };
export const getMoodIcon = (mood: string) => MOOD_ICONS[mood] || { icon: Circle, label: mood };