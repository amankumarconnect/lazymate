-- CreateTable
CREATE TABLE "JobTextEmbedding" (
    "id" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "textHash" TEXT NOT NULL,
    "normalizedText" TEXT NOT NULL,
    "embedding" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobTextEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobTextEmbedding_model_textHash_key" ON "JobTextEmbedding"("model", "textHash");
