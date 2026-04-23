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

  const pieData = Object.entries(expensesByCategory).filter(([, value]) => (value as number) > 0).map(([key, value]) => ({ name: BUDGET_CATEGORIES[key as BudgetCategory].label, value: value as number, icon: BUDGET_CATEGORIES[key as BudgetCategory].icon }));
  const recentEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold flex items-center gap-3"><Wallet className="h-8 w-8 text-accent" />Budget</h1><p className="text-muted-foreground">{format(new Date(), 'MMMM yyyy', { locale: fr })}</p></div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Nouvelle entrée</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{type === 'expense' ? 'Nouvelle dépense' : 'Nouveau revenu'}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2 p-1 bg-muted rounded-xl">
                <button type="button" onClick={() => { setType('expense'); setFormData(p => ({ ...p, type: 'expense' })); }} className={cn("flex-1 py-2 rounded-lg text-sm font-medium", type === 'expense' ? "bg-destructive text-destructive-foreground" : "text-muted-foreground")}>Dépense</button>
                <button type="button" onClick={() => { setType('income'); setFormData(p => ({ ...p, type: 'income' })); }} className={cn("flex-1 py-2 rounded-lg text-sm font-medium", type === 'income' ? "bg-secondary text-secondary-foreground" : "text-muted-foreground")}>Revenu</button>
              </div>
              <div className="space-y-2"><label className="text-sm font-medium">Montant (€)</label><Input type="number" step="0.01" min="0" placeholder="0.00" value={formData.amount || ''} onChange={(e) => setFormData(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))} required className="text-lg font-semibold" /></div>
              {type === 'expense' && (
                <div className="space-y-2"><label className="text-sm font-medium">Catégorie</label><Select value={formData.category} onValueChange={(v) => setFormData(p => ({ ...p, category: v as BudgetCategory }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(BUDGET_CATEGORIES).map(([key, cat]) => <SelectItem key={key} value={key}>{cat.icon} {cat.label}</SelectItem>)}</SelectContent></Select></div>
              )}
              <div className="space-y-2"><label className="text-sm font-medium">Description</label><Input placeholder="Courses" value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} /></div>
              <Button type="submit" className="w-full">Ajouter</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><ArrowDownRight className="h-4 w-4 text-destructive" />Dépenses</div><div className="text-2xl font-bold text-destructive">-{totalExpenses.toFixed(2)}€</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><ArrowUpRight className="h-4 w-4 text-secondary" />Revenus</div><div className="text-2xl font-bold text-secondary">+{totalIncome.toFixed(2)}€</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><Wallet className="h-4 w-4" />Solde</div><div className={cn("text-2xl font-bold", balance >= 0 ? "text-secondary" : "text-destructive")}>{balance >= 0 ? '+' : ''}{balance.toFixed(2)}€</div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-sm text-muted-foreground mb-2">Budget utilisé</div><div className={cn("text-2xl font-bold", budgetUsed > 80 ? "text-destructive" : "text-secondary")}>{Math.round(budgetUsed)}%</div></CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-4"><PieChartIcon className="h-5 w-5" />Répartition</h3>
            {pieData.length === 0 ? (
              <div className="text-center py-12"><PieChartIcon className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" /><p className="text-muted-foreground">Aucune dépense</p></div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {pieData.map(item => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <span>{item.icon}</span><span className="truncate">{item.name}</span><span className="ml-auto font-medium">{item.value.toFixed(0)}€</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4">Dernières transactions</h3>
            {recentEntries.length === 0 ? (
              <div className="text-center py-12"><Wallet className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" /><p className="text-muted-foreground">Aucune transaction</p></div>
            ) : (
              <div className="space-y-3">
                {recentEntries.map(entry => (
                  <div key={entry.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: BUDGET_CATEGORIES[entry.category]?.color + '20' }}>{BUDGET_CATEGORIES[entry.category]?.icon}</div>
                    <div className="flex-1 min-w-0"><p className="font-medium truncate">{entry.description || BUDGET_CATEGORIES[entry.category]?.label}</p><p className="text-xs text-muted-foreground">{format(parseISO(entry.date), 'd MMM', { locale: fr })}</p></div>
                    <div className={cn("font-semibold", entry.type === 'expense' ? "text-destructive" : "text-secondary")}>{entry.type === 'expense' ? '-' : '+'}{entry.amount.toFixed(2)}€</div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteEntry(entry.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}