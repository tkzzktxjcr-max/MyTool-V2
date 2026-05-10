# 🚀 Déploiement Coolify — WellHub

## Prérequis

- Instance Coolify active
- Projet Appwrite configuré avec les collections listées dans `README.md`

## Étape 1 : Push du code

Le Dockerfile est à la racine. Coolify le détecte automatiquement.

```bash
git add Dockerfile docs/COOLIFY_SETUP.md
git commit -m "chore: Coolify deployment ready"
git push origin main
```

## Étape 2 : Créer l'application dans Coolify

1. **Nouvelle application** → **Dockerfile**
2. **Repository** : `tkzzktxjcr-max/MyTool-V2`
3. **Branch** : `main`

## Étape 3 : Variables d'environnement (OBLIGATOIRES)

Dans Coolify → **Environment Variables**, ajoute :

| Variable | Description | Exemple |
|---|---|---|
| `VITE_APPWRITE_ENDPOINT` | URL Appwrite | `https://cloud.appwrite.io/v1` |
| `VITE_APPWRITE_PROJECT_ID` | ID du projet Appwrite | `abc123xyz` |
| `VITE_APPWRITE_DATABASE_ID` | ID de la base de données | `mytool_db` |

### Variables optionnelles (fallback dans le code si absentes)

| Variable | Fallback |
|---|---|
| `VITE_COLLECTION_USERS_PROFILE` | `users_profile` |
| `VITE_COLLECTION_FAMILIES` | `families` |
| `VITE_COLLECTION_FAMILY_MEMBERS` | `family_members` |
| `VITE_COLLECTION_EVENTS` | `events` |
| `VITE_COLLECTION_CHORES` | `chores` |
| `VITE_COLLECTION_BUDGET_ENTRIES` | `budget_entries` |
| `VITE_COLLECTION_ALCOHOL_LOGS` | `alcohol_logs` |
| `VITE_COLLECTION_DRINKS` | `drinks` |
| `VITE_COLLECTION_GOALS` | `goals` |
| `VITE_COLLECTION_USER_PROFILES` | `user_profiles` |
| `VITE_COLLECTION_CIRCLE_INVITATIONS` | `circle_invitations` |
| `VITE_COLLECTION_CIRCLE_MEMBERS` | `circle_members` |
| `VITE_COLLECTION_CIRCLE_ALERTS` | `circle_alerts` |
| `VITE_COLLECTION_CIRCLE_EMERGENCY` | `circle_emergency_sessions` |
| `VITE_COLLECTION_LIVE_SESSIONS` | `live_sessions` |
| `VITE_COLLECTION_SAFETY_EVENTS` | `safety_events` |
| `VITE_COLLECTION_EMERGENCY_ALERTS` | `emergency_alerts` |

> ⚠️ **Important** : Vite inline les variables `VITE_*` au **build time** (pas au runtime). Elles doivent être présentes AVANT que Coolify ne lance `docker build`.

## Étape 4 : Build et déploiement

1. Coolify détecte automatiquement le `Dockerfile`
2. Le builder stage installe les déps et build avec les `VITE_*` injectés
3. Le runner stage sert les fichiers statiques via Nginx sur le port **80**
4. Configure ton domaine dans Coolify (ex: `wellhub.071098v2.duckdns.org`)

## Étape 5 : Post-déploiement

1. **CORS Appwrite** : ajoute ton domaine Coolify dans Appwrite → Settings → Platforms → Web
2. **Permissions** : vérifie que les collections ont les bonnes permissions (voir `README.md`)
3. **Clear cache** : `Ctrl+Shift+R` (hard refresh) pour forcer le navigateur à charger la nouvelle version

## 🔧 Dépannage

| Problème | Cause probable | Solution |
|---|---|---|
| Écran blanc après déploiement | Build args `VITE_*` manquants | Vérifier les env vars dans Coolify |
| `401 Unauthorized` sur Appwrite | CORS non configuré | Ajouter le domaine dans Appwrite Platforms |
| Ancienne version affichée | Cache navigateur | Hard refresh + `localStorage.clear()` |
| `Module not found` au build | `node_modules` corrompu | Redéployer avec "Force rebuild" dans Coolify |

## 📦 Build local (test avant push)

```bash
# Avec les variables en local
docker build \
  --build-arg VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1 \
  --build-arg VITE_APPWRITE_PROJECT_ID=xxx \
  --build-arg VITE_APPWRITE_DATABASE_ID=yyy \
  -t wellhub .

# Test
docker run -p 8080:80 wellhub
# Ouvrir http://localhost:8080
```