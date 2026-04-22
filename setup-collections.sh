#!/bin/bash

ENDPOINT="https://backend.071098v2.duckdns.org/v1"
API_KEY="standard_e12ff812a90093edebb0f9642d57cc93efa3329c65f169f8450c002fb1975042c5cb7dd4ff3ed659ac1ab5730032fd2c2daaa1f59e84b98dd78c058cfd255157d08eca34cfb81daf10ec09c8db238c2ba038b8591e17fe156f4723b0a2b0169c620639743f15380f9b58c3b2c9ee491b6de662644eea42212626a4fc8bfc3f19"
DB_ID="family_hub"

echo "🚀 Création des collections..."

# 1. users_profile
echo "1/7 - users_profile"
curl -s -X POST "$ENDPOINT/databases/$DB_ID/collections" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Key: $API_KEY" \
  -d '{"name":"users_profile","attributes":[{"key":"userId","type":"string","size":50,"required":true},{"key":"email","type":"string","size":255,"required":true},{"key":"name","type":"string","size":255,"required":true},{"key":"familyId","type":"string","size":50,"required":false},{"key":"avatar","type":"string","size":500,"required":false},{"key":"createdAt","type":"datetime","required":false}]}'
echo ""

# 2. families
echo "2/7 - families"
curl -s -X POST "$ENDPOINT/databases/$DB_ID/collections" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Key: $API_KEY" \
  -d '{"name":"families","attributes":[{"key":"name","type":"string","size":255,"required":true},{"key":"ownerId","type":"string","size":50,"required":true},{"key":"inviteCode","type":"string","size":20,"required":false},{"key":"monthlyBudget","type":"float","required":false},{"key":"createdAt","type":"datetime","required":false}]}'
echo ""

# 3. family_members
echo "3/7 - family_members"
curl -s -X POST "$ENDPOINT/databases/$DB_ID/collections" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Key: $API_KEY" \
  -d '{"name":"family_members","attributes":[{"key":"familyId","type":"string","size":50,"required":true},{"key":"userId","type":"string","size":50,"required":true},{"key":"role","type":"string","size":20,"required":true},{"key":"name","type":"string","size":255,"required":true},{"key":"avatar","type":"string","size":500,"required":false}]}'
echo ""

# 4. events
echo "4/7 - events"
curl -s -X POST "$ENDPOINT/databases/$DB_ID/collections" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Key: $API_KEY" \
  -d '{"name":"events","attributes":[{"key":"familyId","type":"string","size":50,"required":true},{"key":"title","type":"string","size":255,"required":true},{"key":"description","type":"string","size":1000,"required":false},{"key":"date","type":"datetime","required":true},{"key":"endDate","type":"datetime","required":false},{"key":"color","type":"string","size":20,"required":false},{"key":"category","type":"string","size":50,"required":false},{"key":"assignedTo","type":"string","size":50,"required":false},{"key":"reminder","type":"boolean","required":false},{"key":"createdBy","type":"string","size":50,"required":true}]}'
echo ""

# 5. chores
echo "5/7 - chores"
curl -s -X POST "$ENDPOINT/databases/$DB_ID/collections" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Key: $API_KEY" \
  -d '{"name":"chores","attributes":[{"key":"familyId","type":"string","size":50,"required":true},{"key":"title","type":"string","size":255,"required":true},{"key":"description","type":"string","size":500,"required":false},{"key":"frequency","type":"string","size":20,"required":false},{"key":"points","type":"integer","required":false},{"key":"assignedTo","type":"string","size":50,"required":false},{"key":"dueDate","type":"datetime","required":false},{"key":"status","type":"string","size":20,"required":false},{"key":"createdBy","type":"string","size":50,"required":true}]}'
echo ""

# 6. budget_entries
echo "6/7 - budget_entries"
curl -s -X POST "$ENDPOINT/databases/$DB_ID/collections" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Key: $API_KEY" \
  -d '{"name":"budget_entries","attributes":[{"key":"familyId","type":"string","size":50,"required":true},{"key":"amount","type":"float","required":true},{"key":"category","type":"string","size":50,"required":true},{"key":"description","type":"string","size":255,"required":false},{"key":"date","type":"datetime","required":true},{"key":"type","type":"string","size":20,"required":true},{"key":"createdBy","type":"string","size":50,"required":true}]}'
echo ""

# 7. alcohol_logs
echo "7/7 - alcohol_logs"
curl -s -X POST "$ENDPOINT/databases/$DB_ID/collections" \
  -H "Content-Type: application/json" \
  -H "X-Appwrite-Key: $API_KEY" \
  -d '{"name":"alcohol_logs","attributes":[{"key":"userId","type":"string","size":50,"required":true},{"key":"date","type":"datetime","required":true},{"key":"drinkType","type":"string","size":50,"required":true},{"key":"volumeCl","type":"float","required":true},{"key":"abv","type":"float","required":true},{"key":"units","type":"float","required":true},{"key":"context","type":"string","size":100,"required":false},{"key":"notes","type":"string","size":500,"required":false},{"key":"mood","type":"string","size":50,"required":false}]}'
echo ""

echo "✅ Terminé !"