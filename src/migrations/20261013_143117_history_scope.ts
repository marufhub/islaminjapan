import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_articles_article_type" ADD VALUE 'profile' BEFORE 'faq';
  ALTER TYPE "public"."enum__articles_v_version_article_type" ADD VALUE 'profile' BEFORE 'faq';
  ALTER TABLE "history_events" ADD COLUMN "reviewer_id" integer;
  ALTER TABLE "history_events" ADD COLUMN "last_reviewed_at" timestamp(3) with time zone;
  ALTER TABLE "_history_events_v" ADD COLUMN "version_reviewer_id" integer;
  ALTER TABLE "_history_events_v" ADD COLUMN "version_last_reviewed_at" timestamp(3) with time zone;
  ALTER TABLE "media" ADD COLUMN "original_date" varchar;
  ALTER TABLE "history_events" ADD CONSTRAINT "history_events_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_history_events_v" ADD CONSTRAINT "_history_events_v_version_reviewer_id_users_id_fk" FOREIGN KEY ("version_reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "history_events_reviewer_idx" ON "history_events" USING btree ("reviewer_id");
  CREATE INDEX "_history_events_v_version_version_reviewer_idx" ON "_history_events_v" USING btree ("version_reviewer_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "history_events" DROP CONSTRAINT "history_events_reviewer_id_users_id_fk";
  
  ALTER TABLE "_history_events_v" DROP CONSTRAINT "_history_events_v_version_reviewer_id_users_id_fk";
  
  -- 'profile' does not exist in the previous enum; map it back so the down migration cannot fail.
  UPDATE "articles" SET "article_type" = 'explainer' WHERE "article_type" = 'profile';
  UPDATE "_articles_v" SET "version_article_type" = 'explainer' WHERE "version_article_type" = 'profile';
  ALTER TABLE "articles" ALTER COLUMN "article_type" SET DATA TYPE text;
  ALTER TABLE "articles" ALTER COLUMN "article_type" SET DEFAULT 'explainer'::text;
  DROP TYPE "public"."enum_articles_article_type";
  CREATE TYPE "public"."enum_articles_article_type" AS ENUM('explainer', 'history_research', 'faq', 'muslim_life');
  ALTER TABLE "articles" ALTER COLUMN "article_type" SET DEFAULT 'explainer'::"public"."enum_articles_article_type";
  ALTER TABLE "articles" ALTER COLUMN "article_type" SET DATA TYPE "public"."enum_articles_article_type" USING "article_type"::"public"."enum_articles_article_type";
  ALTER TABLE "_articles_v" ALTER COLUMN "version_article_type" SET DATA TYPE text;
  ALTER TABLE "_articles_v" ALTER COLUMN "version_article_type" SET DEFAULT 'explainer'::text;
  DROP TYPE "public"."enum__articles_v_version_article_type";
  CREATE TYPE "public"."enum__articles_v_version_article_type" AS ENUM('explainer', 'history_research', 'faq', 'muslim_life');
  ALTER TABLE "_articles_v" ALTER COLUMN "version_article_type" SET DEFAULT 'explainer'::"public"."enum__articles_v_version_article_type";
  ALTER TABLE "_articles_v" ALTER COLUMN "version_article_type" SET DATA TYPE "public"."enum__articles_v_version_article_type" USING "version_article_type"::"public"."enum__articles_v_version_article_type";
  DROP INDEX "history_events_reviewer_idx";
  DROP INDEX "_history_events_v_version_version_reviewer_idx";
  ALTER TABLE "history_events" DROP COLUMN "reviewer_id";
  ALTER TABLE "history_events" DROP COLUMN "last_reviewed_at";
  ALTER TABLE "_history_events_v" DROP COLUMN "version_reviewer_id";
  ALTER TABLE "_history_events_v" DROP COLUMN "version_last_reviewed_at";
  ALTER TABLE "media" DROP COLUMN "original_date";`)
}
