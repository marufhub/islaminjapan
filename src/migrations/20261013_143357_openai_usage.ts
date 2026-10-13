import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_ai_usage_model_tier" AS ENUM('main', 'fast');
  ALTER TABLE "ai_usage" ADD COLUMN "model_tier" "enum_ai_usage_model_tier";
  ALTER TABLE "ai_usage" ADD COLUMN "prompt_version" varchar;
  ALTER TABLE "ai_usage" ADD COLUMN "request_id" varchar;
  ALTER TABLE "ai_usage" ADD COLUMN "estimated_cost_usd" numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "ai_usage" DROP COLUMN "model_tier";
  ALTER TABLE "ai_usage" DROP COLUMN "prompt_version";
  ALTER TABLE "ai_usage" DROP COLUMN "request_id";
  ALTER TABLE "ai_usage" DROP COLUMN "estimated_cost_usd";
  DROP TYPE "public"."enum_ai_usage_model_tier";`)
}
