import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('ja', 'en');
  CREATE TYPE "public"."enum_articles_audiences" AS ENUM('general_public', 'non_muslims', 'new_muslims', 'muslim_residents');
  CREATE TYPE "public"."enum_articles_section" AS ENUM('learn', 'islam-in-japan', 'muslim-life', 'resources');
  CREATE TYPE "public"."enum_articles_article_type" AS ENUM('explainer', 'history_research', 'faq', 'muslim_life');
  CREATE TYPE "public"."enum_articles_knowledge_level" AS ENUM('beginner', 'intermediate', 'advanced');
  CREATE TYPE "public"."enum_articles_japan_relevance" AS ENUM('general', 'related', 'central');
  CREATE TYPE "public"."enum_articles_language" AS ENUM('ja', 'en');
  CREATE TYPE "public"."enum_articles_editorial_status" AS ENUM('idea', 'researching', 'draft', 'in_review', 'approved');
  CREATE TYPE "public"."enum_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articles_v_version_audiences" AS ENUM('general_public', 'non_muslims', 'new_muslims', 'muslim_residents');
  CREATE TYPE "public"."enum__articles_v_version_section" AS ENUM('learn', 'islam-in-japan', 'muslim-life', 'resources');
  CREATE TYPE "public"."enum__articles_v_version_article_type" AS ENUM('explainer', 'history_research', 'faq', 'muslim_life');
  CREATE TYPE "public"."enum__articles_v_version_knowledge_level" AS ENUM('beginner', 'intermediate', 'advanced');
  CREATE TYPE "public"."enum__articles_v_version_japan_relevance" AS ENUM('general', 'related', 'central');
  CREATE TYPE "public"."enum__articles_v_version_language" AS ENUM('ja', 'en');
  CREATE TYPE "public"."enum__articles_v_version_editorial_status" AS ENUM('idea', 'researching', 'draft', 'in_review', 'approved');
  CREATE TYPE "public"."enum__articles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articles_v_published_locale" AS ENUM('ja', 'en');
  CREATE TYPE "public"."enum_history_events_subjects" AS ENUM('people', 'organizations', 'mosques', 'communities', 'diplomacy', 'education');
  CREATE TYPE "public"."enum_history_events_published_locales" AS ENUM('ja', 'en');
  CREATE TYPE "public"."enum_history_events_date_precision" AS ENUM('day', 'month', 'year', 'circa', 'decade', 'range', 'unknown');
  CREATE TYPE "public"."enum_history_events_period" AS ENUM('pre_meiji', 'meiji', 'taisho', 'prewar_showa', 'postwar_showa', 'heisei', 'reiwa');
  CREATE TYPE "public"."enum_history_events_verification_status" AS ENUM('unverified', 'in_research', 'verified', 'disputed');
  CREATE TYPE "public"."enum_history_events_editorial_status" AS ENUM('idea', 'researching', 'draft', 'in_review', 'approved');
  CREATE TYPE "public"."enum_history_events_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__history_events_v_version_subjects" AS ENUM('people', 'organizations', 'mosques', 'communities', 'diplomacy', 'education');
  CREATE TYPE "public"."enum__history_events_v_version_published_locales" AS ENUM('ja', 'en');
  CREATE TYPE "public"."enum__history_events_v_version_date_precision" AS ENUM('day', 'month', 'year', 'circa', 'decade', 'range', 'unknown');
  CREATE TYPE "public"."enum__history_events_v_version_period" AS ENUM('pre_meiji', 'meiji', 'taisho', 'prewar_showa', 'postwar_showa', 'heisei', 'reiwa');
  CREATE TYPE "public"."enum__history_events_v_version_verification_status" AS ENUM('unverified', 'in_research', 'verified', 'disputed');
  CREATE TYPE "public"."enum__history_events_v_version_editorial_status" AS ENUM('idea', 'researching', 'draft', 'in_review', 'approved');
  CREATE TYPE "public"."enum__history_events_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__history_events_v_published_locale" AS ENUM('ja', 'en');
  CREATE TYPE "public"."enum_faqs_audiences" AS ENUM('general_public', 'non_muslims', 'new_muslims', 'muslim_residents');
  CREATE TYPE "public"."enum_faqs_published_locales" AS ENUM('ja', 'en');
  CREATE TYPE "public"."enum_faqs_editorial_status" AS ENUM('idea', 'researching', 'draft', 'in_review', 'approved');
  CREATE TYPE "public"."enum_faqs_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__faqs_v_version_audiences" AS ENUM('general_public', 'non_muslims', 'new_muslims', 'muslim_residents');
  CREATE TYPE "public"."enum__faqs_v_version_published_locales" AS ENUM('ja', 'en');
  CREATE TYPE "public"."enum__faqs_v_version_editorial_status" AS ENUM('idea', 'researching', 'draft', 'in_review', 'approved');
  CREATE TYPE "public"."enum__faqs_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__faqs_v_published_locale" AS ENUM('ja', 'en');
  CREATE TYPE "public"."enum_sources_excerpts_origin" AS ENUM('editor_transcribed', 'publisher_provided', 'public_domain_text');
  CREATE TYPE "public"."enum_sources_source_type" AS ENUM('book', 'journal_article', 'archival', 'newspaper', 'website', 'quran', 'hadith_collection', 'interview', 'other');
  CREATE TYPE "public"."enum_sources_original_language" AS ENUM('ja', 'en', 'ar', 'tr', 'other');
  CREATE TYPE "public"."enum_sources_usage_permission" AS ENUM('public_domain', 'open_license', 'quotation', 'permission', 'restricted', 'unknown');
  CREATE TYPE "public"."enum_sources_verification_status" AS ENUM('unverified', 'partially_verified', 'verified', 'disputed');
  CREATE TYPE "public"."enum_categories_group" AS ENUM('beliefs', 'quran_hadith', 'history_japan', 'muslim_life', 'ethics_culture', 'community');
  CREATE TYPE "public"."enum_media_license" AS ENUM('owned', 'permission', 'cc_by', 'cc_by_sa', 'cc0', 'public_domain', 'licensed', 'unknown');
  CREATE TYPE "public"."enum_editorial_topics_language" AS ENUM('ja', 'en');
  CREATE TYPE "public"."enum_editorial_topics_audience" AS ENUM('general_public', 'non_muslims', 'new_muslims', 'muslim_residents');
  CREATE TYPE "public"."enum_editorial_topics_priority" AS ENUM('high', 'medium', 'low');
  CREATE TYPE "public"."enum_editorial_topics_status" AS ENUM('idea', 'researching', 'drafting', 'in_review', 'published', 'dropped');
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor', 'author');
  CREATE TYPE "public"."enum_homepage_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__homepage_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__homepage_v_published_locale" AS ENUM('ja', 'en');
  CREATE TABLE "articles_audiences" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_articles_audiences",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "article_claims" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"claim" varchar,
  	"reason" varchar,
  	"suggested_evidence" varchar,
  	"resolved" boolean DEFAULT false,
  	"resolution_note" varchar
  );
  
  CREATE TABLE "articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"summary" varchar,
  	"cover_image_id" integer,
  	"body" jsonb,
  	"section" "enum_articles_section" DEFAULT 'resources',
  	"article_type" "enum_articles_article_type" DEFAULT 'explainer',
  	"category_id" integer,
  	"knowledge_level" "enum_articles_knowledge_level" DEFAULT 'beginner',
  	"japan_relevance" "enum_articles_japan_relevance" DEFAULT 'related',
  	"learning_journey_order" numeric,
  	"verification_evidence_warnings" varchar,
  	"verification_editorial_notes" varchar,
  	"ai_provenance_ai_assisted" boolean DEFAULT false,
  	"ai_provenance_model" varchar,
  	"ai_provenance_prompt_template" varchar,
  	"ai_provenance_generated_at" timestamp(3) with time zone,
  	"ai_provenance_generated_by_id" integer,
  	"ai_provenance_used_source_ids" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"featured" boolean DEFAULT false,
  	"language" "enum_articles_language" DEFAULT 'ja',
  	"translation_group" varchar,
  	"slug" varchar,
  	"editorial_status" "enum_articles_editorial_status" DEFAULT 'draft',
  	"author_id" integer,
  	"reviewer_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"last_reviewed_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_articles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "articles_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "articles_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"articles_id" integer,
  	"sources_id" integer
  );
  
  CREATE TABLE "_articles_v_version_audiences" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__articles_v_version_audiences",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_article_claims_v" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"claim" varchar,
  	"reason" varchar,
  	"suggested_evidence" varchar,
  	"resolved" boolean DEFAULT false,
  	"resolution_note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_articles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_summary" varchar,
  	"version_cover_image_id" integer,
  	"version_body" jsonb,
  	"version_section" "enum__articles_v_version_section" DEFAULT 'resources',
  	"version_article_type" "enum__articles_v_version_article_type" DEFAULT 'explainer',
  	"version_category_id" integer,
  	"version_knowledge_level" "enum__articles_v_version_knowledge_level" DEFAULT 'beginner',
  	"version_japan_relevance" "enum__articles_v_version_japan_relevance" DEFAULT 'related',
  	"version_learning_journey_order" numeric,
  	"version_verification_evidence_warnings" varchar,
  	"version_verification_editorial_notes" varchar,
  	"version_ai_provenance_ai_assisted" boolean DEFAULT false,
  	"version_ai_provenance_model" varchar,
  	"version_ai_provenance_prompt_template" varchar,
  	"version_ai_provenance_generated_at" timestamp(3) with time zone,
  	"version_ai_provenance_generated_by_id" integer,
  	"version_ai_provenance_used_source_ids" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_language" "enum__articles_v_version_language" DEFAULT 'ja',
  	"version_translation_group" varchar,
  	"version_slug" varchar,
  	"version_editorial_status" "enum__articles_v_version_editorial_status" DEFAULT 'draft',
  	"version_author_id" integer,
  	"version_reviewer_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_last_reviewed_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__articles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__articles_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_articles_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_articles_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"articles_id" integer,
  	"sources_id" integer
  );
  
  CREATE TABLE "history_events_conflicting_accounts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "history_events_conflicting_accounts_locales" (
  	"account" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "history_events_subjects" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_history_events_subjects",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "history_events_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "history_events_images_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "history_events_published_locales" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_history_events_published_locales",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "history_events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"date_precision" "enum_history_events_date_precision" DEFAULT 'year',
  	"date_start_year" numeric,
  	"date_start_month" numeric,
  	"date_start_day" numeric,
  	"date_end_year" numeric,
  	"date_end_month" numeric,
  	"date_end_day" numeric,
  	"period" "enum_history_events_period",
  	"sort_key" numeric,
  	"verification_status" "enum_history_events_verification_status" DEFAULT 'unverified',
  	"verification_notes" varchar,
  	"editorial_status" "enum_history_events_editorial_status" DEFAULT 'draft',
  	"author_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_history_events_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "history_events_locales" (
  	"title" varchar,
  	"summary" varchar,
  	"body" jsonb,
  	"date_display_override" varchar,
  	"uncertainty_notes" varchar,
  	"location" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "history_events_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sources_id" integer,
  	"articles_id" integer
  );
  
  CREATE TABLE "_history_events_v_version_conflicting_accounts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_history_events_v_version_conflicting_accounts_locales" (
  	"account" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_history_events_v_version_subjects" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__history_events_v_version_subjects",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_history_events_v_version_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_history_events_v_version_images_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_history_events_v_version_published_locales" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__history_events_v_version_published_locales",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_history_events_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_date_precision" "enum__history_events_v_version_date_precision" DEFAULT 'year',
  	"version_date_start_year" numeric,
  	"version_date_start_month" numeric,
  	"version_date_start_day" numeric,
  	"version_date_end_year" numeric,
  	"version_date_end_month" numeric,
  	"version_date_end_day" numeric,
  	"version_period" "enum__history_events_v_version_period",
  	"version_sort_key" numeric,
  	"version_verification_status" "enum__history_events_v_version_verification_status" DEFAULT 'unverified',
  	"version_verification_notes" varchar,
  	"version_editorial_status" "enum__history_events_v_version_editorial_status" DEFAULT 'draft',
  	"version_author_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__history_events_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__history_events_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_history_events_v_locales" (
  	"version_title" varchar,
  	"version_summary" varchar,
  	"version_body" jsonb,
  	"version_date_display_override" varchar,
  	"version_uncertainty_notes" varchar,
  	"version_location" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_history_events_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sources_id" integer,
  	"articles_id" integer
  );
  
  CREATE TABLE "faqs_audiences" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_faqs_audiences",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "faqs_published_locales" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_faqs_published_locales",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "faqs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"category_id" integer,
  	"order" numeric DEFAULT 100,
  	"featured" boolean DEFAULT false,
  	"editorial_status" "enum_faqs_editorial_status" DEFAULT 'draft',
  	"author_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_faqs_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "faqs_locales" (
  	"question" varchar,
  	"short_answer" varchar,
  	"answer" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "faqs_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"articles_id" integer,
  	"sources_id" integer
  );
  
  CREATE TABLE "_faqs_v_version_audiences" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__faqs_v_version_audiences",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_faqs_v_version_published_locales" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__faqs_v_version_published_locales",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_faqs_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_category_id" integer,
  	"version_order" numeric DEFAULT 100,
  	"version_featured" boolean DEFAULT false,
  	"version_editorial_status" "enum__faqs_v_version_editorial_status" DEFAULT 'draft',
  	"version_author_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__faqs_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__faqs_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_faqs_v_locales" (
  	"version_question" varchar,
  	"version_short_answer" varchar,
  	"version_answer" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_faqs_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"articles_id" integer,
  	"sources_id" integer
  );
  
  CREATE TABLE "sources_excerpts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"locator" varchar,
  	"origin" "enum_sources_excerpts_origin" DEFAULT 'editor_transcribed' NOT NULL,
  	"rights_note" varchar
  );
  
  CREATE TABLE "sources" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"authors" varchar,
  	"institution" varchar,
  	"publication_year" numeric,
  	"publication_date" varchar,
  	"source_type" "enum_sources_source_type" NOT NULL,
  	"original_language" "enum_sources_original_language",
  	"url" varchar,
  	"doi" varchar,
  	"isbn" varchar,
  	"bibliographic_details" varchar,
  	"research_notes" varchar,
  	"usage_permission" "enum_sources_usage_permission" DEFAULT 'unknown',
  	"attribution_requirements" varchar,
  	"content_accessed" boolean DEFAULT false,
  	"accessed_at" timestamp(3) with time zone,
  	"verification_status" "enum_sources_verification_status" DEFAULT 'unverified' NOT NULL,
  	"verified_by_id" integer,
  	"last_verified_at" timestamp(3) with time zone,
  	"author_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"group" "enum_categories_group" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categories_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"credit" varchar,
  	"source_url" varchar,
  	"license" "enum_media_license" DEFAULT 'unknown' NOT NULL,
  	"rights_notes" varchar,
  	"is_a_i_generated" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "editorial_topics" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"topic" varchar NOT NULL,
  	"language" "enum_editorial_topics_language" DEFAULT 'ja' NOT NULL,
  	"audience" "enum_editorial_topics_audience",
  	"priority" "enum_editorial_topics_priority" DEFAULT 'medium',
  	"category_id" integer,
  	"planned_date" timestamp(3) with time zone,
  	"status" "enum_editorial_topics_status" DEFAULT 'idea' NOT NULL,
  	"linked_article_id" integer,
  	"notes" varchar,
  	"author_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'author' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"articles_id" integer,
  	"history_events_id" integer,
  	"faqs_id" integer,
  	"sources_id" integer,
  	"categories_id" integer,
  	"media_id" integer,
  	"editorial_topics_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"default_og_image_id" integer,
  	"public_email" varchar,
  	"allow_indexing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_locales" (
  	"site_name" varchar NOT NULL,
  	"tagline" varchar,
  	"default_description" varchar,
  	"organization_name" varchar,
  	"representative" varchar,
  	"address" varchar,
  	"legal_notes" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "navigation_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_items_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "homepage_pathways" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar
  );
  
  CREATE TABLE "homepage_pathways_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "homepage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_status" "enum_homepage_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "homepage_locales" (
  	"hero_title" varchar,
  	"hero_intro" varchar,
  	"contact_invitation" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "homepage_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"articles_id" integer,
  	"faqs_id" integer
  );
  
  CREATE TABLE "_homepage_v_version_pathways" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_version_pathways_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_homepage_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version__status" "enum__homepage_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__homepage_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_homepage_v_locales" (
  	"version_hero_title" varchar,
  	"version_hero_intro" varchar,
  	"version_contact_invitation" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_homepage_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"articles_id" integer,
  	"faqs_id" integer
  );
  
  CREATE TABLE "footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "footer_columns_links_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "footer_columns_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_locales" (
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "contact_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"recipient_email" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "contact_settings_locales" (
  	"intro" varchar,
  	"privacy_notice" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "editorial_policy" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"last_updated" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "editorial_policy_locales" (
  	"editorial_policy" jsonb,
  	"sources_policy" jsonb,
  	"privacy_policy" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_editorial_policy_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_last_updated" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_editorial_policy_v_locales" (
  	"version_editorial_policy" jsonb,
  	"version_sources_policy" jsonb,
  	"version_privacy_policy" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "articles_audiences" ADD CONSTRAINT "articles_audiences_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "article_claims" ADD CONSTRAINT "article_claims_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_ai_provenance_generated_by_id_users_id_fk" FOREIGN KEY ("ai_provenance_generated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_texts" ADD CONSTRAINT "articles_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_version_audiences" ADD CONSTRAINT "_articles_v_version_audiences_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_article_claims_v" ADD CONSTRAINT "_article_claims_v_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_parent_id_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_ai_provenance_generated_by_id_users_id_fk" FOREIGN KEY ("version_ai_provenance_generated_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_reviewer_id_users_id_fk" FOREIGN KEY ("version_reviewer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_texts" ADD CONSTRAINT "_articles_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "history_events_conflicting_accounts" ADD CONSTRAINT "history_events_conflicting_accounts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."history_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "history_events_conflicting_accounts_locales" ADD CONSTRAINT "history_events_conflicting_accounts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."history_events_conflicting_accounts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "history_events_subjects" ADD CONSTRAINT "history_events_subjects_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."history_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "history_events_images" ADD CONSTRAINT "history_events_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "history_events_images" ADD CONSTRAINT "history_events_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."history_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "history_events_images_locales" ADD CONSTRAINT "history_events_images_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."history_events_images"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "history_events_published_locales" ADD CONSTRAINT "history_events_published_locales_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."history_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "history_events" ADD CONSTRAINT "history_events_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "history_events_locales" ADD CONSTRAINT "history_events_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."history_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "history_events_rels" ADD CONSTRAINT "history_events_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."history_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "history_events_rels" ADD CONSTRAINT "history_events_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "history_events_rels" ADD CONSTRAINT "history_events_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_history_events_v_version_conflicting_accounts" ADD CONSTRAINT "_history_events_v_version_conflicting_accounts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_history_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_history_events_v_version_conflicting_accounts_locales" ADD CONSTRAINT "_history_events_v_version_conflicting_accounts_locales_pa_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_history_events_v_version_conflicting_accounts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_history_events_v_version_subjects" ADD CONSTRAINT "_history_events_v_version_subjects_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_history_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_history_events_v_version_images" ADD CONSTRAINT "_history_events_v_version_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_history_events_v_version_images" ADD CONSTRAINT "_history_events_v_version_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_history_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_history_events_v_version_images_locales" ADD CONSTRAINT "_history_events_v_version_images_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_history_events_v_version_images"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_history_events_v_version_published_locales" ADD CONSTRAINT "_history_events_v_version_published_locales_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_history_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_history_events_v" ADD CONSTRAINT "_history_events_v_parent_id_history_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."history_events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_history_events_v" ADD CONSTRAINT "_history_events_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_history_events_v_locales" ADD CONSTRAINT "_history_events_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_history_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_history_events_v_rels" ADD CONSTRAINT "_history_events_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_history_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_history_events_v_rels" ADD CONSTRAINT "_history_events_v_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_history_events_v_rels" ADD CONSTRAINT "_history_events_v_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faqs_audiences" ADD CONSTRAINT "faqs_audiences_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faqs_published_locales" ADD CONSTRAINT "faqs_published_locales_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faqs" ADD CONSTRAINT "faqs_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "faqs" ADD CONSTRAINT "faqs_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "faqs_locales" ADD CONSTRAINT "faqs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faqs_rels" ADD CONSTRAINT "faqs_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faqs_rels" ADD CONSTRAINT "faqs_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faqs_rels" ADD CONSTRAINT "faqs_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_faqs_v_version_audiences" ADD CONSTRAINT "_faqs_v_version_audiences_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_faqs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_faqs_v_version_published_locales" ADD CONSTRAINT "_faqs_v_version_published_locales_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_faqs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_faqs_v" ADD CONSTRAINT "_faqs_v_parent_id_faqs_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."faqs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_faqs_v" ADD CONSTRAINT "_faqs_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_faqs_v" ADD CONSTRAINT "_faqs_v_version_author_id_users_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_faqs_v_locales" ADD CONSTRAINT "_faqs_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_faqs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_faqs_v_rels" ADD CONSTRAINT "_faqs_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_faqs_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_faqs_v_rels" ADD CONSTRAINT "_faqs_v_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_faqs_v_rels" ADD CONSTRAINT "_faqs_v_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sources_excerpts" ADD CONSTRAINT "sources_excerpts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sources" ADD CONSTRAINT "sources_verified_by_id_users_id_fk" FOREIGN KEY ("verified_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sources" ADD CONSTRAINT "sources_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories_locales" ADD CONSTRAINT "categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "editorial_topics" ADD CONSTRAINT "editorial_topics_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "editorial_topics" ADD CONSTRAINT "editorial_topics_linked_article_id_articles_id_fk" FOREIGN KEY ("linked_article_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "editorial_topics" ADD CONSTRAINT "editorial_topics_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_history_events_fk" FOREIGN KEY ("history_events_id") REFERENCES "public"."history_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_editorial_topics_fk" FOREIGN KEY ("editorial_topics_id") REFERENCES "public"."editorial_topics"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_social_links" ADD CONSTRAINT "site_settings_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_default_og_image_id_media_id_fk" FOREIGN KEY ("default_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_items_locales" ADD CONSTRAINT "navigation_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_pathways" ADD CONSTRAINT "homepage_pathways_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_pathways_locales" ADD CONSTRAINT "homepage_pathways_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_pathways"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_locales" ADD CONSTRAINT "homepage_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_pathways" ADD CONSTRAINT "_homepage_v_version_pathways_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_pathways_locales" ADD CONSTRAINT "_homepage_v_version_pathways_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v_version_pathways"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_locales" ADD CONSTRAINT "_homepage_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns_links" ADD CONSTRAINT "footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns_links_locales" ADD CONSTRAINT "footer_columns_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns" ADD CONSTRAINT "footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns_locales" ADD CONSTRAINT "footer_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_locales" ADD CONSTRAINT "footer_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_settings_locales" ADD CONSTRAINT "contact_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "editorial_policy_locales" ADD CONSTRAINT "editorial_policy_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."editorial_policy"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_editorial_policy_v_locales" ADD CONSTRAINT "_editorial_policy_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_editorial_policy_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "articles_audiences_order_idx" ON "articles_audiences" USING btree ("order");
  CREATE INDEX "articles_audiences_parent_idx" ON "articles_audiences" USING btree ("parent_id");
  CREATE INDEX "article_claims_order_idx" ON "article_claims" USING btree ("_order");
  CREATE INDEX "article_claims_parent_id_idx" ON "article_claims" USING btree ("_parent_id");
  CREATE INDEX "articles_cover_image_idx" ON "articles" USING btree ("cover_image_id");
  CREATE INDEX "articles_category_idx" ON "articles" USING btree ("category_id");
  CREATE INDEX "articles_ai_provenance_ai_provenance_generated_by_idx" ON "articles" USING btree ("ai_provenance_generated_by_id");
  CREATE INDEX "articles_language_idx" ON "articles" USING btree ("language");
  CREATE INDEX "articles_translation_group_idx" ON "articles" USING btree ("translation_group");
  CREATE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");
  CREATE INDEX "articles_author_idx" ON "articles" USING btree ("author_id");
  CREATE INDEX "articles_reviewer_idx" ON "articles" USING btree ("reviewer_id");
  CREATE INDEX "articles_updated_at_idx" ON "articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");
  CREATE INDEX "articles__status_idx" ON "articles" USING btree ("_status");
  CREATE INDEX "articles_texts_order_parent" ON "articles_texts" USING btree ("order","parent_id");
  CREATE INDEX "articles_rels_order_idx" ON "articles_rels" USING btree ("order");
  CREATE INDEX "articles_rels_parent_idx" ON "articles_rels" USING btree ("parent_id");
  CREATE INDEX "articles_rels_path_idx" ON "articles_rels" USING btree ("path");
  CREATE INDEX "articles_rels_articles_id_idx" ON "articles_rels" USING btree ("articles_id");
  CREATE INDEX "articles_rels_sources_id_idx" ON "articles_rels" USING btree ("sources_id");
  CREATE INDEX "_articles_v_version_audiences_order_idx" ON "_articles_v_version_audiences" USING btree ("order");
  CREATE INDEX "_articles_v_version_audiences_parent_idx" ON "_articles_v_version_audiences" USING btree ("parent_id");
  CREATE INDEX "_article_claims_v_order_idx" ON "_article_claims_v" USING btree ("_order");
  CREATE INDEX "_article_claims_v_parent_id_idx" ON "_article_claims_v" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_parent_idx" ON "_articles_v" USING btree ("parent_id");
  CREATE INDEX "_articles_v_version_version_cover_image_idx" ON "_articles_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_articles_v_version_version_category_idx" ON "_articles_v" USING btree ("version_category_id");
  CREATE INDEX "_articles_v_version_ai_provenance_version_ai_provenance__idx" ON "_articles_v" USING btree ("version_ai_provenance_generated_by_id");
  CREATE INDEX "_articles_v_version_version_language_idx" ON "_articles_v" USING btree ("version_language");
  CREATE INDEX "_articles_v_version_version_translation_group_idx" ON "_articles_v" USING btree ("version_translation_group");
  CREATE INDEX "_articles_v_version_version_slug_idx" ON "_articles_v" USING btree ("version_slug");
  CREATE INDEX "_articles_v_version_version_author_idx" ON "_articles_v" USING btree ("version_author_id");
  CREATE INDEX "_articles_v_version_version_reviewer_idx" ON "_articles_v" USING btree ("version_reviewer_id");
  CREATE INDEX "_articles_v_version_version_updated_at_idx" ON "_articles_v" USING btree ("version_updated_at");
  CREATE INDEX "_articles_v_version_version_created_at_idx" ON "_articles_v" USING btree ("version_created_at");
  CREATE INDEX "_articles_v_version_version__status_idx" ON "_articles_v" USING btree ("version__status");
  CREATE INDEX "_articles_v_created_at_idx" ON "_articles_v" USING btree ("created_at");
  CREATE INDEX "_articles_v_updated_at_idx" ON "_articles_v" USING btree ("updated_at");
  CREATE INDEX "_articles_v_snapshot_idx" ON "_articles_v" USING btree ("snapshot");
  CREATE INDEX "_articles_v_published_locale_idx" ON "_articles_v" USING btree ("published_locale");
  CREATE INDEX "_articles_v_latest_idx" ON "_articles_v" USING btree ("latest");
  CREATE INDEX "_articles_v_texts_order_parent" ON "_articles_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_articles_v_rels_order_idx" ON "_articles_v_rels" USING btree ("order");
  CREATE INDEX "_articles_v_rels_parent_idx" ON "_articles_v_rels" USING btree ("parent_id");
  CREATE INDEX "_articles_v_rels_path_idx" ON "_articles_v_rels" USING btree ("path");
  CREATE INDEX "_articles_v_rels_articles_id_idx" ON "_articles_v_rels" USING btree ("articles_id");
  CREATE INDEX "_articles_v_rels_sources_id_idx" ON "_articles_v_rels" USING btree ("sources_id");
  CREATE INDEX "history_events_conflicting_accounts_order_idx" ON "history_events_conflicting_accounts" USING btree ("_order");
  CREATE INDEX "history_events_conflicting_accounts_parent_id_idx" ON "history_events_conflicting_accounts" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "history_events_conflicting_accounts_locales_locale_parent_id" ON "history_events_conflicting_accounts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "history_events_subjects_order_idx" ON "history_events_subjects" USING btree ("order");
  CREATE INDEX "history_events_subjects_parent_idx" ON "history_events_subjects" USING btree ("parent_id");
  CREATE INDEX "history_events_images_order_idx" ON "history_events_images" USING btree ("_order");
  CREATE INDEX "history_events_images_parent_id_idx" ON "history_events_images" USING btree ("_parent_id");
  CREATE INDEX "history_events_images_image_idx" ON "history_events_images" USING btree ("image_id");
  CREATE UNIQUE INDEX "history_events_images_locales_locale_parent_id_unique" ON "history_events_images_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "history_events_published_locales_order_idx" ON "history_events_published_locales" USING btree ("order");
  CREATE INDEX "history_events_published_locales_parent_idx" ON "history_events_published_locales" USING btree ("parent_id");
  CREATE INDEX "history_events_sort_key_idx" ON "history_events" USING btree ("sort_key");
  CREATE INDEX "history_events_author_idx" ON "history_events" USING btree ("author_id");
  CREATE INDEX "history_events_updated_at_idx" ON "history_events" USING btree ("updated_at");
  CREATE INDEX "history_events_created_at_idx" ON "history_events" USING btree ("created_at");
  CREATE INDEX "history_events__status_idx" ON "history_events" USING btree ("_status");
  CREATE UNIQUE INDEX "history_events_locales_locale_parent_id_unique" ON "history_events_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "history_events_rels_order_idx" ON "history_events_rels" USING btree ("order");
  CREATE INDEX "history_events_rels_parent_idx" ON "history_events_rels" USING btree ("parent_id");
  CREATE INDEX "history_events_rels_path_idx" ON "history_events_rels" USING btree ("path");
  CREATE INDEX "history_events_rels_sources_id_idx" ON "history_events_rels" USING btree ("sources_id");
  CREATE INDEX "history_events_rels_articles_id_idx" ON "history_events_rels" USING btree ("articles_id");
  CREATE INDEX "_history_events_v_version_conflicting_accounts_order_idx" ON "_history_events_v_version_conflicting_accounts" USING btree ("_order");
  CREATE INDEX "_history_events_v_version_conflicting_accounts_parent_id_idx" ON "_history_events_v_version_conflicting_accounts" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_history_events_v_version_conflicting_accounts_locales_local" ON "_history_events_v_version_conflicting_accounts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_history_events_v_version_subjects_order_idx" ON "_history_events_v_version_subjects" USING btree ("order");
  CREATE INDEX "_history_events_v_version_subjects_parent_idx" ON "_history_events_v_version_subjects" USING btree ("parent_id");
  CREATE INDEX "_history_events_v_version_images_order_idx" ON "_history_events_v_version_images" USING btree ("_order");
  CREATE INDEX "_history_events_v_version_images_parent_id_idx" ON "_history_events_v_version_images" USING btree ("_parent_id");
  CREATE INDEX "_history_events_v_version_images_image_idx" ON "_history_events_v_version_images" USING btree ("image_id");
  CREATE UNIQUE INDEX "_history_events_v_version_images_locales_locale_parent_id_un" ON "_history_events_v_version_images_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_history_events_v_version_published_locales_order_idx" ON "_history_events_v_version_published_locales" USING btree ("order");
  CREATE INDEX "_history_events_v_version_published_locales_parent_idx" ON "_history_events_v_version_published_locales" USING btree ("parent_id");
  CREATE INDEX "_history_events_v_parent_idx" ON "_history_events_v" USING btree ("parent_id");
  CREATE INDEX "_history_events_v_version_version_sort_key_idx" ON "_history_events_v" USING btree ("version_sort_key");
  CREATE INDEX "_history_events_v_version_version_author_idx" ON "_history_events_v" USING btree ("version_author_id");
  CREATE INDEX "_history_events_v_version_version_updated_at_idx" ON "_history_events_v" USING btree ("version_updated_at");
  CREATE INDEX "_history_events_v_version_version_created_at_idx" ON "_history_events_v" USING btree ("version_created_at");
  CREATE INDEX "_history_events_v_version_version__status_idx" ON "_history_events_v" USING btree ("version__status");
  CREATE INDEX "_history_events_v_created_at_idx" ON "_history_events_v" USING btree ("created_at");
  CREATE INDEX "_history_events_v_updated_at_idx" ON "_history_events_v" USING btree ("updated_at");
  CREATE INDEX "_history_events_v_snapshot_idx" ON "_history_events_v" USING btree ("snapshot");
  CREATE INDEX "_history_events_v_published_locale_idx" ON "_history_events_v" USING btree ("published_locale");
  CREATE INDEX "_history_events_v_latest_idx" ON "_history_events_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_history_events_v_locales_locale_parent_id_unique" ON "_history_events_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_history_events_v_rels_order_idx" ON "_history_events_v_rels" USING btree ("order");
  CREATE INDEX "_history_events_v_rels_parent_idx" ON "_history_events_v_rels" USING btree ("parent_id");
  CREATE INDEX "_history_events_v_rels_path_idx" ON "_history_events_v_rels" USING btree ("path");
  CREATE INDEX "_history_events_v_rels_sources_id_idx" ON "_history_events_v_rels" USING btree ("sources_id");
  CREATE INDEX "_history_events_v_rels_articles_id_idx" ON "_history_events_v_rels" USING btree ("articles_id");
  CREATE INDEX "faqs_audiences_order_idx" ON "faqs_audiences" USING btree ("order");
  CREATE INDEX "faqs_audiences_parent_idx" ON "faqs_audiences" USING btree ("parent_id");
  CREATE INDEX "faqs_published_locales_order_idx" ON "faqs_published_locales" USING btree ("order");
  CREATE INDEX "faqs_published_locales_parent_idx" ON "faqs_published_locales" USING btree ("parent_id");
  CREATE INDEX "faqs_category_idx" ON "faqs" USING btree ("category_id");
  CREATE INDEX "faqs_author_idx" ON "faqs" USING btree ("author_id");
  CREATE INDEX "faqs_updated_at_idx" ON "faqs" USING btree ("updated_at");
  CREATE INDEX "faqs_created_at_idx" ON "faqs" USING btree ("created_at");
  CREATE INDEX "faqs__status_idx" ON "faqs" USING btree ("_status");
  CREATE UNIQUE INDEX "faqs_locales_locale_parent_id_unique" ON "faqs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "faqs_rels_order_idx" ON "faqs_rels" USING btree ("order");
  CREATE INDEX "faqs_rels_parent_idx" ON "faqs_rels" USING btree ("parent_id");
  CREATE INDEX "faqs_rels_path_idx" ON "faqs_rels" USING btree ("path");
  CREATE INDEX "faqs_rels_articles_id_idx" ON "faqs_rels" USING btree ("articles_id");
  CREATE INDEX "faqs_rels_sources_id_idx" ON "faqs_rels" USING btree ("sources_id");
  CREATE INDEX "_faqs_v_version_audiences_order_idx" ON "_faqs_v_version_audiences" USING btree ("order");
  CREATE INDEX "_faqs_v_version_audiences_parent_idx" ON "_faqs_v_version_audiences" USING btree ("parent_id");
  CREATE INDEX "_faqs_v_version_published_locales_order_idx" ON "_faqs_v_version_published_locales" USING btree ("order");
  CREATE INDEX "_faqs_v_version_published_locales_parent_idx" ON "_faqs_v_version_published_locales" USING btree ("parent_id");
  CREATE INDEX "_faqs_v_parent_idx" ON "_faqs_v" USING btree ("parent_id");
  CREATE INDEX "_faqs_v_version_version_category_idx" ON "_faqs_v" USING btree ("version_category_id");
  CREATE INDEX "_faqs_v_version_version_author_idx" ON "_faqs_v" USING btree ("version_author_id");
  CREATE INDEX "_faqs_v_version_version_updated_at_idx" ON "_faqs_v" USING btree ("version_updated_at");
  CREATE INDEX "_faqs_v_version_version_created_at_idx" ON "_faqs_v" USING btree ("version_created_at");
  CREATE INDEX "_faqs_v_version_version__status_idx" ON "_faqs_v" USING btree ("version__status");
  CREATE INDEX "_faqs_v_created_at_idx" ON "_faqs_v" USING btree ("created_at");
  CREATE INDEX "_faqs_v_updated_at_idx" ON "_faqs_v" USING btree ("updated_at");
  CREATE INDEX "_faqs_v_snapshot_idx" ON "_faqs_v" USING btree ("snapshot");
  CREATE INDEX "_faqs_v_published_locale_idx" ON "_faqs_v" USING btree ("published_locale");
  CREATE INDEX "_faqs_v_latest_idx" ON "_faqs_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_faqs_v_locales_locale_parent_id_unique" ON "_faqs_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_faqs_v_rels_order_idx" ON "_faqs_v_rels" USING btree ("order");
  CREATE INDEX "_faqs_v_rels_parent_idx" ON "_faqs_v_rels" USING btree ("parent_id");
  CREATE INDEX "_faqs_v_rels_path_idx" ON "_faqs_v_rels" USING btree ("path");
  CREATE INDEX "_faqs_v_rels_articles_id_idx" ON "_faqs_v_rels" USING btree ("articles_id");
  CREATE INDEX "_faqs_v_rels_sources_id_idx" ON "_faqs_v_rels" USING btree ("sources_id");
  CREATE INDEX "sources_excerpts_order_idx" ON "sources_excerpts" USING btree ("_order");
  CREATE INDEX "sources_excerpts_parent_id_idx" ON "sources_excerpts" USING btree ("_parent_id");
  CREATE INDEX "sources_verified_by_idx" ON "sources" USING btree ("verified_by_id");
  CREATE INDEX "sources_author_idx" ON "sources" USING btree ("author_id");
  CREATE INDEX "sources_updated_at_idx" ON "sources" USING btree ("updated_at");
  CREATE INDEX "sources_created_at_idx" ON "sources" USING btree ("created_at");
  CREATE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "categories_locales_locale_parent_id_unique" ON "categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "editorial_topics_category_idx" ON "editorial_topics" USING btree ("category_id");
  CREATE INDEX "editorial_topics_linked_article_idx" ON "editorial_topics" USING btree ("linked_article_id");
  CREATE INDEX "editorial_topics_author_idx" ON "editorial_topics" USING btree ("author_id");
  CREATE INDEX "editorial_topics_updated_at_idx" ON "editorial_topics" USING btree ("updated_at");
  CREATE INDEX "editorial_topics_created_at_idx" ON "editorial_topics" USING btree ("created_at");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("articles_id");
  CREATE INDEX "payload_locked_documents_rels_history_events_id_idx" ON "payload_locked_documents_rels" USING btree ("history_events_id");
  CREATE INDEX "payload_locked_documents_rels_faqs_id_idx" ON "payload_locked_documents_rels" USING btree ("faqs_id");
  CREATE INDEX "payload_locked_documents_rels_sources_id_idx" ON "payload_locked_documents_rels" USING btree ("sources_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_editorial_topics_id_idx" ON "payload_locked_documents_rels" USING btree ("editorial_topics_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_social_links_order_idx" ON "site_settings_social_links" USING btree ("_order");
  CREATE INDEX "site_settings_social_links_parent_id_idx" ON "site_settings_social_links" USING btree ("_parent_id");
  CREATE INDEX "site_settings_default_og_image_idx" ON "site_settings" USING btree ("default_og_image_id");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_items_order_idx" ON "navigation_items" USING btree ("_order");
  CREATE INDEX "navigation_items_parent_id_idx" ON "navigation_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_items_locales_locale_parent_id_unique" ON "navigation_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_pathways_order_idx" ON "homepage_pathways" USING btree ("_order");
  CREATE INDEX "homepage_pathways_parent_id_idx" ON "homepage_pathways" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "homepage_pathways_locales_locale_parent_id_unique" ON "homepage_pathways_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage__status_idx" ON "homepage" USING btree ("_status");
  CREATE UNIQUE INDEX "homepage_locales_locale_parent_id_unique" ON "homepage_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_rels_order_idx" ON "homepage_rels" USING btree ("order");
  CREATE INDEX "homepage_rels_parent_idx" ON "homepage_rels" USING btree ("parent_id");
  CREATE INDEX "homepage_rels_path_idx" ON "homepage_rels" USING btree ("path");
  CREATE INDEX "homepage_rels_articles_id_idx" ON "homepage_rels" USING btree ("articles_id");
  CREATE INDEX "homepage_rels_faqs_id_idx" ON "homepage_rels" USING btree ("faqs_id");
  CREATE INDEX "_homepage_v_version_pathways_order_idx" ON "_homepage_v_version_pathways" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_pathways_parent_id_idx" ON "_homepage_v_version_pathways" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_homepage_v_version_pathways_locales_locale_parent_id_unique" ON "_homepage_v_version_pathways_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_homepage_v_version_version__status_idx" ON "_homepage_v" USING btree ("version__status");
  CREATE INDEX "_homepage_v_created_at_idx" ON "_homepage_v" USING btree ("created_at");
  CREATE INDEX "_homepage_v_updated_at_idx" ON "_homepage_v" USING btree ("updated_at");
  CREATE INDEX "_homepage_v_snapshot_idx" ON "_homepage_v" USING btree ("snapshot");
  CREATE INDEX "_homepage_v_published_locale_idx" ON "_homepage_v" USING btree ("published_locale");
  CREATE INDEX "_homepage_v_latest_idx" ON "_homepage_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_homepage_v_locales_locale_parent_id_unique" ON "_homepage_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_homepage_v_rels_order_idx" ON "_homepage_v_rels" USING btree ("order");
  CREATE INDEX "_homepage_v_rels_parent_idx" ON "_homepage_v_rels" USING btree ("parent_id");
  CREATE INDEX "_homepage_v_rels_path_idx" ON "_homepage_v_rels" USING btree ("path");
  CREATE INDEX "_homepage_v_rels_articles_id_idx" ON "_homepage_v_rels" USING btree ("articles_id");
  CREATE INDEX "_homepage_v_rels_faqs_id_idx" ON "_homepage_v_rels" USING btree ("faqs_id");
  CREATE INDEX "footer_columns_links_order_idx" ON "footer_columns_links" USING btree ("_order");
  CREATE INDEX "footer_columns_links_parent_id_idx" ON "footer_columns_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_columns_links_locales_locale_parent_id_unique" ON "footer_columns_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_columns_order_idx" ON "footer_columns" USING btree ("_order");
  CREATE INDEX "footer_columns_parent_id_idx" ON "footer_columns" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_columns_locales_locale_parent_id_unique" ON "footer_columns_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "footer_locales_locale_parent_id_unique" ON "footer_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "contact_settings_locales_locale_parent_id_unique" ON "contact_settings_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "editorial_policy_locales_locale_parent_id_unique" ON "editorial_policy_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_editorial_policy_v_created_at_idx" ON "_editorial_policy_v" USING btree ("created_at");
  CREATE INDEX "_editorial_policy_v_updated_at_idx" ON "_editorial_policy_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_editorial_policy_v_locales_locale_parent_id_unique" ON "_editorial_policy_v_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "articles_audiences" CASCADE;
  DROP TABLE "article_claims" CASCADE;
  DROP TABLE "articles" CASCADE;
  DROP TABLE "articles_texts" CASCADE;
  DROP TABLE "articles_rels" CASCADE;
  DROP TABLE "_articles_v_version_audiences" CASCADE;
  DROP TABLE "_article_claims_v" CASCADE;
  DROP TABLE "_articles_v" CASCADE;
  DROP TABLE "_articles_v_texts" CASCADE;
  DROP TABLE "_articles_v_rels" CASCADE;
  DROP TABLE "history_events_conflicting_accounts" CASCADE;
  DROP TABLE "history_events_conflicting_accounts_locales" CASCADE;
  DROP TABLE "history_events_subjects" CASCADE;
  DROP TABLE "history_events_images" CASCADE;
  DROP TABLE "history_events_images_locales" CASCADE;
  DROP TABLE "history_events_published_locales" CASCADE;
  DROP TABLE "history_events" CASCADE;
  DROP TABLE "history_events_locales" CASCADE;
  DROP TABLE "history_events_rels" CASCADE;
  DROP TABLE "_history_events_v_version_conflicting_accounts" CASCADE;
  DROP TABLE "_history_events_v_version_conflicting_accounts_locales" CASCADE;
  DROP TABLE "_history_events_v_version_subjects" CASCADE;
  DROP TABLE "_history_events_v_version_images" CASCADE;
  DROP TABLE "_history_events_v_version_images_locales" CASCADE;
  DROP TABLE "_history_events_v_version_published_locales" CASCADE;
  DROP TABLE "_history_events_v" CASCADE;
  DROP TABLE "_history_events_v_locales" CASCADE;
  DROP TABLE "_history_events_v_rels" CASCADE;
  DROP TABLE "faqs_audiences" CASCADE;
  DROP TABLE "faqs_published_locales" CASCADE;
  DROP TABLE "faqs" CASCADE;
  DROP TABLE "faqs_locales" CASCADE;
  DROP TABLE "faqs_rels" CASCADE;
  DROP TABLE "_faqs_v_version_audiences" CASCADE;
  DROP TABLE "_faqs_v_version_published_locales" CASCADE;
  DROP TABLE "_faqs_v" CASCADE;
  DROP TABLE "_faqs_v_locales" CASCADE;
  DROP TABLE "_faqs_v_rels" CASCADE;
  DROP TABLE "sources_excerpts" CASCADE;
  DROP TABLE "sources" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "categories_locales" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "editorial_topics" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings_social_links" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TABLE "navigation_items" CASCADE;
  DROP TABLE "navigation_items_locales" CASCADE;
  DROP TABLE "navigation" CASCADE;
  DROP TABLE "homepage_pathways" CASCADE;
  DROP TABLE "homepage_pathways_locales" CASCADE;
  DROP TABLE "homepage" CASCADE;
  DROP TABLE "homepage_locales" CASCADE;
  DROP TABLE "homepage_rels" CASCADE;
  DROP TABLE "_homepage_v_version_pathways" CASCADE;
  DROP TABLE "_homepage_v_version_pathways_locales" CASCADE;
  DROP TABLE "_homepage_v" CASCADE;
  DROP TABLE "_homepage_v_locales" CASCADE;
  DROP TABLE "_homepage_v_rels" CASCADE;
  DROP TABLE "footer_columns_links" CASCADE;
  DROP TABLE "footer_columns_links_locales" CASCADE;
  DROP TABLE "footer_columns" CASCADE;
  DROP TABLE "footer_columns_locales" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "footer_locales" CASCADE;
  DROP TABLE "contact_settings" CASCADE;
  DROP TABLE "contact_settings_locales" CASCADE;
  DROP TABLE "editorial_policy" CASCADE;
  DROP TABLE "editorial_policy_locales" CASCADE;
  DROP TABLE "_editorial_policy_v" CASCADE;
  DROP TABLE "_editorial_policy_v_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_articles_audiences";
  DROP TYPE "public"."enum_articles_section";
  DROP TYPE "public"."enum_articles_article_type";
  DROP TYPE "public"."enum_articles_knowledge_level";
  DROP TYPE "public"."enum_articles_japan_relevance";
  DROP TYPE "public"."enum_articles_language";
  DROP TYPE "public"."enum_articles_editorial_status";
  DROP TYPE "public"."enum_articles_status";
  DROP TYPE "public"."enum__articles_v_version_audiences";
  DROP TYPE "public"."enum__articles_v_version_section";
  DROP TYPE "public"."enum__articles_v_version_article_type";
  DROP TYPE "public"."enum__articles_v_version_knowledge_level";
  DROP TYPE "public"."enum__articles_v_version_japan_relevance";
  DROP TYPE "public"."enum__articles_v_version_language";
  DROP TYPE "public"."enum__articles_v_version_editorial_status";
  DROP TYPE "public"."enum__articles_v_version_status";
  DROP TYPE "public"."enum__articles_v_published_locale";
  DROP TYPE "public"."enum_history_events_subjects";
  DROP TYPE "public"."enum_history_events_published_locales";
  DROP TYPE "public"."enum_history_events_date_precision";
  DROP TYPE "public"."enum_history_events_period";
  DROP TYPE "public"."enum_history_events_verification_status";
  DROP TYPE "public"."enum_history_events_editorial_status";
  DROP TYPE "public"."enum_history_events_status";
  DROP TYPE "public"."enum__history_events_v_version_subjects";
  DROP TYPE "public"."enum__history_events_v_version_published_locales";
  DROP TYPE "public"."enum__history_events_v_version_date_precision";
  DROP TYPE "public"."enum__history_events_v_version_period";
  DROP TYPE "public"."enum__history_events_v_version_verification_status";
  DROP TYPE "public"."enum__history_events_v_version_editorial_status";
  DROP TYPE "public"."enum__history_events_v_version_status";
  DROP TYPE "public"."enum__history_events_v_published_locale";
  DROP TYPE "public"."enum_faqs_audiences";
  DROP TYPE "public"."enum_faqs_published_locales";
  DROP TYPE "public"."enum_faqs_editorial_status";
  DROP TYPE "public"."enum_faqs_status";
  DROP TYPE "public"."enum__faqs_v_version_audiences";
  DROP TYPE "public"."enum__faqs_v_version_published_locales";
  DROP TYPE "public"."enum__faqs_v_version_editorial_status";
  DROP TYPE "public"."enum__faqs_v_version_status";
  DROP TYPE "public"."enum__faqs_v_published_locale";
  DROP TYPE "public"."enum_sources_excerpts_origin";
  DROP TYPE "public"."enum_sources_source_type";
  DROP TYPE "public"."enum_sources_original_language";
  DROP TYPE "public"."enum_sources_usage_permission";
  DROP TYPE "public"."enum_sources_verification_status";
  DROP TYPE "public"."enum_categories_group";
  DROP TYPE "public"."enum_media_license";
  DROP TYPE "public"."enum_editorial_topics_language";
  DROP TYPE "public"."enum_editorial_topics_audience";
  DROP TYPE "public"."enum_editorial_topics_priority";
  DROP TYPE "public"."enum_editorial_topics_status";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_homepage_status";
  DROP TYPE "public"."enum__homepage_v_version_status";
  DROP TYPE "public"."enum__homepage_v_published_locale";`)
}
