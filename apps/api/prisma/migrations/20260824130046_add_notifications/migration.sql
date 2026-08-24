-- CreateEnum
CREATE TYPE "NOTIFICATION_TYPE" AS ENUM ('TEST_PUBLISHED', 'ATTEMPT_RESULT', 'RATING_CHANGED', 'CERTIFICATE_ISSUED');

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NOTIFICATION_TYPE" NOT NULL,
    "text" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" TEXT NOT NULL,
    "type" "NOTIFICATION_TYPE" NOT NULL,
    "text" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_user_id_read_idx" ON "notifications"("user_id", "read");

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_type_key" ON "notification_templates"("type");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
