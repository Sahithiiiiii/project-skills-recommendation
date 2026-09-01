-- CreateTable
CREATE TABLE "CareerInterest" (
    "careerId" TEXT NOT NULL,
    "interestId" TEXT NOT NULL,
    "importance" INTEGER NOT NULL DEFAULT 3,

    CONSTRAINT "CareerInterest_pkey" PRIMARY KEY ("careerId","interestId")
);

-- AddForeignKey
ALTER TABLE "CareerInterest" ADD CONSTRAINT "CareerInterest_careerId_fkey" FOREIGN KEY ("careerId") REFERENCES "Career"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerInterest" ADD CONSTRAINT "CareerInterest_interestId_fkey" FOREIGN KEY ("interestId") REFERENCES "Interest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
