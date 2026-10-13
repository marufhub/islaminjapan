import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_contact_submissions_locale" AS ENUM('ja', 'en');
  CREATE TYPE "public"."enum_contact_submissions_status" AS ENUM('new', 'in_progress', 'answered', 'spam');
  CREATE TYPE "public"."enum_contact_submissions_delivery_status" AS ENUM('sent', 'failed', 'not_configured');
  CREATE TABLE "contact_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"subject" varchar NOT NULL,
  	"message" varchar NOT NULL,
  	"locale" "enum_contact_submissions_locale",
  	"status" "enum_contact_submissions_status" DEFAULT 'new',
  	"delivery_status" "enum_contact_submissions_delivery_status" DEFAULT 'not_configured',
  	"requester_hash" varchar,
  	"internal_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "articles" ADD COLUMN "search_text" varchar;
  ALTER TABLE "_articles_v" ADD COLUMN "version_search_text" varchar;
  ALTER TABLE "faqs_locales" ADD COLUMN "search_text" varchar;
  ALTER TABLE "_faqs_v_locales" ADD COLUMN "version_search_text" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "contact_submissions_id" integer;
  CREATE INDEX "contact_submissions_requester_hash_idx" ON "contact_submissions" USING btree ("requester_hash");
  CREATE INDEX "contact_submissions_updated_at_idx" ON "contact_submissions" USING btree ("updated_at");
  CREATE INDEX "contact_submissions_created_at_idx" ON "contact_submissions" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_submissions_fk" FOREIGN KEY ("contact_submissions_id") REFERENCES "public"."contact_submissions"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_contact_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("contact_submissions_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "contact_submissions" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "contact_submissions" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_contact_submissions_fk";
  
  DROP INDEX "payload_locked_documents_rels_contact_submissions_id_idx";
  ALTER TABLE "articles" DROP COLUMN "search_text";
  ALTER TABLE "_articles_v" DROP COLUMN "version_search_text";
  ALTER TABLE "faqs_locales" DROP COLUMN "search_text";
  ALTER TABLE "_faqs_v_locales" DROP COLUMN "version_search_text";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "contact_submissions_id";
  DROP TYPE "public"."enum_contact_submissions_locale";
  DROP TYPE "public"."enum_contact_submissions_status";
  DROP TYPE "public"."enum_contact_submissions_delivery_status";`)
}
