import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "ai_usage" ALTER COLUMN "status" SET DATA TYPE text;
  DROP TYPE "public"."enum_ai_usage_status";
  CREATE TYPE "public"."enum_ai_usage_status" AS ENUM('pending', 'success', 'error');
  ALTER TABLE "ai_usage" ALTER COLUMN "status" SET DATA TYPE "public"."enum_ai_usage_status" USING "status"::"public"."enum_ai_usage_status";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "ai_usage" ALTER COLUMN "status" SET DATA TYPE text;
  DROP TYPE "public"."enum_ai_usage_status";
  CREATE TYPE "public"."enum_ai_usage_status" AS ENUM('success', 'error', 'rejected');
  ALTER TABLE "ai_usage" ALTER COLUMN "status" SET DATA TYPE "public"."enum_ai_usage_status" USING "status"::"public"."enum_ai_usage_status";`)
}
