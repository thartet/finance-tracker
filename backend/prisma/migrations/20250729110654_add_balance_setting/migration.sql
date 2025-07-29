-- CreateTable
CREATE TABLE "BalanceSetting" (
    "id" SERIAL NOT NULL,
    "initial" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BalanceSetting_pkey" PRIMARY KEY ("id")
);
