import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use different drivers based on environment
// Docker/local: regular pg driver
// Production/Replit: Neon serverless driver
const isLocal = process.env.DATABASE_URL.includes('localhost') || 
                process.env.DATABASE_URL.includes('postgres:') ||
                process.env.NODE_ENV === 'development';

let pool: any;
let db: any;

async function initializeDatabase() {
  if (isLocal) {
    // Use regular PostgreSQL driver for local/Docker development
    const { Pool } = await import('pg');
    const { drizzle } = await import('drizzle-orm/node-postgres');
    
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle(pool, { schema });
  } else {
    // Use Neon serverless driver for production
    const { Pool, neonConfig } = await import('@neondatabase/serverless');
    const { drizzle } = await import('drizzle-orm/neon-serverless');
    const ws = await import('ws');
    
    neonConfig.webSocketConstructor = ws.default;
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema });
  }
}

// Initialize immediately
const initPromise = initializeDatabase();

export async function getDB() {
  await initPromise;
  return db;
}

export async function getPool() {
  await initPromise;
  return pool;
}

// For backwards compatibility
export { db, pool };