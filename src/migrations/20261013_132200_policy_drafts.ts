import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_editorial_policy_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__editorial_policy_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__editorial_policy_v_published_locale" AS ENUM('ja', 'en');
  ALTER TABLE "editorial_policy" ADD COLUMN "_status" "enum_editorial_policy_status" DEFAULT 'draft';
  ALTER TABLE "_editorial_policy_v" ADD COLUMN "version__status" "enum__editorial_policy_v_version_status" DEFAULT 'draft';
  ALTER TABLE "_editorial_policy_v" ADD COLUMN "snapshot" boolean;
  ALTER TABLE "_editorial_policy_v" ADD COLUMN "published_locale" "enum__editorial_policy_v_published_locale";
  ALTER TABLE "_editorial_policy_v" ADD COLUMN "latest" boolean;
  CREATE INDEX "editorial_policy__status_idx" ON "editorial_policy" USING btree ("_status");
  CREATE INDEX "_editorial_policy_v_version_version__status_idx" ON "_editorial_policy_v" USING btree ("version__status");
  CREATE INDEX "_editorial_policy_v_snapshot_idx" ON "_editorial_policy_v" USING btree ("snapshot");
  CREATE INDEX "_editorial_policy_v_published_locale_idx" ON "_editorial_policy_v" USING btree ("published_locale");
  CREATE INDEX "_editorial_policy_v_latest_idx" ON "_editorial_policy_v" USING btree ("latest");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "editorial_policy__status_idx";
  DROP INDEX "_editorial_policy_v_version_version__status_idx";
  DROP INDEX "_editorial_policy_v_snapshot_idx";
  DROP INDEX "_editorial_policy_v_published_locale_idx";
  DROP INDEX "_editorial_policy_v_latest_idx";
  ALTER TABLE "editorial_policy" DROP COLUMN "_status";
  ALTER TABLE "_editorial_policy_v" DROP COLUMN "version__status";
  ALTER TABLE "_editorial_policy_v" DROP COLUMN "snapshot";
  ALTER TABLE "_editorial_policy_v" DROP COLUMN "published_locale";
  ALTER TABLE "_editorial_policy_v" DROP COLUMN "latest";
  DROP TYPE "public"."enum_editorial_policy_status";
  DROP TYPE "public"."enum__editorial_policy_v_version_status";
  DROP TYPE "public"."enum__editorial_policy_v_published_locale";`)
}
