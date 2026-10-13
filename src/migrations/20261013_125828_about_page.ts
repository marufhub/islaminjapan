import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "editorial_policy_locales" ADD COLUMN "about" jsonb;
  ALTER TABLE "_editorial_policy_v_locales" ADD COLUMN "version_about" jsonb;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "editorial_policy_locales" DROP COLUMN "about";
  ALTER TABLE "_editorial_policy_v_locales" DROP COLUMN "version_about";`)
}
