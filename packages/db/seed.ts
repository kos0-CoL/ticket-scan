import { db } from './src/index';
import {
  categorias,
  landingSections,
  appConfig,
  seedCategories,
  seedLandingSections,
} from './src/schema';
import { eq } from 'drizzle-orm';

async function seedCategoriesTable() {
  console.log('🌱 Seeding categorias...');
  for (const cat of seedCategories) {
    await db
      .insert(categorias)
      .values(cat)
      .onConflictDoUpdate({
        target: categorias.slug,
        set: { nombre: cat.nombre, icono: cat.icono, updated_at: new Date() },
      });
  }
  console.log(`   ✓ ${seedCategories.length} categorías`);
}

async function seedLandingSectionsTable() {
  console.log('🌱 Seeding landing_sections...');
  for (const section of seedLandingSections) {
    await db
      .insert(landingSections)
      .values(section)
      .onConflictDoUpdate({
        target: landingSections.key,
        set: {
          title: section.title,
          content: section.content,
          enabled: section.enabled,
          sort_order: section.sort_order,
          updated_at: new Date(),
        },
      });
  }
  console.log(`   ✓ ${seedLandingSections.length} secciones de landing`);
}

async function seedAppConfig() {
  console.log('🌱 Seeding app_config...');

  const configs = [
    {
      key: 'ai_provider_active',
      value: { provider_id: null },
    },
    {
      key: 'app_version',
      value: { version: '1.0.0-beta', build: Date.now() },
    },
    {
      key: 'maintenance_mode',
      value: { enabled: false, message: '' },
    },
  ];

  for (const config of configs) {
    await db
      .insert(appConfig)
      .values(config)
      .onConflictDoUpdate({
        target: appConfig.key,
        set: { value: config.value, updated_at: new Date() },
      });
  }
  console.log(`   ✓ ${configs.length} configuraciones de app`);
}

async function main() {
  console.log('🚀 Iniciando seed de base de datos...\n');

  try {
    await seedCategoriesTable();
    await seedLandingSectionsTable();
    await seedAppConfig();

    console.log('\n✅ Seed completado exitosamente');
  } catch (error) {
    console.error('\n❌ Error en seed:', error);
    process.exit(1);
  }
}

main();