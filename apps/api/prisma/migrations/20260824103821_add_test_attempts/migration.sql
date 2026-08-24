-- CreateTable
CREATE TABLE "test_attempts" (
    "id" TEXT NOT NULL,
    "test_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "passing_score" INTEGER NOT NULL,
    "question_count" INTEGER NOT NULL,
    "answers" JSONB,
    "score" INTEGER,
    "correct_count" INTEGER,
    "passed" BOOLEAN,
    "time_spent_seconds" INTEGER,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMP(3),

    CONSTRAINT "test_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "test_attempts_test_id_teacher_id_idx" ON "test_attempts"("test_id", "teacher_id");

-- CreateIndex
CREATE INDEX "test_attempts_teacher_id_idx" ON "test_attempts"("teacher_id");

-- AddForeignKey
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_attempts" ADD CONSTRAINT "test_attempts_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
