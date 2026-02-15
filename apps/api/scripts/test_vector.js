import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = "postgresql://postgres:Nothing1234@localhost:5432/mini_tsenta";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const model = 'test-model';
  const textHash = 'test-hash';
  const embedding = [0.1, 0.2, 0.3];

  console.log('Inserting embedding...');
  await prisma.jobTextEmbedding.upsert({
    where: { model_textHash: { model, textHash } },
    create: {
      model,
      textHash,
      normalizedText: 'test',
      embedding: embedding, // Try passing array directly
    },
    update: {
      embedding: embedding, // Try passing array directly
    },
  });

  console.log('Querying embedding...');
  const result = await prisma.jobTextEmbedding.findUnique({
    where: { model_textHash: { model, textHash } },
  });
  console.log('Result type:', typeof result?.embedding);
  console.log('Result value:', result?.embedding);

  // Parse result
  let retrived = [];
  if (typeof result?.embedding === 'string') {
      retrived = JSON.parse(result.embedding);
  } else if (Array.isArray(result?.embedding)) {
      retrived = result.embedding;
  }
  console.log('Parsed:', retrived);

  // Test similarity search (raw SQL)
  console.log('Testing similarity search...');
  const vectorStr = JSON.stringify(embedding);
  const similar = await prisma.$queryRawUnsafe(`
    SELECT "textHash", 1 - ("embedding" <=> '${vectorStr}'::vector) as similarity
    FROM "JobTextEmbedding"
    ORDER BY similarity DESC
    LIMIT 1;
  `);
  console.log('Similarity result:', similar);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
