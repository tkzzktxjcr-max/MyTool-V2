# Backend Setup - Appwrite Collections

## Collections à créer

### 1. `live_sessions`

Partage de position GPS en temps réel.

| Attribut | Type | Requis | Description |
|----------|------|--------|-------------|
| `userId` | String | ✅ | ID de l'utilisateur qui partage |
| `circleId` | String | ✅ | ID du cercle (utilise `userId` du propriétaire) |
| `isActive` | Boolean | ✅ | Session active ou non |
| `accuracy` | String | ✅ | `precise` ou `approximate` |
| `durationMinutes` | Integer | ✅ | Durée en minutes (-1 = illimité) |
| `startedAt` | DateTime | ✅ | Début de session |
| `expiresAt` | DateTime | ✅ | Expiration automatique |
| `status` | String | ✅ | `ok`, `heading_home`, `need_help`, `low_battery` |
| `lastLocation` | String | ❌ | JSON: `{lat, lng, timestamp}` |
| `batteryLevel` | Integer | ❌ | Niveau batterie (0-100) |
| `eta` | String | ❌ | Heure d'arrivée estimée |
| `safeReturnMode` | Boolean | ✅ | Mode retour sécurisé actif |
| `safeReturnDestination` | String | ❌ | JSON: `{lat, lng, address?}` |
| `safeReturnTransportMode` | String | ❌ | `walk`, `bike`, `car`, `transit` |
| `userName` | String | ❌ | Nom affiché sur la carte |

**Permissions:**
- Read: `label:users` (tous les utilisateurs authentifiés peuvent lire pour voir leurs amis)
- Create/Update/Delete: `label:users`

---

### 2. `safety_events`

Événements de sécurité (anomalies détectées).

| Attribut | Type | Requis | Description |
|----------|------|--------|-------------|
| `sessionId` | String | ✅ | ID de la session live associée |
| `userId` | String | ✅ | ID de l'utilisateur concerné |
| `type` | String | ✅ | `stopped_abnormally`, `low_battery`, `isolated`, `manual_check_in`, `arrived_home` |
| `severity` | String | ✅ | `info` ou `soft_warning` |
| `message` | String | ✅ | Message affiché |
| `location` | String | ❌ | JSON: `{lat, lng, timestamp}` |
| `isResolved` | Boolean | ✅ | Événement résolu |

**Permissions:**
- Read: `label:users`
- Create/Update/Delete: `label:users`

---

### 3. `emergency_alerts`

Alertes d'urgence déclenchées manuellement.

| Attribut | Type | Requis | Description |
|----------|------|--------|-------------|
| `userId` | String | ✅ | ID de l'utilisateur en détresse |
| `circleId` | String | ✅ | ID du cercle |
| `location` | String | ❌ | JSON: `{lat, lng, timestamp}` |
| `isActive` | Boolean | ✅ | Alerte toujours active |
| `resolvedAt` | DateTime | ❌ | Date de résolution |

**Permissions:**
- Read: `label:users`
- Create/Update/Delete: `label:users`

---

## Configuration des index (recommandé)

Pour des performances optimales, ajoutez ces index dans Appwrite :

### `live_sessions`
- `userId` (égalité)
- `circleId` + `isActive` + `expiresAt` (pour `getActiveSessions`)
- `isActive` + `expiresAt` (pour le cleanup)

### `safety_events`
- `sessionId` (égalité)
- `userId` + `createdAt` (ordre décroissant)

### `emergency_alerts`
- `circleId` + `isActive` (égalité)

---

## Variables d'environnement frontend

Ajoutez ces variables dans votre `.env` :

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=votre_project_id
VITE_APPWRITE_DATABASE_ID=votre_database_id

# Collections existantes
VITE_COLLECTION_USERS_PROFILE=users_profile
VITE_COLLECTION_FAMILIES=families
VITE_COLLECTION_FAMILY_MEMBERS=family_members
VITE_COLLECTION_EVENTS=events
VITE_COLLECTION_CHORES=chores
VITE_COLLECTION_BUDGET_ENTRIES=budget_entries
VITE_COLLECTION_ALCOHOL_LOGS=alcohol_logs
VITE_COLLECTION_DRINKS=drinks
VITE_COLLECTION_GOALS=goals
VITE_COLLECTION_USER_PROFILES=user_profiles
VITE_COLLECTION_CIRCLE_INVITATIONS=circle_invitations
VITE_COLLECTION_CIRCLE_MEMBERS=circle_members
VITE_COLLECTION_CIRCLE_ALERTS=circle_alerts
VITE_COLLECTION_CIRCLE_EMERGENCY=circle_emergency_sessions

# Nouvelles collections Live Circle
VITE_COLLECTION_LIVE_SESSIONS=live_sessions
VITE_COLLECTION_SAFETY_EVENTS=safety_events
VITE_COLLECTION_EMERGENCY_ALERTS=emergency_alerts
```

---

## Notes importantes

1. **Realtime**: Activez les permissions realtime sur les collections `live_sessions` et `circle_alerts` pour que les mises à jour de position soient instantanées.

2. **Cleanup**: Configurez une fonction Appwrite cron (ou faites-le côté client) pour désactiver automatiquement les sessions expirées :
   - Requête: `isActive = true` AND `expiresAt < now`
   - Action: Mettre `isActive = false`

3. **Sécurité**: Les positions GPS sont sensibles. Bien que les permissions soient ouvertes (`label:users`), l'application filtre côté client pour n'afficher que les amis. Pour une sécurité renforcée, envisagez de vérifier la relation d'amitié côté serveur avec une Appwrite Function.

4. **Stockage**: Les positions ne sont pas stockées historiquement. Seule la dernière position de la session active est conservée. Les sessions désactivées ne sont pas supprimées mais ont `isActive = false`.