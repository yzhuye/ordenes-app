/*
  Warnings:

  - Added the required column `fee` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "discountId" INTEGER,
ADD COLUMN     "fee" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "subtotal" DECIMAL(10,2) NOT NULL;

-- CreateTable
CREATE TABLE "public"."discounts" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL,
    "validUntil" DATE,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "discounts_code_key" ON "public"."discounts"("code");

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "public"."discounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
