#!/usr/bin/env node

const APPWRITE_ENDPOINT = 'https://backend.071098v2.duckdns.org/v1';
const APPWRITE_API_KEY = 'standard_e12ff812a90093edebb0f9642d57cc93efa3329c65f169f8450c002fb1975042c5cb7dd4ff3ed659ac1ab5730032fd2c2daaa1f59e84b98dd78c058cfd255157d08eca34cfb81daf10ec09c8db238c2ba038b8591e17fe156f4723b0a2b0169c620639743f15380f9b58c3b2c9ee491b6de662644eea42212626a4fc8bfc3f19';
const PROJECT_ID = '69e92d69002059298786';

// Headers pour toutes les requêtes
const headers = {
  'Content-Type': 'application/json',
  'X-Appwrite-Response-Format': '1.0.0',
  'X-Appwrite-Key': APPWRITE_API_KEY,
};

// Fonction pour créer une collection
async function createCollection(name, attributes) {
  const response = await fetch(`${APPWRITE_ENDPOINT}/databases/famille_hub/collections`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name,
      permissions: ['read("users")', 'create("users")', 'update("users")', 'delete("users")'],
      attributes,
    }),
  });
  
  const data = await response.json();
  if (data.$id) {
    console.log(`✅ Collection "${name}" créée: ${data.$id}`);
    return data.$id;
  } else if (data.message) {
    console.log(`❌ Erreur pour "${name}": ${data.message}`);
    return null;
  }
  return null;
}

// Créer la base de données
async function createDatabase() {
  const response = await fetch(`${APPWRITE_ENDPOINT}/databases`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'family_hub',
      permissions: ['read("users")', 'create("users")', 'update("users")', 'delete("users")'],
    }),
  });
  
  const data = await response.json();
  if (data.$id) {
    console.log(`✅ Base de données créée: ${data.$id}`);
    return data.$id;
  } else if (data.code === 409) {
    console.log('ℹ️ Base de données "family_hub" existe déjà');
    return 'famille_hub';
  }
  console.log('❌ Erreur:', data);
  return null;
}

// Collections avec leurs attributs
const collections = [
  {
    name: 'users_profile',
    attributes: [
      { key: 'userId', type: 'string', size: 50, required: true },
      { key: 'email', type: 'string', size: 255, required: true },
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'familyId', type: 'string', size: 50, required: false },
      { key: 'avatar', type: 'string', size: 500, required: false },
      { key: 'createdAt', type: 'datetime', required: false },
    ],
  },
  {
    name: 'families',
    attributes: [
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'ownerId', type: 'string', size: 50, required: true },
      { key: 'inviteCode', type: 'string', size: 20, required: false },
      { key: 'monthlyBudget', type: 'double', required: false },
      { key: 'createdAt', type: 'datetime', required: false },
    ],
  },
  {
    name: 'family_members',
    attributes: [
      { key: 'familyId', type: 'string', size: 50, required: true },
      { key: 'userId', type: 'string', size: 50, required: true },
      { key: 'role', type: 'string', size: 20, required: true },
      { key: 'name', type: 'string', size: 255, required: true },
      { key: 'avatar', type: 'string', size: 500, required: false },
    ],
  },
  {
    name: 'events',
    attributes: [
      { key: 'familyId', type: 'string', size: 50, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 1000, required: false },
      { key: 'date', type: 'datetime', required: true },
      { key: 'endDate', type: 'datetime', required: false },
      { key: 'color', type: 'string', size: 20, required: false },
      { key: 'category', type: 'string', size: 50, required: false },
      { key: 'assignedTo', type: 'string', size: 50, required: false },
      { key: 'reminder', type: 'boolean', required: false },
      { key: 'createdBy', type: 'string', size: 50, required: true },
    ],
  },
  {
    name: 'chores',
    attributes: [
      { key: 'familyId', type: 'string', size: 50, required: true },
      { key: 'title', type: 'string', size: 255, required: true },
      { key: 'description', type: 'string', size: 500, required: false },
      { key: 'frequency', type: 'string', size: 20, required: false },
      { key: 'points', type: 'integer', required: false },
      { key: 'assignedTo', type: 'string', size: 50, required: false },
      { key: 'dueDate', type: 'datetime', required: false },
      { key: 'status', type: 'string', size: 20, required: false },
      { key: 'createdBy', type: 'string', size: 50, required: true },
    ],
  },
  {
    name: 'budget_entries',
    attributes: [
      { key: 'familyId', type: 'string', size: 50, required: true },
      { key: 'amount', type: 'double', required: true },
      { key: 'category', type: 'string', size: 50, required: true },
      { key: 'description', type: 'string', size: 255, required: false },
      { key: 'date', type: 'datetime', required: true },
      { key: 'type', type: 'string', size: 20, required: true },
      { key: 'createdBy', type: 'string', size: 50, required: true },
    ],
  },
  {
    name: 'alcohol_logs',
    attributes: [
      { key: 'userId', type: 'string', size: 50, required: true },
      { key: 'date', type: 'datetime', required: true },
      { key: 'drinkType', type: 'string', size: 50, required: true },
      { key: 'volumeCl', type: 'double', required: true },
      { key: 'abv', type: 'double', required: true },
      { key: 'units', type: 'double', required: true },
      { key: 'context', type: 'string', size: 100, required: false },
      { key: 'notes', type: 'string', size: 500, required: false },
      { key: 'mood', type: 'string', size: 50, required: false },
    ],
  },
];

async function setup() {
  console.log('🚀 Début de la configuration Appwrite...\n');
  
  // Créer la base de données
  const dbId = await createDatabase();
  if (!dbId) {
    console.log('❌ Impossible de créer la base de données');
    return;
  }
  
  console.log('\n📦 Création des collections...\n');
  
  // Créer chaque collection avec ses attributs
  for (const coll of collections) {
    const id = await createCollection(coll.name, coll.attributes);
    if (id) {
      console.log(`   → Collection ID: ${id}`);
    }
    // Petite pause pour éviter les erreurs
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log('\n✅ Configuration terminée !');
  console.log('\n📝 Mettez à jour votre fichier .env avec:');
  console.log(`   VITE_APPWRITE_DATABASE_ID=${dbId}`);
}

setup().catch(console.error);