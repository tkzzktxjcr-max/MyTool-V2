#!/bin/bash

# Configuration
ENDPOINT="https://backend.071098v2.duckdns.org/v1"
API_KEY="standard_e12ff812a90093edebb0f9642d57cc93efa3329c65f169f8450c002fb1975042c5cb7dd4ff3ed659ac1ab5730032fd2c2daaa1f59e84b98dd78c058cfd255157d08eca34cfb81daf10ec09c8db238c2ba038b8591e17fe156f4723b0a2b0169c620639743f15380f9b58c3b2c9ee491b6de662644eea42212626a4fc8bfc3f19"

echo "🚀 Configuration Appwrite - Family Hub"
echo "===================================="
echo ""

# Headers
HEADERS="-H \"Content-Type: application/json\" -H \"X-Appwrite-Key: $API_KEY\""

# 1. Créer la base de données
echo "📦 Création de la base de données..."
RESULT=$(curl -s -X POST "$ENDPOINT/databases" $HEADERS -d '{"name":"family_hub","permissions":["read(\"users\")","create(\"users\")","update(\"users\")","delete(\"users\")]"}')
DB_ID=$(echo $RESULT | grep -o '"$id":"[^"]*"' | cut -d'"' -f4)
if [ -n "$DB_ID" ]; then
    echo "✅ Base de données créée: $DB_ID"
else
    echo "ℹ️ Base de données existe déjà (ou erreur)"
    DB_ID="family_hub"
fi

# 2. Créer les collections
echo ""
echo "📦 Création des collections..."

# users_profile
curl -s -X POST "$ENDPOINT/databases/$DB_ID/collections" $HEADERS \
  -d '{"name":"users_profile","permissions":["read(\"users\")","create(\"users\")","update(\"users\")","delete(\"users\")"],"attributes":[{"key":"userId","type":"string","size":50,"required":true},{"key":"email","type":"string","size":255,"required":true},{"key":"name","type":"string","size":255,"required":true},{"key":"familyId","type":"string","size":50,"required":false},{"key":"avatar","type":"string","size":500,"required":false},{"key":"createdAt","type":"datetime","required":false}]}' > /dev/null
echo "✅ users_profile"

# families
curl -s -X POST "$ENDPOINT/databases/$DB_ID/collections" $HEADERS \
  -d '{"name":"families","permissions":["read(\"users\")","create(\"users\")","update(\"users\")","delete(\"users\")"],"attributes":[{"key":"name","type":"string","size":255,"required":true},{"key":"ownerId","type":"string","size":50,"required":true},{"key":"inviteCode","type":"string","size":20,"required":false},{"key":"monthlyBudget","type":"double","required":false},{"key":"createdAt","type":"datetime","required":false}]}' > /dev/null
echo "✅ families"

# family_members
curl -s -X POST "$ENDPOINT/databases/$DB_ID/collections" $HEADERS \
  -d '{"name":"family_members","permissions":["read(\"users\")","create(\"users\")","update(\"users\")","delete(\"users\")"],"attributes":[{"key":"familyId","type":"string","size":50,"required":true},{"key":"userId","type":"string","size":50,"required":true},{"key":"role","type":"string","size":20,"required":true},{"key":"name","type":"string","size":255,"required":true},{"key":"avatar","type":"string","size":500,"required":false}]}' > /dev/null
echo "✅ family_members"

# events
curl -s -X POST "$ENDPOINT/databases/$DB_ID/collections" $HEADERS \
  -d '{"name":"events","permissions":["read(\"users\")","create(\"users\")","update(\"users\")","delete(\"users\")"],"attributes":[{"key":"familyId","type":"string","size":50,"required":true},{"key":"title","type":"string","size":255,"required":true},{"key":"description","type":"string","size":1000,"required":false},{"key":"date","type":"datetime","required":true},{"key":"endDate","type":"datetime","required":false},{"key":"color","type":"string","size":20,"required":false},{"key":"category","type":"string","size":50,"required":false},{"key":"assignedTo","type":"string","size":50,"required":false},{"key":"reminder","type":"boolean","required":false},{"key":"createdBy","type":"string","size":50,"required":true}]}' > /dev/null
echo "✅ events"

# chores
curl -s -X POST "$ENDPOINT/databases/$DB_ID/collections" $HEADERS \
  -d '{"name":"chores","permissions":["read(\"users\")","create(\"users\")","update(\"users\")","delete(\"users\")"],"attributes":[{"key":"familyId","type":"string","size":50,"required":true},{"key":"title","type":"string","size":255,"required":true},{"key":"description","type":"string","size":500,"required":false},{"key":"frequency","type":"string","size":20,"required":false},{"key":"points","type":"integer","required":false},{"key":"assignedTo","type":"string","size":50,"required":false},{"key":"dueDate","type":"datetime","required":false},{"key":"status","type":"string","size":20,"required":false},{"key":"createdBy","type":"string","size":50,"required":true}]}' > /dev/null
echo "✅ chores"

# budget_entries
curl -s -X POST "$ENDPOINT/databases/$DB_ID/collections" $HEADERS \
  -d '{"name":"budget_entries","permissions":["read(\"users\")","create(\"users\")","update(\"users\")","delete(\"users\")"],"attributes":[{"key":"familyId","type":"string","size":50,"required":true},{"key":"amount","type":"double","required":true},{"key":"category","type":"string","size":50,"required":true},{"key":"description","type":"string","size":255,"required":false},{"key":"date","type":"datetime","required":true},{"key":"type","type":"string","size":20,"required":true},{"key":"createdBy","type":"string","size":50,"required":true}]}' > /dev/null
echo "✅ budget_entries"

# alcohol_logs
curl -s -X POST "$ENDPOINT/databases/$DB_ID/collections" $HEADERS \
  -d '{"name":"alcohol_logs","permissions":["read(\"users\")","create(\"users\")","update(\"users\")","delete(\"users\")"],"attributes":[{"key":"userId","type":"string","size":50,"required":true},{"key":"date","type":"datetime","required":true},{"key":"drinkType","type":"string","size":50,"required":true},{"key":"volumeCl","type":"double","required":true},{"key":"abv","type":"double","required":true},{"key":"units","type":"double","required":true},{"key":"context","type":"string","size":100,"required":false},{"key":"notes","type":"string","size":500,"required":false},{"key":"mood","type":"string","size":50,"required":false}]}' > /dev/null
echo "✅ alcohol_logs"

echo ""
echo "===================================="
echo "✅ Configuration terminée !"
echo ""
echo "Database ID: $DB_ID"
echo ""
echo "Mettez à jour votre .env:"
echo "VITE_APPWRITE_DATABASE_ID=$DB_ID"