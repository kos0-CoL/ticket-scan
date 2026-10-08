import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { landingSections, categorias } from './src/schema';
import { eq } from 'drizzle-orm';
import * as seedData from './src/schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle({ client: pool, schema: { landingSections, categorias } });

async function seed() {
  console.log('🌱 Iniciando seed...');

  // Seed categorías
  console.log('📦 Insertando categorías...');
  for (const cat of seedData.seedCategories) {
    try {
      await db.insert(categorias).values(cat).onConflictDoNothing();
      console.log(`  ✓ ${cat.nombre}`);
    } catch (e) {
      console.log(`  ⚠ ${cat.nombre}: ${e}`);
    }
  }

  // Seed landing sections
  console.log('📦 Insertando landing sections...');
  for (const section of seedData.seedLandingSections) {
    try {
      await db.insert(landingSections).values(section).onConflictDoNothing();
      console.log(`  ✓ ${section.key}`);
    } catch (e) {
      console.log(`  ⚠ ${section.key}: ${e}`);
    }
  }

  console.log('✅ Seed completado');
  await pool.end();
}

seed().catch((e) => {
  console.error('❌ Error en seed:', e);
  process.exit(1);
});