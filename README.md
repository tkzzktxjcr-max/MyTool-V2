# 🏠 Family Hub

Application de gestion familiale complète avec suivi de consommation d'alcool et insights santé.

## 🚀 Fonctionnalités

### 📅 Calendrier Partagé
- Gestion des événements familiaux
- Catégories (famille, école, travail, loisirs, médical)
- Attribution aux membres

### 🧹 Corvées
- Attribution des tâches ménagères
- Système de points pour les enfants
- Suivi de l'historique
- Classement des membres

### 💰 Budget Familial
- Suivi des dépenses et revenus
- Catégories prédéfinies
- Objectifs de budget
- Visualisations (graphiques)

### 🍷 Tracker Alcool
- Enregistrement des consommations
- Calcul automatique des unités
- Insights santé personnalisés
- Respect des repères de l'OMS

### 👨‍👩‍👧‍👦 Gestion de Famille
- Création/rejoint de famille
- Codes d'invitation
- Gestion des membres

## 🛠️ Stack Technique

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Appwrite
- **Routing**: React Router v6
- **State**: React Context + Hooks
- **Charts**: Recharts

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Configurer Appwrite
cp .env.example .env
# Éditer .env avec vos identifiants Appwrite

# Lancer en développement
npm run dev
```

## 🔧 Configuration Appwrite

### 1. Créer un projet
- Se connecter à [Appwrite Console](https://cloud.appwrite.io)
- Créer un nouveau projet
- Activer l'authentification Email/Password

### 2. Créer la base de données
- Aller dans Database > Create Database
- Noter le Database ID

### 3. Créer les collections
Utiliser le fichier `appwrite-setup.json` ou créer manuellement avec les attributs suivants:

**users_profile:**
- userId (string, required)
- email (string, required)
- name (string, required)
- familyId (string, optional)
- avatar (string, optional)
- createdAt (datetime, optional)

**families:**
- name (string, required)
- ownerId (string, required)
- inviteCode (string, optional)
- monthlyBudget (float, optional)
- createdAt (datetime, optional)

**events:**
- familyId (string, required)
- title (string, required)
- description (string, optional)
- date (datetime, required)
- endDate (datetime, optional)
- color (string, optional)
- category (string, optional)
- assignedTo (string, optional)
- reminder (boolean, optional)
- createdBy (string, required)

**chores:**
- familyId (string, required)
- title (string, required)
- description (string, optional)
- frequency (string, optional)
- points (integer, optional)
- assignedTo (string, optional)
- dueDate (datetime, optional)
- status (string, optional)
- createdBy (string, required)

**budget_entries:**
- familyId (string, required)
- amount (float, required)
- category (string, required)
- description (string, optional)
- date (datetime, required)
- type (string, required)
- createdBy (string, required)

**alcohol_logs:**
- userId (string, required)
- date (datetime, required)
- drinkType (string, required)
- volumeCl (float, required)
- abv (float, required)
- units (float, required)
- context (string, optional)
- notes (string, optional)
- mood (string, optional)

### 4. Configurer les permissions
Pour chaque collection:
- Read: `label:users`
- Create: `label:users`
- Update: `label:users`
- Delete: `label:users`

Pour `alcohol_logs` (données sensibles):
- Read: `document($userId == userId)`
- Create: `label:users`
- Update: `document($userId == userId)`
- Delete: `document($userId == userId)`

## 🚢 Déploiement

### Coolify

1. Push le code sur GitHub/GitLab
2. Dans Coolify, ajouter une nouvelle application
3. Sélectionner le repository
4. Build pack: Dockerfile
5. Configurer les variables d'environnement:
   - `VITE_APPWRITE_ENDPOINT`
   - `VITE_APPWRITE_PROJECT_ID`
   - `VITE_APPWRITE_DATABASE_ID`
6. Déployer

### Docker Compose

```bash
docker build -t family-hub .
docker run -p 3000:80 \
  -e VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1 \
  -e VITE_APPWRITE_PROJECT_ID=your_project_id \
  -e VITE_APPWRITE_DATABASE_ID=your_database_id \
  family-hub
```

## 📱 Mobile

L'application est responsive et peut être utilisée sur mobile. Pour une expérience native:

### PWA
L'application peut être installée comme PWA sur iOS/Android.

### Capacitor (optionnel)
```bash
npm install @capacitor/core @capacitor/cli
npx cap init "Family Hub" "com.familyhub.app"
npx cap add ios
npx cap add android
npm run build
npx cap sync
```

## 🎨 Design

Palette de couleurs:
- Primary: `#FF6B6B` (Corail)
- Secondary: `#4ECDC4` (Turquoise)
- Accent: `#FFE66D` (Jaune doré)
- Background: `#FAF9F6` (Crème)

## 📝 Licence

MIT