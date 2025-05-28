-- AlterTable
ALTER TABLE "Response" ADD COLUMN     "userEmail" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "userName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "userPassword" TEXT;
