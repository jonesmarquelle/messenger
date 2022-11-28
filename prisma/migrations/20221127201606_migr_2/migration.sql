/*
  Warnings:

  - A unique constraint covering the columns `[id,username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderName` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_userId_fkey";

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "iconUrl" VARCHAR(2048),
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "senderName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_id_username_key" ON "User"("id", "username");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_senderName_fkey" FOREIGN KEY ("userId", "senderName") REFERENCES "User"("id", "username") ON DELETE RESTRICT ON UPDATE CASCADE;
