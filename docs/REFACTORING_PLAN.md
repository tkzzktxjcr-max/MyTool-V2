# 🎯 WellHub - Plan de Refactorisation Complet

> Transformation de Family Hub vers une application de bien-être bienveillante
> Document de référence - v1.0

---

## 📋 Table des Matières

1. [Vision & Positionnement](#1-vision--positionnement)
2. [Audit de l'existant](#2-audit-de-lexistant)
3. [Architecture fonctionnelle cible](#3-architecture-fonctionnelle-cible)
4. [Parcours utilisateurs](#4-parcours-utilisateurs)
5. [Système de budget alcool](#5-système-de-budget-alcool)
6. [Localisation intelligente](#6-localisation-intelligente)
7. [Expérience utilisateur](#7-expérience-utilisateur)
8. [Sprint de refactorisation](#8-sprint-de-refactorisation)
9. [Risques & Mitigations](#9-risques--mitigations)

---

## 1. Vision & Positionnement

### 1.1 Nouvelle Identité

| Avant | Après |
|-------|-------|
| Family Hub | **WellHub** |
| Gestion familiale | **Bien-être personnel & réduction des risques** |
| Multi-utilisateurs (famille) | **Solo avec cercle de confiance optionnel** |
| Tracking froid (alcool) | **Coaching bienveillant** |

### 1.2 Mission Révisée

> *"Accompagner chacun vers une relation plus consciente avec l'alcool, sans jugement, à travers le suivi, la réflexion et le soutien communautaire."*

### 1.3 Principes Directeurs

```
┌─────────────────────────────────────────────────────────────┐
│                    LES 5 PILIERS                            │
├─────────────────────────────────────────────────────────────┤
│  🤝  BIENVEILLANCE    → Jamais culpabilisant              │
│  📊  CONSCIENCE       → Données = pouvoir                  │
│  🔒  CONFIDENTIALITÉ → Vie privée sacrée                   │
│  🎯  OBJECTIFS        → Progrès pas perfection              │
│  ⏰  CONTEXTE        → Adapter au moment                   │
└─────────────────────────────────────────────────────────────┘
```

### 1.4 Positionnement Marketing

**Public cible :**
- 25-45 ans, consomme occasionnellement
- Veut prendre conscience de ses habitudes
- N'est pas prêt à arrêter, mais veut mieux comprendre
- Recherche du feedback non moralisateur

**Pas pour :**
- Personnes en sevrage strict (orienter vers associations spécialisées)
- Chercheurs d'aide contre l'addiction (rediriger vers professionnels)

---

## 2. Audit de l'Existant

### 2.1 Fonctionnalités Actuelles

| Fonctionnalité | Statut | Action | Justification |
|---------------|--------|--------|----------------|
| **Calendrier familial** | 🔴 À supprimer | Supprimer | Hors scope bien-être personnel |
| **Corvées & Points** | 🔴 À supprimer | Supprimer | Non aligné avec la mission |
| **Budget familial** | 🟡 À transformer | Adapter | Garder mais lier à l'alcool |
| **Tracker Alcool** | 🟢 À conserver | Améliorer | Core feature |
| **Insights santé** | 🟢 À conserver | Enrichir | Valeur ajoutée principale |
| **Gestion famille** | 🔴 À supprimer | Supprimer | Réorienter vers "cercle" |

### 2.2 Architecture Actuelle à Conserver

```
src/
├── features/
│   ├── alcohol/           ← CORE - À enrichir
│   │   ├── services/      ← Garder, adapter
│   │   ├── hooks.ts        ← Garder, enrichir
│   │   └── types.ts       ← Garder, étendre
│   └── budget/            ← CORE - À lier alcool
├── pages/
│   ├── Alcohol.tsx        ← Centraliser ici
│   └── Settings.tsx       ← Conserver
├── components/
│   ├── onboarding/        ← À adapter
│   └── ui/               ← Garder tel quel
└── lib/
    ├── constants.ts       ← Enrichir
    ├── utils.ts           ← Garder
    └── appwrite.ts        ← Garder
```

### 2.3 Composants à Supprimer

```typescript
// SUPPRIMER :
- src/features/family/        // Remplacé par "Cercle de confiance" simplifié
- src/pages/Calendar.tsx       // Hors scope
- src/pages/Chores.tsx         // Hors scope
- src/pages/Family.tsx         // Hors scope
- src/components/layout/       // Simplifier (navigation mono-user)
```

---

## 3. Architecture Fonctionnelle Cible

### 3.1 Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                      WELLHUB - ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     │
│   │   AVANT     │     │  PENDANT    │     │   APRÈS     │     │
│   │  SORTIE     │     │ CONSOMMATION│     │   SORTIE    │     │
│   └──────┬──────┘     └──────┬──────┘     └──────┬──────┘     │
│          │                   │                   │             │
│   ┌──────▼──────┐     ┌──────▼──────┐     ┌──────▼──────┐     │
│   │ • Objectifs │     │ • Tracking  │     │ • Bilan     │     │
│   │ • Budget    │     │ • BAC Live │     │ • Dépenses  │     │
│   │ • Localis. │     │ • Alertes  │     │ • Reflections│    │
│   │ • Preparation│    │ • Feedback  │     │ • Partage   │     │
│   └─────────────┘     └─────────────┘     └─────────────┘     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                      MODULES CENTRAUX                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │                    DASHBOARD UNIFIÉ                     │  │
│   │  ┌────────────┐  ┌────────────┐  ┌────────────┐       │  │
│   │  │   BAC      │  │  BUDGET    │  │  INSIGHTS  │       │  │
│   │  │   Card     │  │   Alcool   │  │  Personnal. │       │  │
│   │  └────────────┘  └────────────┘  └────────────┘       │  │
│   └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│   │   HISTORIQUE │  │   BUDGET     │  │   BADGES     │       │
│   │  CALENDRIER  │  │   DÉTAIL     │  │  & STREAKS  │       │
│   └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                      MODULES OPTIONNELS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────┐        ┌─────────────────┐                │
│   │   LOCALISATION  │        │   CERCLE DE     │                │
│   │   INTELLIGENTE │        │   CONFIANCE     │                │
│   └─────────────────┘        └─────────────────┘                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Nouveau Modèle de Données

```typescript
// Nouveau fichier : src/features/wellbeing/types.ts

interface UserProfile {
  id: string;
  
  // Profil bien-être
  weightKg: number;
  sex: 'male' | 'female' | 'unspecified';
  legalLimit: number;
  
  // Préférences
  onboardingCompleted: boolean;
  notificationsEnabled: boolean;
  locationEnabled: boolean;
  
  // Objectifs personnels
  weeklyGoal: number;
  monthlyBudget?: number;        // NEW: Budget alcool
  financialGoal?: number;        // NEW: Objectif épargne替代
}

interface AlcoholSession {
  id: string;
  userId: string;
  
  // Métadonnées
  startedAt: string;           // NEW: Début de session
  endedAt?: string;            // NEW: Fin de session
  context?: 'evening_out' | 'home' | 'dinner' | 'celebration' | 'other';
  
  // Localisation
  location?: GeoLocation;       // NEW: Optionnel
  locationShared?: boolean;     // NEW: Partagé au cercle
  
  // Résumé
  totalUnits: number;
  totalSpent: number;          // NEW: Dépenses
  estimatedBAC: number;
  
  // Feedback
  mood?: MoodType;
  reflection?: string;          // NEW: Réflexion post-sortie
  tags?: string[];
}

interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  method: 'gps' | 'network';
}

interface TrustCircle {
  id: string;
  ownerId: string;
  
  // Membres (max 3-5)
  members: CircleMember[];
  
  // Paramètres de partage
  shareLocation: boolean;
  shareBAC: boolean;
  shareBudget: boolean;
  
  // Alertes automatiques
  alertIfBACAbove?: number;
  alertIfNotHomeBy?: string;   // "23:00"
}

interface CircleMember {
  id: string;
  name: string;
  phone?: string;
  role: 'owner' | 'guardian' | 'buddy';
  accepted: boolean;
}

interface BudgetEntry {
  id: string;
  userId: string;
  
  // Lié à une session ou entrée directe
  sessionId?: string;
  
  // Catégorie alcohol obligatoire
  category: 'beer' | 'wine' | 'spirit' | 'cocktail' | 'other';
  
  amount: number;               // NEW: Montant en €
  drinkName?: string;
  
  date: string;
  
  // Optionnel: preuve (ticket, photo)
  receiptUrl?: string;
}

interface WeeklyReport {
  id: string;
  userId: string;
  weekStart: string;
  
  // Stats
  totalUnits: number;
  totalSpent: number;
  sessionsCount: number;
  averageBAC: number;
  
  // Comparaison
  vsPreviousWeek: number;       // % changement
  vsGoal: number;               // % vs objectif
  
  // Insights
  insights: string[];
  tips: string[];
  achievements: string[];
  
  // Mood tracking
  moodTrend: Record<MoodType, number>;
}

type MoodType = 'happy' | 'relaxed' | 'social' | 'celebrating' | 'stressed' | 'sad' | 'tired' | 'neutral' | 'regretful';

type ContextType = 'evening_out' | 'home' | 'dinner' | 'celebration' | 'work_event' | 'date' | 'other';
```

### 3.3 Nouvelle Structure de Fichiers

```
src/
├── features/
│   ├── wellbeing/
│   │   ├── types.ts              # NOUVEAU - Types unifiés
│   │   ├── services/
│   │   │   ├── alcohol.ts        # Conserver, enrichir
│   │   │   ├── budget.ts         # NOUVEAU - Service budget
│   │   │   ├── location.ts        # NOUVEAU - Géolocalisation
│   │   │   ├── circle.ts         # NOUVEAU - Cercle confiance
│   │   │   └── insights.ts        # NOUVEAU - Génération insights
│   │   ├── hooks/
│   │   │   ├── useWellbeing.ts   # NOUVEAU - Hook principal
│   │   │   ├── useBudget.ts       # NOUVEAU - Hook budget
│   │   │   ├── useLocation.ts    # NOUVEAU - Hook localisation
│   │   │   └── useCircle.ts      # NOUVEAU - Hook cercle
│   │   └── utils/
│   │       ├── bac.ts            # Conserver
│   │       ├── units.ts          # Conserver
│   │       ├── financial.ts       # NOUVEAU - Calculs financiers
│   │       └── insights.ts       # NOUVEAU - Génération insights
│   │
│   ├── alcohol/                   # LEGACY - À migrer vers wellbeing
│   │   ├── services/            # → features/wellbeing/services/
│   │   └── hooks.ts             # → features/wellbeing/hooks/
│   │
│   └── family/                    # LEGACY - À supprimer (v2)
│
├── pages/
│   ├── Dashboard.tsx              # → Refactoriser
│   ├── Wellbeing.tsx              # NOUVEAU - Hub principal
│   ├── Insights.tsx               # NOUVEAU - Page insights détaillés
│   ├── Budget.tsx                 # NOUVEAU - Budget alcool
│   ├── History.tsx                # NOUVEAU - Historique & sessions
│   └── Settings.tsx               # Conserver, adapter
│
├── components/
│   ├── wellbeing/                  # NOUVEAU - Composants spécifiques
│   │   ├── BACCard.tsx           # Enrichir
│   │   ├── SessionCard.tsx       # NOUVEAU
│   │   ├── BudgetOverview.tsx     # NOUVEAU
│   │   ├── MoodSelector.tsx      # Améliorer
│   │   ├── LocationToggle.tsx    # NOUVEAU
│   │   ├── CircleStatus.tsx      # NOUVEAU
│   │   ├── PreOutingWizard.tsx   # NOUVEAU
│   │   └── PostOutingReview.tsx  # NOUVEAU
│   │
│   ├── onboarding/                # Adapter
│   │   └── wellbeing/            # NOUVEAU - Onboarding révisé
│   │
│   └── ui/                        # Conserver tel quel
│
├── hooks/                          # NOUVEAU
│   ├── useSession.ts             # Gestion session active
│   ├── useLocation.ts            # Géolocalisation
│   └── useNotifications.ts       # Notifications bienveillantes
│
└── lib/
    ├── constants.ts               # Enrichir avec nouvelles constantes
    ├── utils.ts                   # Conserver
    ├── appwrite.ts                # Adapter collections
    └── notifications.ts           # NOUVEAU - Système notifications
```

---

## 4. Parcours Utilisateurs

### 4.1 Parcours "Avant Sortie"

```
┌─────────────────────────────────────────────────────────────────┐
│              PARCOURS AVANT SORTIE                               │
│              "Préparation Consciente"                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Intent     │────▶│  Objectifs  │────▶│   Budget    │────▶│  Localisat. │
│  "Je sors"  │     │  & Limites  │     │  & Dépenses │     │  Optionnel  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                          │                                        │
                          ▼                                        ▼
                    ┌─────────────┐                         ┌─────────────┐
                    │  💡 Tips    │                         │  🛡️ Cercle  │
                    │  Contextuel │                         │  Notifié ?  │
                    └─────────────┘                         └─────────────┘
                                                                    │
                                                                    ▼
                                                            ┌─────────────┐
                                                            │   DÉMARRER  │
                                                            │   SESSION   │
                                                            └─────────────┘
```

**Écran 1 : Intent de sortie**
- Question bienveillante : "Tu sors ce soir ?"
- Boutons : "Oui, prépare-moi" / "Juste un verre à la maison" / "Non, pas ce soir"
- Si "Non" : Afficher rappel épargne/objectif (gamification)

**Écran 2 : Configuration Objectifs**
- Slider : "Combien de verres maximum ?" (avec feedback OMS)
- Input : "Quel est ton budget ce soir ?" (optionnel)
- Tag : Type de sortie (Soirée, Dîner, Apéro, Concert...)

**Écran 3 : Tips Contextuels**
- Tips personnalisés selon l'heure, le jour, la météo
- "Il fait beau demain, une nuit sobre = run matinal parfait"
- "Ton budget épargne a augmenté de 15% ce mois, continue !"

**Écran 4 : Localisation & Cercle (Optionnel)**
- Toggle : "Partager ma position avec [Maman] ?"
- Option : "Alerter si je ne suis pas rentré à [HH:MM]"
- Expliquer clairement : encryption, durée limitée, pas de suivi GPS constant

### 4.2 Parcours "Pendant"

```
┌─────────────────────────────────────────────────────────────────┐
│              PARCOURS PENDANT CONSOMMATION                       │
│              "Awareness en Temps Réel"                         │
└─────────────────────────────────────────────────────────────────┘

     ┌──────────────┐
     │   +1 VERRE   │ ◄─── Action utilisateur
     └──────┬───────┘
            │
            ▼
     ┌──────────────┐
     │  CALCUL BAC  │ ◄─── Updates temps réel
     │  + BUDGET    │
     └──────┬───────┘
            │
            ├──────────────────────────┐
            │                          │
            ▼                          ▼
     ┌──────────────┐          ┌──────────────┐
     │  FEEDBACK    │          │   ALERTES    │
     │  VISUEL      │          │  (si besoin) │
     └──────┬───────┘          └──────┬───────┘
            │                          │
            ▼                          │
     ┌──────────────┐                  │
     │  💡 conseils │                  │
     │  douces      │ ◄───────────────┘
     └──────────────┘
```

**Feedback Visuel Progressif :**

| Niveau | BAC estimé | Couleur | Message |
|--------|-----------|---------|---------|
| 🟢 Optimal | 0 - 0.3 g/L | Vert | "Bonne conduite, tu gères" |
| 🟡 Modéré | 0.3 - 0.5 g/L | Jaune | "Léger, hydrate-toi" |
| 🟠 Attention | 0.5 - 0.8 g/L | Orange | "Tu approches de la limite" |
| 🔴 Pause | > 0.8 g/L | Rouge | "Peut-être temps de ralentir" |

**Notifications Douces :**
- "2h00, ton budget était de 5 verres, tu en es à 4 🎯"
- "Une bonne nuit de sommeil, ça fait du bien après 2 jours sobre 🌟"
- "Tu as dépensé 15€ ce soir, dans ton budget de 30€ ✓"

### 4.3 Parcours "Après Sortie"

```
┌─────────────────────────────────────────────────────────────────┐
│              PARCOURS APRÈS SORTIE                              │
│              "Réflexion & Bilan Bienveillant"                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   FIN DE    │────▶│    BILAN    │────▶│  RÉFLEXION  │────▶│   WEEKLY    │
│   SESSION   │     │  RAPIDE     │     │  DOUCE      │     │   SUMMARY   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

**Écran Bilan :**
- "Comment tu te sens maintenant ?"
- Sélecteur mood express (5 options max)
- Résumé : Verres, Dépenses, Heure de fin
- Optionnel : "Ajouter une note" (pour plus tard, pas forcé)

**Réflexion Douce (optionnel, le lendemain) :**
- Notification bienveillante : "Comment s'est passée ta soirée ?"
- Questions simples : "Tu as aimé ?", "Trop bu ?", "Dépense OK ?"
- Aucune obligation de répondre
- Réponses = amélioration des insights

---

## 5. Système de Budget Alcool

### 5.1 Architecture Budget

```typescript
// Concept : Budget Alcool = Budget global avec allocation booze

interface BudgetConfig {
  monthlyBudget: number;          // Budget total
  alcoholAllocation: number;        // % ou montant € pour alcool
  savingsGoal: number;             // Objectif épargne
  categories: {
    alcohol: CategoryBudget;
    groceries: CategoryBudget;
    leisure: CategoryBudget;
    transport: CategoryBudget;
    other: CategoryBudget;
  };
}

interface CategoryBudget {
  limit: number;
  spent: number;
  alerts: AlertThreshold[];
}

interface AlertThreshold {
  percentage: number;             // 50, 75, 90, 100
  message: string;
  type: 'info' | 'warning' | 'critical';
}
```

### 5.2 Calculateur d'Impact Financier

```typescript
// src/features/wellbeing/utils/financial.ts

interface FinancialStats {
  // Par période
  dailySpend: number;
  weeklySpend: number;
  monthlySpend: number;
  yearlySpend: number;
  
  // Projections
  monthlyProjection: number;
  yearlyProjection: number;
  
  // Comparaisons
  vsPreviousMonth: number;        // % changement
  vsAverage: number;               // vs moyenne user
  vsNationalAverage?: number;      // vs moyenne nationale (anon)
  
  // Équivalences
  yearlyEquivalents: {
    coffees: number;               // "Assez de cafés pour X mois"
    streamingSubscriptions: number;
    concertTickets: number;
    weekendTrips: number;
  };
  
  // Épargne potentielle
  potentialSavings: number;        // Si 50% réduction
  actualSavingsVsLastYear: number;
}

export const calculateFinancialImpact = (
  logs: AlcoholLog[],
  budgetConfig: BudgetConfig
): FinancialStats => {
  // ... implémentation
};
```

### 5.3 Écrans Budget

```
┌─────────────────────────────────────────────────────────────────┐
│                    BUDGET ALCOOL - MAI 2024                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  Budget mensuel         ████████████░░░░  67% (40/60€) │  │
│   │  🍺 Alcool             ██████░░░░░░░░░░  45% (13/30€) │  │
│   │  💰 Épargne            ████████████████  100%          │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐      │
│   │   23€        │  │   45€        │  │   540€       │      │
│   │   Ce mois    │  │   Projection │  │   C'est...   │      │
│   │   DEPENSÉ    │  │   Mai        │  │   6 concerts │      │
│   └───────────────┘  └───────────────┘  └───────────────┘      │
│                                                                 │
│   📊 RÉPARTITION ce mois :                                     │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ Bière  ████████████████░░░░░░░░░░░░░░░  45%           │  │
│   │ Vin    ████████░░░░░░░░░░░░░░░░░░░░░░░░  25%           │  │
│   │ Cockt. ██████░░░░░░░░░░░░░░░░░░░░░░░░░░  20%           │  │
│   │ Spirit ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░  10%           │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   💡 INSIGHT : "Tu as dépensé 15% de moins que le mois dernier" │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.4 Gamification Financière

| Achievement | Condition | Récompense Visuelle |
|------------|-----------|---------------------|
| 🎯 Sous Budget | 3 mois consécutifs sous l'allocation | Badge + confetti |
| 📈 Consistency King | Dépenses stables (variance <10%) | Badge bronze/argent/or |
| 💰 Économies | 100€ économisés vs même période an passé | "Ça fait un week-end à la mer ! |
| 🎓 Conscience | 10 sessions avec budget défini | Accès Insights avancés |
| 🌱 Croissance | Épargne augmentée 3 mois | Badge + message personnalisé |

---

## 6. Localisation Intelligente

### 6.1 Cas d'Usage

```
┌─────────────────────────────────────────────────────────────────┐
│                    MATRICE LOCALISATION                         │
├─────────────────┬───────────────────┬─────────────────────────┤
│    Cas d'usage  │   Activation       │   Données partagées     │
├─────────────────┼───────────────────┼─────────────────────────┤
│ Sortie nocturne │ Manuel (début)    │ Position + ETA maison    │
│ Retour tardif   │ Automatique (>23h)│ Alerte si pas rentré    │
│ Conduite après  │ Automatique (BAC) │ Alerte si > limite     │
│ Situation risque │ Manuel (bouton)   │ Position SOS + contacts │
│ Sortie seule    │ Manuel            │ Check-in régulier        │
└─────────────────┴───────────────────┴─────────────────────────┘
```

### 6.2 Architecture Technique

```typescript
// src/features/wellbeing/services/location.ts

interface LocationConfig {
  // Activation
  enabled: boolean;
  mode: 'manual' | 'automatic' | 'scheduled';
  scheduledTimes?: string[];       // ["22:00", "23:00"]
  
  // Partage
  shareWithCircle: boolean;
  shareDuration: 'session' | '1h' | '4h' | 'until_i_arrive' | 'manual';
  
  // Alertes automatiques
  alertIfNotHomeBy?: string;      // "01:00"
  alertIfBACAbove?: number;        // 0.5 g/L
  alertCheckInterval: number;      // minutes
  
  // Précision
  accuracyLevel: 'high' | 'medium' | 'low';
}

interface LocationSharing {
  // Statut actuel
  isActive: boolean;
  startedAt?: string;
  expiresAt?: string;
  
  // Position
  currentLocation?: GeoLocation;
  
  // Notifications envoyées
  alerts: LocationAlert[];
}

interface LocationAlert {
  id: string;
  type: 'late_home' | 'high_bac' | 'sos' | 'check_in';
  sentAt: string;
  recipientIds: string[];
  status: 'sent' | 'delivered' | 'read';
}
```

### 6.3 Flow de Localisation

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLOW LOCALISATION                             │
└─────────────────────────────────────────────────────────────────┘

1. UTILISATEUR ACTIVE
   │
   ├─► MODE MANUEL
   │    │
   │    └─► Bouton "Je sors" → Démarrer partage
   │
   ├─► MODE AUTO (si configuré)
   │    │
   │    └─► Si heure > 22h ET session active
   │         │
   │         └─► Demande confirmation : "Activer le suivi ?"
   │              │
   │              ├─► OUI → Démarrer partage
   │              └─► NON → Rester discret
   │
   └─► BOUTON SOS (toujours accessible)
        │
        └─► Envoi position + notification cercle
            + Option : appeler les secours
```

### 6.4 Garde-fous & Confidentialité

```
┌─────────────────────────────────────────────────────────────────┐
│                    GARDE-FOUS LOCALISATION                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🔒 CONFIDENTIALITÉ                                            │
│  ├── Position chiffrée de bout en bout                          │
│  ├── Serveur ne stocke que données agrégées (anonymisées)       │
│  ├── Effacement automatique après X heures                       │
│  └── Aucune vente ou partage avec tiers                         │
│                                                                 │
│  👤 CONTRÔLE UTILISATEUR                                       │
│  ├── Opt-in explicite (jamais par défaut)                        │
│  ├── Désactivation en 1 clic (toujours)                         │
│  ├── Cercle doit accepter l'invitation                          │
│  └── Durée maximale : 12h (refresh nécessaire)                  │
│                                                                 │
│  🛡️ SÉCURITÉ                                                   │
│  ├── Détection de spoofing GPS (si possible)                    │
│  ├── Alerte si position fixe trop longtemps                     │
│  └── Historique位置的 uniquement pour本人                        │
│                                                                 │
│  📱 NOTIFICATIONS CERCLE                                        │
│  ├── Messages neutres (pas "ivres")                             │
│  ├── Ton bienveillant ("Tu es dehors, ça va ?")                 │
│  └── Jamais de shaming public                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.5 UI Localisation

```
┌─────────────────────────────────────────────────────────────────┐
│  📍 PARTAGE DE POSITION                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │    🗺️  [Carte avec position actuelle]                    │   │
│  │                                                          │   │
│  │    📍 Tu es à Place Vendôme, Paris                      │   │
│  │    ⏱️  Partage actif depuis 14 min                      │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Partagé avec :                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 👤 Maman (Papa)         ✓ Connecté  ● En ligne         │   │
│  │ 👤 Sophie (Amie)        ✓ Connecté  ○ Hors ligne       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Alertes automatiques :                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🔔 Si je ne suis pas rentré à : [01:00____]           │   │
│  │ 🔔 Si mon BAC dépasse : [0.5___] g/L                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [🟢 ARRÊTER LE PARTAGE]                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  💡 "Tu peux partager ta position avec des personnes de         │
│     confiance. Ils ne verront que ta position, pas ce que      │
│     tu bois."                                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Expérience Utilisateur

### 7.1 Design System

```typescript
// src/styles/design-system.ts

const wellbeingTheme = {
  colors: {
    // États de conscience (progression bienveillante)
    consciousness: {
      sober: '#22C55E',           // Vert - Sobre
      light: '#84CC16',           // Vert-jaune - Léger
      moderate: '#EAB308',         // Jaune - Modéré
      elevated: '#F97316',        // Orange - Élevé
      high: '#EF4444',            // Rouge - Important
    },
    
    // Finance
    financial: {
      underBudget: '#22C55E',
      nearBudget: '#EAB308',
      overBudget: '#EF4444',
    },
    
    // Confiance/Sécurité
    trust: {
      safe: '#22C55E',
      caution: '#F97316',
      alert: '#EF4444',
    },
  },
  
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    // Hiérarchie bienveillante
    hero: {
      size: '2.5rem',
      weight: 700,
      lineHeight: 1.2,
    },
    heading: {
      size: '1.5rem',
      weight: 600,
      lineHeight: 1.3,
    },
    body: {
      size: '1rem',
      weight: 400,
      lineHeight: 1.5,
    },
    caption: {
      size: '0.875rem',
      weight: 500,
      lineHeight: 1.4,
    },
  },
  
  spacing: {
    xs: '0.5rem',   // 8px
    sm: '0.75rem',  // 12px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    xxl: '3rem',    // 48px
  },
  
  radius: {
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    glow: (color: string) => `0 0 20px -5px ${color}`,
  },
  
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};
```

### 7.2 Ton & Voix

```
┌─────────────────────────────────────────────────────────────────┐
│                    TON DE L'APPLICATION                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ À dire                                                    │
│  ─────────────                                                 │
│  "Tu as bu 2 verres de moins que d'habitude, bravo !"          │
│  "Comment te sens-tu ce matin ?"                               │
│  "Ton budget est bien respecté cette semaine"                   │
│  "C'est OK de ne pas vouloir boire ce soir"                    │
│                                                                 │
│  ❌ À éviter                                                  │
│  ────────────                                                  │
│  "Tu as trop bu"                                               │
│  "Tu devrais arrêter"                                          │
│  "Alcool = danger"                                             │
│  "Regarde les dégâts..."                                        │
│                                                                 │
│  🎭 Personnalité                                              │
│  ───────────                                                   │
│  • Bienveillant mais honnête                                    │
│  • Curieux sans être intrusif                                   │
│  • Celebrateur sans être encourageant la surconsommation        │
│  • Informatif sans être moralisateur                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.3 Wireframes Clés

**Dashboard Principal :**

```
┌─────────────────────────────────────────────────────────────────┐
│  WellHub                          ⚙️  🔔  👤                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │   Bonjour Antoine 👋                                     │   │
│  │   Dimanche 15 septembre                                  │   │
│  │                                                          │   │
│  │   ┌───────────────────────────────────────────────┐      │   │
│  │   │  🧠 TA CONSCIENCE AUJOURD'HUI                  │      │   │
│  │   │                                               │      │   │
│  │   │      ╭───────╮                                │      │   │
│  │   │      │ 0.00  │  g/L                          │      │   │
│  │   │      │  🟢   │  Sobre maintenant             │      │   │
│  │   │      ╰───────╯                                │      │   │
│  │   │                                               │      │   │
│  │   │  ┌─────────────┐  ┌─────────────┐            │      │   │
│  │   │  │ Ce soir     │  │ Cette sem.  │            │      │   │
│  │   │  │ €0 / €30   │  │ 3j sobre    │            │      │   │
│  │   │  │ budget     │  │ 🔥streak   │            │      │   │
│  │   │  └─────────────┘  └─────────────┘            │      │   │
│  │   │                                               │      │   │
│  │   └───────────────────────────────────────────────┘      │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │  🎯 OBJECTIF HEBDO  3/14 unités        ████░░  │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  QUOI DE NEUF ?                                        │   │
│  │                                                          │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │  💬  Tu es sobre depuis 3 jours !              │   │   │
│  │  │      "C'est bien, continue comme ça"            │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐      │
│  │     📊        │  │     💰        │  │     📅        │      │
│  │   Insights    │  │    Budget    │  │   Sessions    │      │
│  └───────────────┘  └───────────────┘  └───────────────┘      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │   [  + J'AI BU UN VERRE ]                              │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Session Active :**

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Session ce soir                         🏁 Terminer         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │              🍺  TU EN ES À                            │   │
│  │                                                          │   │
│  │                 3 VERRES                                │   │
│  │                                                          │   │
│  │           ━━━━━━━━━━━━━━░░░░░░                        │   │
│  │           Objectif : 5           Budget : 15€            │   │
│  │                                                          │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │   │
│  │  │ 0.25    │  │ 22:30   │  │ 12€      │              │   │
│  │  │ g/L     │  │ Durée   │  │ Dépensé  │              │   │
│  │  │ 🟢 OK   │  │ 1h30    │  │ 40%      │              │   │
│  │  └──────────┘  └──────────┘  └──────────┘              │   │
│  │                                                          │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │         +1 VERRE                                │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  💡 "Tu es à 60% de ton objectif, c'est bien parti !"         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🏠 Rentrer ?                                           │   │
│  │  Partage ta position avec Sophie pour qu'elle            │   │
│  │  puisse suivre ton retour.                              │   │
│  │                                                          │   │
│  │  [PARTAGER MA POSITION]  [PLUS TARD]                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Sprint de Refactorisation

### Phase 1 : Fondation (Sprint 1-3) - MVP

```
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 1 : MVP WELLBEING                      │
│                    Duration : 3 sprints (6 semaines)            │
└─────────────────────────────────────────────────────────────────┘

PRIORITÉS :
━━━━━━━━━━
1. Refactor navigation (mono-user)
2. Nouveau dashboard unifié
3. Session tracking enrichie
4. Onboarding bienveillant

TÂCHES DÉTAILLÉES :
━━━━━━━━━━━━━━━━━━

Sprint 1 : Infrastructure
──────────────────────
□ Supprimer features family/calendar/chores
□ Créer nouvelle structure features/wellbeing/
□ Migrer alcohol → wellbeing
□ Refactor navigation (sidebar → bottom nav + tabs)
□ Configurer novo Appwrite collections

Sprint 2 : Core UX
────────────────
□ Nouveau Dashboard principal
□ Composant BACCard enrichi
□ Intégration budget dans dashboard
□ Quick-add bar amélioreé
□ Session management (start/end)

Sprint 3 : Onboarding & polish
───────────────────────────
□ Nouvel onboarding bienveillant
□ Onboarding budget (optionnel)
□ Feedback system (toasts, animations)
□ Tests utilisateur
□ Bug fixes
```

**Livrable Phase 1 :**
- Application fonctionnelle avec tracking alcool + budget
- Onboarding fluide
- Dashboard unifié avec tous les KPIs essentiels

### Phase 2 : Budget & Finance (Sprint 4-6)

```
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 2 : BUDGET INTELLIGENT                 │
│                    Duration : 3 sprints (6 semaines)            │
└─────────────────────────────────────────────────────────────────┘

PRIORITÉS :
━━━━━━━━━━
1. Système budget complet
2. Page historique détaillée
3. Insights financiers
4. Écrans budget dedicated

TÂCHES DÉTAILLÉES :
━━━━━━━━━━━━━━━━━━

Sprint 4 : Budget Core
────────────────────
□ Service budget (create, calculate, alerts)
□ Hook useBudget
□ Composant BudgetOverview
□ Intégration dépenses dans session

Sprint 5 : Analytics Finance
─────────────────────────
□ Page Budget dédiée
□ Graphiques répartition
□ Projections yearly/monthly
□ Équivalences (cafés, concerts...)
□ Export données (CSV/PDF)

Sprint 6 : Polish & Education
───────────────────────────
□ Tips financiers contextuels
□ Achievements budget
□ Documentation in-app
□ Tests utilisateur
□ Optimisations perf
```

**Livrable Phase 2 :**
- Système budget complet avec alertes
- Page insights financiers détaillée
- Gamification budget (badges, streaks)

### Phase 3 : Localisation & Cercle (Sprint 7-9)

```
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 3 : SÉCURITÉ & CERCLE                  │
│                    Duration : 3 sprints (6 semaines)            │
└─────────────────────────────────────────────────────────────────┘

PRIORITÉS :
━━━━━━━━━━
1. Système localisation
2. Cercle de confiance
3. Alertes automatiques
4. Mode sécurité

TÂCHES DÉTAILLÉES :
━━━━━━━━━━━━━━━━━━

Sprint 7 : Localisation
──────────────────────
□ Service location (GPS, geofencing)
□ Hook useLocation
□ Composants LocationToggle, CircleStatus
□ UI carte + position
□ Chiffrement position

Sprint 8 : Cercle
─────────────────
□ Service circle (CRUD, invites)
□ Hook useCircle
□ Page gestion cercle
□ Notifications cercle
□ Système alerts (late home, BAC)

Sprint 9 : Sécurité
───────────────────
□ Mode SOS
□ Check-in automatique
□ Notification bienveillantes
□ Tests et sécurité
□ Documentation légale
```

**Livrable Phase 3 :**
- Localisation optionnelle avec encryption
- Cercle de confiance (max 3-5 personnes)
- Alertes automatiques bienveillantes
- Mode SOS

### Phase 4 : Intelligence & Personnalisation (Sprint 10-12)

```
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 4 : INSIGHTS & IA                     │
│                    Duration : 3 sprints (6 semaines)            │
└─────────────────────────────────────────────────────────────────┘

PRIORITÉS :
━━━━━━━━━━
1. Insights avancés
2. Weekly reports
3. IA tips personalisés
4. Parrains/Situations

TÂCHES DÉTAILLÉES :
━━━━━━━━━━━━━━━━━━

Sprint 10 : Insights Pro
──────────────────────
□ Service insights (patterns, trends)
□ Génération insights contextuels
□ Algorithme tips personalisés
□ Page Insights dédiée

Sprint 11 : Reports
──────────────────
□ Weekly report generation
□ Monthly summary
□ Comparaisons anonymes
□ Partage (optionnel)

Sprint 12 : Polish Final
───────────────────────
□ Parrains/situations identification
□ ML léger (patterns)
□ Internationalisation (EN, ES)
□ Release preparation
□ Marketing materials
```

**Livrable Phase 4 :**
- Insights IA bienveillants
- Reports hebdos/mensuels
- Identification patterns
- Préparation launch

---

## 9. Risques & Mitigations

### 9.1 Matrice des Risques

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MATRICE RISQUES                                    │
├─────────────┬────────────┬──────────────┬──────────────────┬──────────────┤
│   RISQUE    │ PROBABILITÉ│   IMPACT     │   NIVEAU         │  MITIGATION  │
├─────────────┼────────────┼──────────────┼──────────────────┼──────────────┤
│ Adoption    │     🔴     │     🔴       │  🔴 CRITIQUE     │ MVP rapide   │
│ faible      │   Haute    │   Blockant   │                  │ + feedback   │
├─────────────┼────────────┼──────────────┼──────────────────┼──────────────┤
│ Moralisation│     🟡     │     🔴       │  🟠 ÉLEVÉ        │ Tone guide   │
│ perçue      │   Moyenne  │   Majeur     │                  │ + tests UX   │
├─────────────┼────────────┼──────────────┼──────────────────┼──────────────┤
│ Données     │     🟢     │     🔴       │  🟠 ÉLEVÉ        │ Privacy by   │
│ sensibles   │   Basse    │   Majeur     │                  │ design       │
├─────────────┼────────────┼──────────────┼──────────────────┼──────────────┤
│ Appwrite    │     🟡     │     🟡       │  🟡 MODÉRÉ       │ Fallback     │
│ down        │   Moyenne  │   Modéré    │                  │ offline      │
├─────────────┼────────────┼──────────────┼──────────────────┼──────────────┤
│ Complexité  │     🟡     │     🟡       │  🟡 MODÉRÉ       │ Phases       │
│ technique   │   Moyenne  │   Modéré    │                  │ itératives   │
├─────────────┼────────────┼──────────────┼──────────────────┼──────────────┤
│ Légal       │     🟢     │     🟠       │  🟡 MODÉRÉ       │ Juridique    │
│ (RGPD)      │   Basse    │   Majeur     │                  │ review       │
├─────────────┼────────────┼──────────────┼──────────────────┼──────────────┤
│ Localisation│     🟡     │     🟡       │  🟡 MODÉRÉ       │ Encryption   │
│ - abuse     │   Moyenne  │   Modéré    │                  │ + opt-in     │
├─────────────┼────────────┼──────────────┼──────────────────┼──────────────┤
│ Burnout     │     🟡     │     🟡       │  🟡 MODÉRÉ       │ Tests        │
│ dev         │   Moyenne  │   Modéré    │                  │ régulaires   │
└─────────────┴────────────┴──────────────┴──────────────────┴──────────────┘
```

### 9.2 Plan de Mitigation Détaillé

#### Risque 1 : Adoption Faible

```
PROBLÈME : Les utilisateurs n'adoptent pas l'application

MITIGATIONS :
───────────
1. Validation utilisateur tôt
   → Tests utilisateurs dès Sprint 2
   → A/B testing onboarding
   
2. Onboarding ultra-court
   → Maximum 3 écrans pour commencer
   → Valeur immédiate visible
   
3. Toucher émotionnel
   → Celebrations (confettis)
   → Acknowledgment progrès
   → Messages personnalisés

4. Canal dfeedback
   → "Donner mon avis" visible
   → Communauté Discord/Reddit
```

#### Risque 2 : Perception Moraliste

```
PROBLÈME : L'app semble dire "ne bois pas"

MITIGATIONS :
───────────
1. Tone of voice documenté
   → Review de TOUT le texte
   → Validation avec utilisateurs cibles
   
2. Neutralité positive
   → Jamais "trop bu", dire "au-delà de l'objectif"
   → Célébrer les petits progrès
   
3. Pas de guilt-trip
   → Supprimer tout messaging type "regarde les dégâts"
   → Toast toujours positifs ou neutres
   
4. Visuels appropriés
   → Éviter images moralisatrices
   → Privilégier abstraction élégante
```

#### Risque 3 : Données Localisation

```
PROBLÈME : Utilisation abusive de la localisation

MITIGATIONS :
───────────
1. Privacy by design
   → Jamais par défaut
   → Chiffrement E2E
   → Pas de stockage serveur
   
2. Durées limitées
   → Max 12h par session
   → Expiration automatique
   
3. Contrôle total utilisateur
   → Arrêt en 1 clic
   → Clear data option
   
4. Réduction données
   → Position floutée (±100m)
   → Pas d'historique continu
```

#### Risque 4 : Complexité Technique

```
PROBLÈME : Trop de features = code spaghetti

MITIGATIONS :
───────────
1. Architecture modulaire
   → Chaque feature isolée
   → Tests unitaires par feature
   
2. Feature flags
   → Déployer sans activer
   → Rollback facile
   
3. Code review strict
   → 2 approbations pour merge
   → Linting obligatoire
   
4. Documentation vivante
   → ADRs pour décisions clés
   → README à jour
```

---

## 10. Roadmap Synthétique

```
        2024                    2025
        ─────                   ─────
        
S1 S2 S3 S4 S5 S6  |  S7 S8 S9 S10 S11 S12
────────────────────┼─────────────────────────

█████████████████████│████████████████████████
 PHASE 1 : MVP      │ PHASE 2 : BUDGET
────────────────────┼████████████████████████

                     │████████████████████████
                     │ PHASE 3 : LOCALISATION
                     │████████████████████████
                     │
                     │████████████████████████
                     │ PHASE 4 : INTELLIGENCE
                     │████████████████████████
```

---

## 11. Évolutions Futures (Post-Launch)

### 11.1 Court Terme (6-12 mois)

| Feature | Description | Impact |
|---------|-------------|--------|
| Apple Watch | Complications + notifications | Engagement |
| Wearables integration | Fitbit, Garmin | Précision stats |
| Widgets | iOS/Android | Convenience |
| Shortcuts | Siri, Google Assistant | Voice control |

### 11.2 Moyen Terme (12-24 mois)

| Feature | Description | Impact |
|---------|-------------|--------|
| Social | Ajouter buddies (opt-in) | Engagement |
| Challenges | Défis entre buddies | Gamification |
| Professional network | Thérapeutes, coachs | Premium |
| API tiers | Calorie tracking, sleep | Écosystème |

### 11.3 Long Terme (24+ mois)

| Feature | Description | Impact |
|---------|-------------|--------|
| IA Coaching | Tips ultra-personnalisés | Différenciation |
| Research | Données anonymisées | Revenue alternatif |
| Enterprise | Programme RH entreprises | B2B |
| International | Multi-langues + pays | Scale |

---

## 12. Checklist Pré-Launch

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHECKLIST PRÉ-LAUNCH                         │
└─────────────────────────────────────────────────────────────────┘

FONCTIONNALITÉS :
━━━━━━━━━━━━━━━━
□ Tracking alcool fonctionnel
□ Calcul BAC correct
□ Session management
□ Dashboard unifié
□ Onboarding complet
□ Budget tracking
□ Historique sessions
□ Notifications
□ Localisation (si Phase 3 faite)

CONFORMITÉ :
━━━━━━━━━━━
□ RGPD audit passed
□ Privacy policy updated
□ Terms of service updated
□ Cookie consent (si analytics)
□ Data deletion flow tested
□ Export data flow tested

SÉCURITÉ :
━━━━━━━━━━
□ HTTPS everywhere
□ Appwrite rules configured
□ Input validation
□ XSS protection
□ Rate limiting
□ Encryption keys rotated

UX/UI :
━━━━━━━
□ Mobile responsive
□ Dark mode
□ Accessibility (WCAG 2.1 AA)
□ Offline fallback
□ Loading states
□ Error states
□ Empty states

TESTING :
━━━━━━━━━
□ Unit tests (>80% coverage)
□ Integration tests
□ E2E tests (critical flows)
□ Beta testing (10-20 users)
□ A/B testing setup
□ Analytics events

MISE EN LIGNE :
━━━━━━━━━━━━━━━
□ App stores (iOS, Android)
□ Domain configured
□ SSL certificate
□ CDN configured
□ Monitoring setup
□ Alerting setup
□ Rollback plan
```

---

## 13. Conclusion

Ce plan propose une transformation complète de Family Hub vers **WellHub**, une application de bien-être bienveillante centrée sur la conscience de sa consommation d'alcool.

### Points Clés :

1. **Recentrage fort** : Suppression des features hors-scope, focus sur le bien-être personnel
2. **Architecture modulaire** : Chaque module (budget, localisation, insights) peut être développé et testé indépendamment
3. **Parcours utilisateurs définis** : Avant/Pendant/Après sortie avec UX claire et bienveillante
4. **Confidentialité first** : Localisation optionnelle, chiffrement, contrôle total utilisateur
5. **Phases réalistes** : MVP en 6 semaines, puis itérations de 6 semaines

### Prochaines Étapes :

1. **Décision** : Valider la direction avec stakeholders
2. **Priorisation** : Ajuster les phases selon contraintes
3. **Kickoff** : Sprint 1 = Suppressions + Infrastructure
4. **Feedback** : Tests utilisateurs dès Sprint 2

---

*Document créé : Janvier 2025*
*Dernière mise à jour : Janvier 2025*
*Version : 1.0*