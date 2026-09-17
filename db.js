// On Vercel, each API request can run on a fresh, temporary instance —
// nothing saved to local disk is guaranteed to still be there next time.
// So instead of a JSON file, this version keeps the exact same data
// shape in a small hosted Redis store (Upstash — free tier, works with
// or without a Vercel account). Set UPSTASH_REDIS_REST_URL and
// UPSTASH_REDIS_REST_TOKEN as environment variables; see the README.
const { Redis } = require('@upstash/redis');
const bcrypt = require('bcryptjs');

const redis = Redis.fromEnv();

const KEY = 'tumaini:data';

const DEFAULT_CATALOG = [
  { id: 'oil', name: 'Cooking oil (2L)', unit: 'bottle', category: 'Groceries' },
  { id: 'unga', name: 'Maize flour (Unga) 2kg', unit: 'bag', category: 'Groceries' },
  { id: 'sugar', name: 'Sugar 1kg', unit: 'packet', category: 'Groceries' },
  { id: 'rice', name: 'Rice (Pishori) 2kg', unit: 'bag', category: 'Groceries' },
  { id: 'tea', name: 'Tea leaves 250g', unit: 'packet', category: 'Groceries' },
  { id: 'salt', name: 'Salt 1kg', unit: 'packet', category: 'Groceries' },
  { id: 'barsoap', name: 'Bar soap', unit: 'piece', category: 'Household' },
  { id: 'bathsoap', name: 'Bathing soap', unit: 'piece', category: 'Household' },
  { id: 'matches', name: 'Matchboxes', unit: 'box', category: 'Household' },
  { id: 'soda', name: 'Soda crate (assorted)', unit: 'crate', category: 'Beverages' },
  { id: 'milk', name: 'Milk 500ml', unit: 'packet', category: 'Beverages' },
  { id: 'bread', name: 'Bread', unit: 'loaf', category: 'Bakery' },
];

const DEFAULT_STOCK = {
  oil: 40, unga: 25, sugar: 60, rice: 18, tea: 30, salt: 22,
  barsoap: 50, bathsoap: 15, matches: 70, soda: 12, milk: 35, bread: 8,
};

function seedTeam() {
  return [
    { id: 1, name: 'Grace Wanjiru', role: 'owner', passwordHash: bcrypt.hashSync('tumaini2024', 10) },
    { id: 2, name: 'Peter Otieno', role: 'worker', passwordHash: bcrypt.hashSync('worker123', 10) },
    { id: 3, name: 'Mary Achieng', role: 'worker', passwordHash: bcrypt.hashSync('worker456', 10) },
  ];
}

function defaultData() {
  return {
    catalog: DEFAULT_CATALOG,
    stock: { ...DEFAULT_STOCK },
    team: seedTeam(),
    nextTeamId: 4,
    orders: [],
    nextOrderId: 1,
    pendingStockChanges: [],
    nextPendingId: 1,
    lastNotification: null, // {id, orderId, kioskName} — polled by the frontend instead of pushed
  };
}

// Every request loads the current data...
async function load() {
  const existing = await redis.get(KEY);
  if (existing) return existing;
  const fresh = defaultData();
  await redis.set(KEY, fresh);
  return fresh;
}

// ...and saves it back after making any change. There's no long-lived
// memory to keep it in between requests, so load-mutate-save every time.
async function save(data) {
  await redis.set(KEY, data);
}

module.exports = { load, save };
