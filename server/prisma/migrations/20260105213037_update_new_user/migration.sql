-- AlterTable
ALTER TABLE "Incident" ADD COLUMN     "reportedUserId" INTEGER;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
