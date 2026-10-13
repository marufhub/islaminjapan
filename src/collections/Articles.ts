import type { CollectionConfig, FieldAccess } from 'payload'

import { editorOrOwner, isEditorOrAdmin, isStaff, isStaffField, publishedOrStaff } from '@/access/roles'
import { audiencesField, knowledgeLevelField } from '@/fields/audience'
import {
  authorField,
  editorialStatusField,
  editorOnlyAccess,
  languageField,
  searchTextField,
  seoField,
  slugField,
  translationGroupField,
} from '@/fields/shared'
import { enforceEditorialWorkflow } from '@/hooks/editorialWorkflow'
import { requireResolvedClaims, requireReviewer, requireVerifiedSources } from '@/hooks/publishChecks'
import { trackDraftSave } from '@/hooks/requestGuards'
import { buildSearchText } from '@/hooks/searchText'
import { setPublishedAt } from '@/hooks/setPublishedAt'
import { uniqueSlugPerLanguage } from '@/hooks/uniqueSlugPerLanguage'
import { label } from '@/lib/i18n/config'

export const ARTICLE_SECTIONS = [
  { value: 'learn', label: label('イスラームを知る', 'Discover Islam') },
  // Stored value kept as 'islam-in-japan' (no data migration); public route is /history-of-islam-in-japan.
  { value: 'islam-in-japan', label: label('日本におけるイスラームの歴史', 'History of Islam in Japan') },
  { value: 'muslim-life', label: label('日本でのムスリム生活', 'Muslim Life in Japan') },
  { value: 'resources', label: label('記事・資料', 'Articles & Resources') },
]

export const ARTICLE_TYPES = [
  { value: 'explainer', label: label('入門解説', 'Introductory explainer') },
  { value: 'history_research', label: label('日本におけるイスラームの歴史（研究記事）', 'History of Islam in Japan research') },
  { value: 'profile', label: label('人物・団体・モスクの紹介', 'Profile (pioneer, scholar, community, mosque, association)') },
  { value: 'faq', label: label('Q&A', 'FAQ-style') },
  { value: 'muslim_life', label: label('日本でのムスリム生活', 'Muslim life in Japan') },
]

/** AI provenance can only be written by trusted server code (AI Studio), never by API clients. */
const serverOnly: FieldAccess = ({ req }) => Boolean(req.context?.aiStudio)

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: label('記事', 'Article'), plural: label('記事', 'Articles') },
  admin: {
    useAsTitle: 'title',
    group: label('コンテンツ', 'Content'),
    defaultColumns: ['title', 'language', 'section', 'editorialStatus', '_status', 'updatedAt'],
    listSearchableFields: ['title', 'slug', 'summary'],
    preview: (doc) =>
      doc?.slug && doc?.language
        ? `/preview?path=${encodeURIComponent(`/${String(doc.language)}/articles/${String(doc.slug)}`)}`
        : null,
  },
  access: {
    read: publishedOrStaff,
    readVersions: isStaff,
    create: isStaff,
    update: editorOrOwner,
    delete: isEditorOrAdmin,
  },
  versions: { drafts: true, maxPerDoc: 50 },
  hooks: {
    beforeOperation: [trackDraftSave],
    beforeChange: [
      uniqueSlugPerLanguage('articles'),
      enforceEditorialWorkflow([requireReviewer, requireResolvedClaims, requireVerifiedSources('sources')]),
      setPublishedAt,
      buildSearchText({ text: ['title', 'summary'], richText: ['body'] }),
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: label('タイトル', 'Title') },
    { name: 'summary', type: 'textarea', label: label('概要', 'Summary'), maxLength: 400 },
    {
      type: 'tabs',
      tabs: [
        {
          label: label('本文', 'Content'),
          fields: [
            { name: 'coverImage', type: 'upload', relationTo: 'media', label: label('カバー画像', 'Cover image') },
            { name: 'body', type: 'richText', label: label('本文', 'Body') },
          ],
        },
        {
          label: label('分類', 'Classification'),
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'section', type: 'select', required: true, defaultValue: 'resources', label: label('セクション', 'Section'), options: ARTICLE_SECTIONS },
                { name: 'articleType', type: 'select', required: true, defaultValue: 'explainer', label: label('記事タイプ', 'Article type'), options: ARTICLE_TYPES },
              ],
            },
            { name: 'category', type: 'relationship', relationTo: 'categories', label: label('カテゴリー', 'Category') },
            { name: 'tags', type: 'text', hasMany: true, label: label('タグ', 'Tags') },
            audiencesField,
            {
              type: 'row',
              fields: [
                knowledgeLevelField,
                {
                  name: 'japanRelevance',
                  type: 'select',
                  defaultValue: 'related',
                  label: label('日本との関連', 'Japan relevance'),
                  options: [
                    { value: 'general', label: label('一般', 'General') },
                    { value: 'related', label: label('関連あり', 'Related') },
                    { value: 'central', label: label('日本が中心', 'Japan-focused') },
                  ],
                },
              ],
            },
            {
              name: 'learningJourneyOrder',
              type: 'number',
              label: label('入門ラーニングジャーニーの順番', 'Beginner journey order'),
              admin: { description: label('入門コースに含める場合のみ入力', 'Set only to include in the beginner journey') },
            },
            { name: 'relatedArticles', type: 'relationship', relationTo: 'articles', hasMany: true, label: label('関連記事', 'Related articles') },
          ],
        },
        {
          label: label('出典と検証', 'Sources & verification'),
          fields: [
            {
              name: 'sources',
              type: 'relationship',
              relationTo: 'sources',
              hasMany: true,
              label: label('出典', 'Sources'),
              admin: { description: label('公開時はすべて検証済みである必要があります。', 'All sources must be verified before publishing.') },
            },
            {
              name: 'verification',
              type: 'group',
              label: label('検証', 'Verification'),
              // Internal review notes; never exposed on the public API.
              access: { read: isStaffField },
              fields: [
                {
                  name: 'claimsRequiringVerification',
                  dbName: 'article_claims',
                  type: 'array',
                  label: label('要確認の主張', 'Claims requiring verification'),
                  admin: { description: label('すべて解決済みにするまで公開できません。', 'All must be resolved before publishing.') },
                  fields: [
                    { name: 'claim', type: 'textarea', required: true, label: label('主張', 'Claim') },
                    { name: 'reason', type: 'textarea', label: label('理由', 'Reason') },
                    { name: 'suggestedEvidence', type: 'textarea', label: label('必要な根拠', 'Suggested evidence') },
                    {
                      type: 'row',
                      fields: [
                        { name: 'resolved', type: 'checkbox', defaultValue: false, label: label('解決済み', 'Resolved'), access: editorOnlyAccess },
                        { name: 'resolutionNote', type: 'text', label: label('解決メモ', 'Resolution note') },
                      ],
                    },
                  ],
                },
                { name: 'evidenceWarnings', type: 'textarea', label: label('根拠に関する注意', 'Evidence warnings') },
                { name: 'editorialNotes', type: 'textarea', label: label('編集メモ', 'Editorial notes') },
              ],
            },
            {
              name: 'aiProvenance',
              type: 'group',
              label: label('AI生成の記録', 'AI provenance'),
              access: { read: isStaffField, create: serverOnly, update: serverOnly },
              admin: { readOnly: true },
              fields: [
                { name: 'aiAssisted', type: 'checkbox', defaultValue: false, label: label('AI支援あり', 'AI-assisted') },
                { name: 'model', type: 'text', label: label('モデル', 'Model') },
                { name: 'promptTemplate', type: 'text', label: label('プロンプトテンプレート', 'Prompt template') },
                { name: 'generatedAt', type: 'date', label: label('生成日時', 'Generated at') },
                { name: 'generatedBy', type: 'relationship', relationTo: 'users', label: label('実行者', 'Requested by') },
                { name: 'usedSourceIds', type: 'json', label: label('使用した出典ID', 'Used source IDs') },
              ],
            },
          ],
        },
        { label: 'SEO', fields: [seoField, { name: 'featured', type: 'checkbox', defaultValue: false, label: label('おすすめ記事', 'Featured') }] },
      ],
    },
    searchTextField,
    languageField,
    translationGroupField,
    slugField,
    editorialStatusField,
    authorField,
    { name: 'reviewer', type: 'relationship', relationTo: 'users', label: label('レビュー担当', 'Reviewer'), access: editorOnlyAccess, admin: { position: 'sidebar' } },
    { name: 'publishedAt', type: 'date', label: label('公開日', 'Published on'), admin: { position: 'sidebar' } },
    { name: 'lastReviewedAt', type: 'date', label: label('最終レビュー日', 'Last reviewed'), access: editorOnlyAccess, admin: { position: 'sidebar' } },
  ],
}
