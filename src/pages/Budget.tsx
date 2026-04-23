"use client";

import { useEffect, useState } from 'react';
import { useFamily } from '@/features/family/context';
import { useBudget } from '@/features/budget/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Wallet, ArrowUpRight, ArrowDownRight, PieChart as PieChartIcon, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { CreateBudgetEntryForm, BudgetCategory } from '@/features/budget/types';
import { BUDGET_CATEGORIES } from '@/features/budget/types';

export default function BudgetPage() {
  const { family } = useFamily();
  const { entries, loadEntries, createEntry, deleteEntry, totalExpenses, totalIncome, balance, budgetUsed, expensesByCategory } = useBudget();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [formData, setFormData] = useState<CreateBudgetEntryForm>({ amount: 0, category: 'other', description: '', date: new Date(), type: 'expense' });

  useEffect(() => { if (family?.id) loadEntries(); }, [family?.id, loadEntries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createEntry({ ...formData, type });
    setIsDialogOpen(false);
    setFormData({ amount: 0, category: 'other', description: '', date: new Date(), type: 'expense' });
  };

  const pieData = Object.entries(expensesByCategory)
    .filter(([, value]) => (value as number) > 0)
    .map(([key, value]) => ({
      name: BUDGET_CATEGORIES[key as BudgetCategory].label,
      value: value as number,
      icon: BUDGET_CATEGORIES[key as BudgetCategory].icon,
      color: BUDGET_CATEGORIES[key as BudgetCategory].color
    }));

  const recentEntries = [...entries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-accent" />
            </div>
            Budget
          </h1>
          <p className="text-muted-foreground mt-1">{format(new Date(), 'MMMM yyyy', { locale: fr })}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nouvelle entrée</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{type === 'expense' ? 'Nouvelle dépense' : 'Nouveau revenu'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2 p-1 rounded-xl bg-white/5">
                <button 
                  type="button" 
                  onClick={() => { setType('expense'); setFormData(p => ({ ...p, type: 'expense' })); }}
                  className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition-colors", type === 'expense' ? "bg-destructive/20 text-destructive" : "text-muted-foreground")}
                >
                  Dépense
                </button>
                <button 
                  type="button" 
                  onClick={() => { setType('income'); setFormData(p => ({ ...p, type: 'income' })); }}
                  className={cn("flex-1 py-2 rounded-lg text-sm font-medium transition-colors", type === 'income' ? "bg-secondary/20 text-secondary" : "text-muted-foreground")}
                >
                  Revenu
                </button>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Montant (€)</label>
                <Input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  placeholder="0.00" 
                  value={formData.amount || ''} 
                  onChange={(e) => setFormData(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))} 
                  required 
                  className="text-lg font-semibold"
                />
              </div>
              {type === 'expense' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Catégorie</label>
                  <Select value={formData.category} onValueChange={(v) => setFormData(p => ({ ...p, category: v as BudgetCategory }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(BUDGET_CATEGORIES).map(([key, cat]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <span>{cat.icon}</span>
                            {cat.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input 
                  placeholder="Courses, Loyer..." 
                  value={formData.description} 
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} 
                />
              </div>
              <Button type="submit" className="w-full">Ajouter</Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <ArrowDownRight className="h-4 w-4 text-destructive" />
              Dépenses
            </div>
            <div className="text-2xl font-bold text-destructive">
              -{totalExpenses.toFixed(2)}€
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <ArrowUpRight className="h-4 w-4 text-secondary" />
              Revenus
            </div>
            <div className="text-2xl font-bold text-secondary">
              +{totalIncome.toFixed(2)}€
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Wallet className="h-4 w-4" />
              Solde
            </div>
            <div className={cn("text-2xl font-bold", balance >= 0 ? "text-secondary" : "text-destructive")}>
              {balance >= 0 ? '+' : ''}{balance.toFixed(2)}€
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground mb-2">Budget utilisé</div>
            <div className="text-2xl font-bold">{Math.round(budgetUsed)}%</div>
            <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(budgetUsed, 100)}%` }}
                className={cn("h-full rounded-full", budgetUsed > 80 ? "bg-destructive" : "bg-primary")}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Categories breakdown */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <PieChartIcon className="h-5 w-5" />
                Répartition des dépenses
              </h3>
              {pieData.length === 0 ? (
                <div className="text-center py-12">
                  <PieChartIcon className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">Aucune dépense</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pieData.map(item => (
                    <motion.div 
                      key={item.name}
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      className="flex items-center gap-3"
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="flex-1 text-sm">{item.name}</span>
                      <span className="font-medium">{item.value.toFixed(0)}€</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent transactions */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold mb-4">Dernières transactions</h3>
              {recentEntries.length === 0 ? (
                <div className="text-center py-12">
                  <Wallet className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">Aucune transaction</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentEntries.map(entry => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03]"
                    >
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                        style={{ backgroundColor: BUDGET_CATEGORIES[entry.category]?.color + '20' }}
                      >
                        {BUDGET_CATEGORIES[entry.category]?.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {entry.description || BUDGET_CATEGORIES[entry.category]?.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(entry.date), 'd MMM', { locale: fr })}
                        </p>
                      </div>
                      <div className={cn("font-semibold", entry.type === 'expense' ? "text-destructive" : "text-secondary")}>
                        {entry.type === 'expense' ? '-' : '+'}{entry.amount.toFixed(2)}€
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteEntry(entry.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}