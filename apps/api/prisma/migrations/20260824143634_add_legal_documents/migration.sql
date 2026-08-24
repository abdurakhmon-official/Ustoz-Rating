-- CreateEnum
CREATE TYPE "LEGAL_DOCUMENT_TYPE" AS ENUM ('TERMS', 'PRIVACY');

-- CreateTable
CREATE TABLE "legal_documents" (
    "id" TEXT NOT NULL,
    "type" "LEGAL_DOCUMENT_TYPE" NOT NULL,
    "text" TEXT NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "legal_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "legal_documents_type_effective_from_idx" ON "legal_documents"("type", "effective_from");
