"use client";

import { useEffect, useState } from 'react';
import { useAlcohol } from '@/features/alcohol/hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Wine, AlertTriangle, CheckCircle, Droplet, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { CreateAlcoholLogForm, DrinkType } from '@/features/alcohol/types';
import { DRINK_TYPES, HEALTH_GUIDELINES } from '@/features/alcohol/types';

export default function AlcoholPage() {
  const { logs, insights, loadLogs, createLog, deleteLog, calculateUnits, getTodayUnits } = useAlcohol();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateAlcoholLogForm>({ drinkType: 'beer', volumeCl: 50, abv: 5 });

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createLog(formData);
    setIsDialogOpen(false);
    setFormData({ drinkType: 'beer', volumeCl: 50, abv: 5 });
  };

  const handleDrinkChange = (type: string) => {
    const defaultAbv = DRINK_TYPES[type as DrinkType].defaultAbv;
    setFormData(prev => ({ ...prev, drinkType: type as DrinkType, abv: defaultAbv }));
  };

  const getRiskIcon = (level: string) => {
    if (level === 'low') return <CheckCircle className="h-5 w-5" />;
    return <AlertTriangle className="h-5 w-5" />;
  };

  const todaysUnits = getTodayUnits();
  const recentLogs = logs.slice(0, 7);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold flex items-center gap-3"><Wine className="h-8 w-8 text-secondary" />Tracker Alcool</h1><p className="text-muted-foreground">Suivi personnel</p></div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Ajouter un verre</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Enregistrer une consommation</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2"><label className="text-sm font-medium">Type de bebida</label><Select value={formData.drinkType} onValueChange={handleDrinkChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(DRINK_TYPES).map(([key, drink]) => <SelectItem key={key} value={key}>{drink.icon} {drink.label}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-sm font-medium">Volume (cl)</label><Input type="number" min="1" max="200" value={formData.volumeCl} onChange={(e) => setFormData(prev => ({ ...prev, volumeCl: parseInt(e.target.value) || 0 }))} required /></div>
                <div className="space-y-2"><label className="text-sm font-medium">Degré (%)</label><Input type="number" min="0.1" max="100" step="0.1" value={formData.abv} onChange={(e) => setFormData(prev => ({ ...prev, abv: parseFloat(e.target.value) || 0 }))} required /></div>
              </div>
              <div className="p-3 rounded-xl bg-muted/50"><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Unités calculées</span><span className="text-lg font-bold">{calculateUnits(formData.volumeCl, formData.abv).toFixed(1)} unités</span></div></div>
              <Button type="submit" className="w-full">Enregistrer</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {insights && (
        <Card className={cn("border-2", insights.riskLevel === 'low' && "border-secondary bg-secondary/5", insights.riskLevel === 'moderate' && "border-accent bg-accent/5", insights.riskLevel === 'high' && "border-destructive bg-destructive/5")}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl", insights.riskLevel === 'low' ? "bg-secondary/20 text-secondary" : insights.riskLevel === 'moderate' ? "bg-accent/20 text-accent-foreground" : "bg-destructive/20 text-destructive")}>
                {getRiskIcon(insights.riskLevel)}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold">{insights.riskLevel === 'low' ? 'Risque faible' : insights.riskLevel === 'moderate' ? 'Risque modéré' : 'Risque élevé'}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                  <div><p className="text-muted-foreground">Cette semaine</p><p className="text-2xl font-bold">{insights.totalWeeklyUnits.toFixed(1)} / {HEALTH_GUIDELINES.maxWeeklyUnits} unités</p></div>
                  <div><p className="text-muted-foreground">Moyenne / jour</p><p className="text-2xl font-bold">{insights.averagePerDay.toFixed(1)} unités</p></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold flex items-center gap-2 mb-4"><Droplet className="h-5 w-5" />Aujourd'hui</h3>
          <div className="flex items-center justify-between">
            <div><p className="text-4xl font-bold">{todaysUnits.toFixed(1)}</p><p className="text-sm text-muted-foreground">unités aujourd'hui</p></div>
            <div className="text-right"><p className="text-lg font-semibold">{HEALTH_GUIDELINES.maxDailyUnits - todaysUnits > 0 ? `${(HEALTH_GUIDELINES.maxDailyUnits - todaysUnits).toFixed(1)} restantes` : `${(todaysUnits - HEALTH_GUIDELINES.maxDailyUnits).toFixed(1)} au-delà`}</p><p className="text-xs text-muted-foreground">limite: {HEALTH_GUIDELINES.maxDailyUnits}</p></div>
          </div>
          <div className="mt-4 h-3 rounded-full bg-muted overflow-hidden">
            <div className={cn("h-full rounded-full transition-all", todaysUnits <= HEALTH_GUIDELINES.lowRiskUnits ? "bg-secondary" : todaysUnits <= HEALTH_GUIDELINES.maxDailyUnits ? "bg-accent" : "bg-destructive")} style={{ width: `${Math.min((todaysUnits / HEALTH_GUIDELINES.maxDailyUnits) * 100, 100)}%` }} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h3 className="font-semibold mb-4">Historique récent</h3>
          {recentLogs.length === 0 ? (
            <div className="text-center py-12"><Wine className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" /><p className="text-muted-foreground">Aucune consommation enregistrée</p></div>
          ) : (
            <div className="space-y-3">
              {recentLogs.map(log => (
                <div key={log.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-2xl">{DRINK_TYPES[log.drinkType]?.icon}</div>
                  <div className="flex-1 min-w-0"><p className="font-medium">{DRINK_TYPES[log.drinkType]?.label} • {log.volumeCl}cl à {log.abv}%</p><p className="text-sm text-muted-foreground">{format(parseISO(log.date), 'd MMM à HH:mm', { locale: fr })}</p></div>
                  <div className="text-right"><p className="text-lg font-bold">{log.units.toFixed(1)}</p><p className="text-xs text-muted-foreground">unités</p></div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteLog(log.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}