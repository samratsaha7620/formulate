-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "isCorrect" BOOLEAN;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "correctOptionId" TEXT,
ADD COLUMN     "isExamQuestion" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Response" ADD COLUMN     "score" INTEGER,
ADD COLUMN     "totalQuestions" INTEGER;
