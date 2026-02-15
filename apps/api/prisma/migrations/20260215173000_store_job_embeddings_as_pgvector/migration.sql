CREATE EXTENSION IF NOT EXISTS vector;

ALTER TABLE "JobTextEmbedding"
ADD COLUMN "embedding_vector" vector;

UPDATE "JobTextEmbedding"
SET "embedding_vector" = ("embedding"::text)::vector
WHERE jsonb_typeof("embedding") = 'array';

ALTER TABLE "JobTextEmbedding"
DROP COLUMN "embedding";

ALTER TABLE "JobTextEmbedding"
RENAME COLUMN "embedding_vector" TO "embedding";
