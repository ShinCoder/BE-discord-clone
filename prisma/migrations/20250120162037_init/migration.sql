-- CreateEnum
CREATE TYPE "ACCOUNT_STATUS" AS ENUM ('NOT_VERIFIED', 'ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "RELATIONSHIP_STATUS" AS ENUM ('PENDING', 'FRIEND', 'BLOCKED');

-- CreateEnum
CREATE TYPE "CONNECTION_STATUS" AS ENUM ('ONLINE', 'OFFLINE');

-- CreateEnum
CREATE TYPE "MESSAGES_TYPES" AS ENUM ('TEXT', 'IMAGE');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "phone_number" TEXT,
    "status" "ACCOUNT_STATUS" NOT NULL DEFAULT 'NOT_VERIFIED',
    "display_name" TEXT,
    "pronouns" TEXT,
    "avatar" TEXT,
    "banner_color" TEXT NOT NULL,
    "about" TEXT,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "account_id" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "connection_status" "CONNECTION_STATUS" NOT NULL DEFAULT 'OFFLINE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relationships" (
    "account_id" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "status" "RELATIONSHIP_STATUS" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "relationships_pkey" PRIMARY KEY ("account_id","target_id")
);

-- CreateTable
CREATE TABLE "direct_messages" (
    "id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "MESSAGES_TYPES" NOT NULL DEFAULT 'TEXT',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "direct_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_email_key" ON "accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_username_key" ON "accounts"("username");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_phone_number_key" ON "accounts"("phone_number");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
