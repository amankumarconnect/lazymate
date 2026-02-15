import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe('TRUNCATE TABLE "JobTextEmbedding" CASCADE;');
    console.log('Truncated JobTextEmbedding table');
  } catch (error) {
    if (error.code === 'P2010' && error.meta?.code === '42P01') {
       console.log('Table JobTextEmbedding does not exist, skipping truncation.');
    } else {
       console.warn('Error extracting table, it might not exist or other error:', error);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
