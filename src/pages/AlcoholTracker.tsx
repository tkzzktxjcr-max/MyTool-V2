"use client";

import { useEffect, useState } from 'react';
import { useAlcohol } from '@/hooks/useAlcohol';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Plus, 
  Wine, 
  AlertTriangle,
  CheckCircle,
  Droplet,
  TrendingUp,
  Calendar,
  Trash2,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { CreateAlcoholLogForm, DrinkType } from '@/types';
import { DRINK_TYPES, HEALTH_GUIDELINES } from '@/types';

export default function AlcoholTrackerPage() {
  const { 
    logs, 
    insights, 
    loadLogs, 
    createLog, 
    deleteLog,
    calculateUnits,
    getTodayUnits,
  } = useAlcohol();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateAlcoholLogForm>({
    drinkType: 'beer',
    volumeCl: 50,
    abv: 5,
  });

  useEffect(() => {
    loadLogs(30);
  }, [loadLogs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      await createLog(formData);
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating log:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      drinkType: 'beer',
      volumeCl: 50,
      abv: 5,
    });
  };

  const handleDrinkTypeChange = (type: string) => {
    const drinkType = type as DrinkType;
    const defaultAbv = DRINK_TYPES[drinkType].defaultAbv;
    setFormData(prev => ({ 
      ...prev, 
      drinkType,
      abv: defaultAbv,
    }));
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'secondary';
      case 'moderate': return 'accent';
      case 'high': return 'destructive';
      default: return 'secondary';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle className="h-5 w-5" />;
      case 'moderate': return <AlertTriangle className="h-5 w-5" />;
      case 'high': return <AlertTriangle className="h-5 w-5" />;
      default: return <CheckCircle className="h-5 w-5" />;
    }
  };

  const todaysUnits = getTodayUnits();
  const recentLogs = logs.slice(0, 7);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Wine className="h-8 w-8 text-secondary" />
            Tracker Alcool
          </h1>
          <p className="text-muted-foreground">
            Suivi personnel • Vos données restent privées
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un verre
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Enregistrer une consommation</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type de bebida</label>
                <Select
                  value={formData.drinkType}
                  onValueChange={handleDrinkTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DRINK_TYPES).map(([key, drink]) => (
                      <SelectItem key={key} value={key}>
                        {drink.icon} {drink.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Volume (cl)</label>
                  <Input
                    type="number"
                    min="1"
                    max="200"
                    value={formData.volumeCl}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      volumeCl: parseInt(e.target.value) || 0 
                    }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Degré (%)</label>
                  <Input
                    type="number"
                    min="0.1"
                    max="100"
                    step="0.1"
                    value={formData.abv}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      abv: parseFloat(e.target.value) || 0 
                    }))}
                    required
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Unités calculées</span>
                  <span className="text-lg font-bold">
                    {calculateUnits(formData.volumeCl, formData.abv).toFixed(1)} unités
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Formule : (volume × degrés) / 10
                </p>
              </div>

              <Button type="submit" className="w-full" loading={loading}>
                Enregistrer
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {insights && (
        <Card className={cn("border-2", 
          insights.riskLevel === 'low' && "border-secondary bg-secondary/5",
          insights.riskLevel === 'moderate' && "border-accent bg-accent/5",
          insights.riskLevel === 'high' && "border-destructive bg-destructive/5"
        )}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl",
                insights.riskLevel === 'low' ? "bg-secondary/20 text-secondary" :
                insights.riskLevel === 'moderate' ? "bg-accent/20 text-accent-foreground" : "bg-destructive/20 text-destructive"
              )}>
                {getRiskIcon(insights.riskLevel)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold">
                    {insights.riskLevel === 'low' && 'Risque faible'}
                    {insights.riskLevel === 'moderate' && 'Risque modéré'}
                    {insights.riskLevel === 'high' && 'Risque élevé'}
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Cette semaine</p>
                    <p className="text-2xl font-bold">
                      {insights.totalWeeklyUnits.toFixed(1)} / {HEALTH_GUIDELINES.maxWeeklyUnits} unités
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Moyenne / jour</p>
                    <p className="text-2xl font-bold">
                      {insights.averagePerDay.toFixed(1)} unités
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplet className="h-5 w-5" />
            Aujourd'hui
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold">{todaysUnits.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">unités aujourd'hui</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">
                {HEALTH_GUIDELINES.maxDailyUnits - todaysUnits > 0 
                  ? `${(HEALTH_GUIDELINES.maxDailyUnits - todaysUnits).toFixed(1)} restantes`
                  : `${(todaysUnits - HEALTH_GUIDELINES.maxDailyUnits).toFixed(1)} au-delà`
                }
              </p>
              <p className="text-xs text-muted-foreground">limite quotidienne: {HEALTH_GUIDELINES.maxDailyUnits}</p>
            </div>
          </div>
          <div className="mt-4 h-3 rounded-full bg-muted overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500",
                todaysUnits <= HEALTH_GUIDELINES.lowRiskUnits ? "bg-secondary" :
                todaysUnits <= HEALTH_GUIDELINES.maxDailyUnits ? "bg-accent" : "bg-destructive"
              )}
              style={{ width: `${Math.min((todaysUnits / HEALTH_GUIDELINES.maxDailyUnits) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>0</span>
            <span>{HEALTH_GUIDELINES.lowRiskUnits} (modéré)</span>
            <span>{HEALTH_GUIDELINES.maxDailyUnits}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              7 derniers jours
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights && insights.dailyTrend.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={insights.dailyTrend}>
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(parseISO(value), 'EEE', { locale: fr })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => format(parseISO(value), 'd MMM', { locale: fr })}
                      formatter={(value: number) => [`${value.toFixed(1)} unités`, 'Consommation']}
                    />
                    <Bar 
                      dataKey="units" 
                      fill="#4ECDC4" 
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-muted-foreground">Aucune donnée</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Conseils santé
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights && insights.recommendations.length > 0 ? (
              <div className="space-y-3">
                {insights.recommendations.map((rec, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "p-4 rounded-xl",
                      rec.startsWith('✅') ? "bg-secondary/10" :
                      rec.startsWith('⚠️') ? "bg-accent/10" :
                      "bg-muted/50"
                    )}
                  >
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Commencez à enregistrer vos consommations pour obtenir des conseils personnalisés.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {insights && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{insights.totalMonthlyUnits.toFixed(0)}</p>
              <p className="text-sm text-muted-foreground">Unités / mois</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{insights.daysOverLimit}</p>
              <p className="text-sm text-muted-foreground">Jours au-delà de la limite</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">
                {DRINK_TYPES[insights.mostCommonDrink]?.icon} 
              </p>
              <p className="text-sm text-muted-foreground">Boisson favorite</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{logs.length}</p>
              <p className="text-sm text-muted-foreground">Consommations totales</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Historique récent
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <div className="text-center py-12">
              <Wine className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Aucune consommation enregistrée</p>
              <Button 
                variant="outline" 
                className="mt-3"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Enregistrer une consommation
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div 
                  key={log.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/50"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-2xl">
                    {DRINK_TYPES[log.drinkType]?.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">
                      {DRINK_TYPES[log.drinkType]?.label} • {log.volumeCl}cl à {log.abv}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(log.date), 'd MMM à HH:mm', { locale: fr })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{log.units.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">unités</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteLog(log.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}