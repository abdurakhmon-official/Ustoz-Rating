-- CreateTable
CREATE TABLE "rating_settings" (
    "id" TEXT NOT NULL,
    "avg_score_weight" DOUBLE PRECISION NOT NULL DEFAULT 0.4,
    "best_score_weight" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "consistency_weight" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "attempt_count_weight" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "min_attempts_required" INTEGER NOT NULL DEFAULT 1,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rating_settings_pkey" PRIMARY KEY ("id")
);
