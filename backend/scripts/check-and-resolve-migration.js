#!/usr/bin/env node

/**
 * Script to check if database tables exist and mark migration as applied if they do
 * This handles the case where tables were created by a previous failed migration
 */

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function checkTablesExist() {
  try {
    // Try to query the Payroll table - if it exists, other tables likely do too
    await prisma.$queryRaw`SELECT 1 FROM "Payroll" LIMIT 1`;
    return true;
  } catch (error) {
    // Table doesn't exist or other error
    return false;
  }
}

async function main() {
  const migrationName = '20251209000000_init_postgresql';
  
  console.log('🔍 Checking if database tables already exist...');
  
  const tablesExist = await checkTablesExist();
  
  if (tablesExist) {
    console.log('✅ Tables already exist in database');
    console.log('   Marking migration as applied (tables already created)...');
    
    try {
      execSync(`npx prisma migrate resolve --applied ${migrationName}`, {
        stdio: 'inherit',
        cwd: join(__dirname, '..'),
      });
      console.log('✅ Migration marked as applied');
      console.log('   Database is now in sync with migrations');
      process.exit(0);
    } catch (error) {
      console.error('❌ Could not mark migration as applied:', error.message);
      process.exit(1);
    }
  } else {
    console.log('ℹ️  Tables do not exist, migration will be applied normally');
    process.exit(0);
  }
}

main()
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

