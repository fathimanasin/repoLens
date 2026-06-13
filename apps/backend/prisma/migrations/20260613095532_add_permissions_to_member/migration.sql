-- AlterTable
ALTER TABLE "OrganizationMember" ADD COLUMN     "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[];
