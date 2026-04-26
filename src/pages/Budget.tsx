"use client";

import { useEffect, useState, useCallback } from 'react';
import { useBudget } from '@/features/budget/hooks';
import { useAlcohol } from '@/features/alcohol/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Wallet, ArrowUpRight, ArrowDownRight, Trash2, Wine, Sparkles, Trophy, TrendingDown, TrendingUp, Coffee, Music, Book, Plane } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { BUDGET_CATEGORIES, type BudgetCategory, type CreateBudgetEntryForm } from '@/features/budget/types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import ConfettiAnimation from './alcohol/ConfettiAnimation';

export default function BudgetPage() {
  const { 
    entries, loading, loadEntries, createEntry, deleteEntry, 
    financialStats, totalExpenses, totalIncome, balance, 
    budgetUsed, budgetStatus, budgetFeedback, expensesByCategory,
    monthlyBudgetGoal, setMonthlyBudgetGoal, achievements, newAchievements,
    familyId, setFamilyId 
  } = useBudget();
  
  const { logs, loadData } = useAlcohol();
  
  // Local state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [formData, setFormData] = useState<CreateBudgetEntryForm>({
    amount: 0, 
    category: 'other', 
    description: '', 
    date: new Date(), 
    type: 'expense'
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [showBudgetGoal, setShowBudgetGoal] = useState(false);

  // Initialize on mount
  useEffect(() => { 
    loadEntries(); 
    loadData();
    // Set demo family ID if not set
    if (!familyId) {
      setFamilyId('demo-family');
    }
  }, []);

  // Show confetti on new achievements
  useEffect(() => {
    if (newAchievements.length > 0) {
      setShowConfetti(true);
    }
  }, [newAchievements]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEntry({ ...formData, type });
      setIsDialogOpen(false);
      setFormData({ amount: 0, category: 'other', description: '', date: new Date(), type: 'expense' });
    } catch (error) {
      console.error('[BudgetPage] Error creating entry:', error);
    }
  };

  // Handle delete
  const handleDelete = async (entryId: string) => {
    try {
      await deleteEntry(entryId);
    } catch (error) {
      console.error('[BudgetPage] Error deleting entry:', error);
    }
  };

  // Recent entries sorted by date
  const recentEntries = [...entries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Chart data
  const monthlyTrend = [
    { month: 'Jan', spent: 85 },
    { month: 'Fév', spent: 72 },
    { month: 'Mar', spent: 95 },
    { month: 'Avr', spent: 68 },
    { month: 'Mai', spent: financialStats?.monthlySpend || 0 },
  ];

  // Equivalents display
  const equivalents = [
    { icon: Coffee, name: 'cafés', count: financialStats?.yearlyEquivalents?.coffees || 0, color: '#92400E' },
    { icon: Music, name: 'concerts', count: financialStats?.yearlyEquivalents?.concert || 0, color: '#7C3AED' },
    { icon: Book, name: 'livres', count: financialStats?.yearlyEquivalents?.books || 0, color: '#059669' },
    { icon: Plane, name: 'week-ends', count: financialStats?.yearlyEquivalents?.weekendTrips || 0, color: '#0891B2' },
  ].filter(e => e.count > 0);

  // Unlocked achievements
  const unlockedAchievements = achievements.filter((a: any) => a.unlockedAt);

  return (
    <div className="space-y-4 md:space-y-6 max-w-6xl mx-auto">
      <ConfettiAnimation 
        show={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
        message={`${newAchievements.length} achievement${newAchievements.length > 1 ? 's' : ''} débloqué${newAchievements.length > 1 ? 's' : ''} !`} 
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-12 md:h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Wallet className="w-4 h-4 md:w-6 md:h-6 text-accent" />
            </div>
            Budget Alcool
          </h1>
          <p className="text-muted-foreground text-sm">{format(new Date(), 'MMMM yyyy', { locale: fr })}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-1" />Nouvelle entrée
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-4">
            <DialogHeader>
              <DialogTitle>{type === 'expense' ? 'Nouvelle dépense' : 'Nouveau revenu'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type selector */}
              <div className="flex gap-1 p-1 bg-muted rounded-xl">
                <button 
                  type="button" 
                  onClick={() => { setType('expense'); setFormData(prev => ({ ...prev, type: 'expense' })); }}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                    type === 'expense' ? "bg-destructive/20 text-destructive" : "text-muted-foreground"
                  )}
                >
                  Dépense
                </button>
                <button 
                  type="button" 
                  onClick={() => { setType('income'); setFormData(prev => ({ ...prev, type: 'income' })); }}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                    type === 'income' ? "bg-secondary/20 text-secondary" : "text-muted-foreground"
                  )}
                >
                  Revenu
                </button>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Montant (EUR)</label>
                <Input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  placeholder="0.00" 
                  value={formData.amount || ''} 
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))} 
                  required 
                  className="text-lg font-semibold" 
                />
              </div>

              {/* Category (for expenses) */}
              {type === 'expense' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Catégorie</label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, category: v as BudgetCategory }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(BUDGET_CATEGORIES).map(([key, cat]) => (
                        <SelectItem key={key} value={key}>
                          {cat.icon} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input 
                  placeholder="Courses, loisirs..." 
                  value={formData.description} 
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} 
                />
              </div>

              <Button type="submit" className="w-full">Ajouter</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Budget Goal Card */}
      <Card className={cn(
        "transition-all",
        budgetStatus === 'under' && "border-secondary/30",
        budgetStatus === 'near' && "border-[hsl(38,92%,50%)]/30",
        budgetStatus === 'over' && "border-destructive/30"
      )}>
        <CardContent className="p-4 md:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center",
                budgetStatus === 'under' && "bg-secondary/20",
                budgetStatus === 'near' && "bg-[hsl(38,92%,50%)]/20",
                budgetStatus === 'over' && "bg-destructive/20"
              )}>
                {budgetStatus === 'under' && <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-secondary" />}
                {budgetStatus === 'near' && <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-[hsl(38,92%,50%)]" />}
                {budgetStatus === 'over' && <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-destructive" />}
              </div>
              <div>
                <h3 className="font-semibold text-sm md:text-base">Objectif mensuel</h3>
                <p className="text-xs text-muted-foreground">Limite de dépenses</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg md:text-2xl font-bold">{monthlyBudgetGoal}€</span>
              <Button variant="ghost" size="sm" onClick={() => setShowBudgetGoal(!showBudgetGoal)} className="text-xs">
                Modifier
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-3 rounded-full bg-white/10 overflow-hidden mb-2">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(budgetUsed, 100)}%` }}
              transition={{ duration: 0.8 }}
              className={cn(
                "h-full rounded-full",
                budgetStatus === 'under' && "bg-secondary",
                budgetStatus === 'near' && "bg-[hsl(38,92%,50%)]",
                budgetStatus === 'over' && "bg-destructive"
              )}
            />
          </div>

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0€</span>
            <span>{Math.round(budgetUsed)}% utilisé</span>
          </div>

          {/* Feedback */}
          <div className={cn(
            "mt-3 p-3 rounded-xl text-sm",
            budgetStatus === 'under' && "bg-secondary/10 text-secondary",
            budgetStatus === 'near' && "bg-[hsl(38,92%,50%)]/10 text-[hsl(38,92%,50%)]",
            budgetStatus === 'over' && "bg-destructive/10 text-destructive"
          )}>
            {budgetFeedback}
          </div>

          {/* Edit goal */}
          {showBudgetGoal && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 pt-3 border-t border-white/10"
            >
              <div className="flex gap-2">
                <Input 
                  type="number" 
                  value={monthlyBudgetGoal}
                  onChange={(e) => setMonthlyBudgetGoal(parseInt(e.target.value) || 0)}
                  className="flex-1"
                />
                <Button onClick={() => setShowBudgetGoal(false)}>OK</Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Alcohol Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-secondary/20">
          <CardContent className="p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <Wine className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm md:text-base">Dépenses alcool estimées</h3>
                  <p className="text-xs text-muted-foreground">Basées sur ta consommation</p>
                </div>
              </div>
              <span className="text-xl md:text-2xl font-bold text-secondary">
                {financialStats?.monthlySpend?.toFixed(2) || '0.00'}€
              </span>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div className="p-3 rounded-xl bg-white/5 text-center">
                <p className="text-lg font-bold">{financialStats?.weeklySpend?.toFixed(0) || 0}€</p>
                <p className="text-xs text-muted-foreground">Cette semaine</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 text-center">
                <p className="text-lg font-bold">{financialStats?.yearlySpend?.toFixed(0) || 0}€</p>
                <p className="text-xs text-muted-foreground">Cette année</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 text-center">
                <p className="text-lg font-bold text-[hsl(38,92%,50%)]">-{financialStats?.potentialSavings?.toFixed(0) || 0}€</p>
                <p className="text-xs text-muted-foreground">Épargne possible</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 text-center">
                <p className="text-lg font-bold">{financialStats?.yearlyEquivalents?.coffees || 0}</p>
                <p className="text-xs text-muted-foreground">Équivalent cafés</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Equivalents */}
      {financialStats?.yearlySpend > 50 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="p-4 md:p-5">
              <h3 className="font-semibold flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                Tu pourrais aussi t'offrir...
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {equivalents.map((eq, index) => {
                  const IconComp = eq.icon;
                  return (
                    <motion.div
                      key={eq.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 text-center"
                    >
                      <IconComp className="w-6 h-6 mx-auto mb-1" style={{ color: eq.color }} />
                      <p className="text-xl font-bold">{eq.count}</p>
                      <p className="text-xs text-muted-foreground">{eq.name}</p>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        <Card className="p-3 md:p-0">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-1">
              <ArrowDownRight className="h-3 w-3 md:h-4 md:w-4 text-destructive" />
              Dépenses (hors alco)
            </div>
            <div className="text-lg md:text-2xl font-bold text-destructive">
              -{totalExpenses.toFixed(2)}€
            </div>
          </CardContent>
        </Card>
        <Card className="p-3 md:p-0">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-1">
              <ArrowUpRight className="h-3 w-3 md:h-4 md:w-4 text-secondary" />
              Revenus
            </div>
            <div className="text-lg md:text-2xl font-bold text-secondary">
              +{totalIncome.toFixed(2)}€
            </div>
          </CardContent>
        </Card>
        <Card className="p-3 md:p-0">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mb-1">
              <Wallet className="h-3 w-3 md:h-4 md:w-4" />
              Solde
            </div>
            <div className={cn(
              "text-lg md:text-2xl font-bold",
              balance >= 0 ? "text-secondary" : "text-destructive"
            )}>
              {balance >= 0 ? '+' : ''}{balance.toFixed(2)}€
            </div>
          </CardContent>
        </Card>
        <Card className="p-3 md:p-0">
          <CardContent className="pt-4 md:pt-6">
            <div className="text-xs md:text-sm text-muted-foreground mb-1">
              Projection annuelle
            </div>
            <div className="text-lg md:text-2xl font-bold">
              {financialStats?.yearlyProjection?.toFixed(0) || 0}€
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
        {/* Chart */}
        <Card>
          <CardContent className="p-3 md:p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-3 text-sm md:text-base">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
              Évolution mensuelle
            </h3>
            <div className="h-40 md:h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrend}>
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12, fill: 'hsl(215, 20%, 65%)' }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: 'hsl(215, 20%, 65%)' }} 
                    axisLine={false} 
                    tickLine={false} 
                    tickFormatter={(v) => `${v}€`} 
                  />
                  <Bar dataKey="spent" radius={[6, 6, 0, 0]}>
                    {monthlyTrend.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === monthlyTrend.length - 1 ? 'hsl(142, 71%, 45%)' : 'hsl(215, 20%, 25%)'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardContent className="p-3 md:p-5">
            <h3 className="font-semibold mb-3 text-sm md:text-base">Dernières transactions</h3>
            {recentEntries.length === 0 ? (
              <div className="text-center py-6">
                <Wallet className="w-8 h-8 md:w-10 md:h-10 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-muted-foreground text-sm">Aucune transaction</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentEntries.map(entry => (
                  <div key={entry.id} className="flex items-center gap-3 p-2 md:p-3 rounded-xl bg-white/[0.03]">
                    <div 
                      className="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-sm"
                      style={{ backgroundColor: (BUDGET_CATEGORIES[entry.category]?.color || '#9CA3AF') + '20' }}
                    >
                      {BUDGET_CATEGORIES[entry.category]?.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs md:text-sm truncate">
                        {entry.description || BUDGET_CATEGORIES[entry.category]?.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(entry.date), 'd MMM')}
                      </p>
                    </div>
                    <div className={cn(
                      "font-semibold text-xs md:text-sm",
                      entry.type === 'expense' ? "text-destructive" : "text-secondary"
                    )}>
                      {entry.type === 'expense' ? '-' : '+'}{entry.amount.toFixed(2)}€
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 md:h-7 md:w-7" 
                      onClick={() => handleDelete(entry.id)}
                    >
                      <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardContent className="p-4 md:p-5">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 md:w-5 md:h-5 text-accent" />
            Achievements Budget
            <span className="text-xs text-muted-foreground ml-auto">
              {unlockedAchievements.length}/{achievements.length}
            </span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {achievements.map((achievement: any, index: number) => {
              const isUnlocked = !!achievement.unlockedAt;
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "flex flex-col items-center p-3 rounded-xl text-center transition-all",
                    isUnlocked 
                      ? "bg-accent/20 border border-accent/30" 
                      : "bg-white/5 border border-white/10 opacity-50"
                  )}
                >
                  <span className="text-2xl mb-1">{achievement.icon}</span>
                  <p className={cn(
                    "text-xs font-medium",
                    isUnlocked ? "text-accent" : "text-muted-foreground"
                  )}>
                    {isUnlocked ? achievement.name : '???'}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}