import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/access/roles'
import { label } from '@/lib/i18n/config'

/**
 * Operational log of AI Studio requests: who, which action and model, token usage and outcome.
 * Prompts and generated text are intentionally NOT stored. Written only by server code.
 */
export const AIUsage: CollectionConfig = {
  slug: 'ai-usage',
  labels: { singular: label('AI利用記録', 'AI usage record'), plural: label('AI利用記録', 'AI usage') },
  admin: {
    group: label('運営', 'Operations'),
    defaultColumns: ['createdAt', 'user', 'action', 'status', 'inputTokens', 'outputTokens'],
    useAsTitle: 'action',
  },
  access: {
    create: () => false,
    update: () => false,
    read: ({ req }) => {
      if (!req.user) return false
      if ((req.user as { role?: string }).role === 'admin') return true
      return { user: { equals: req.user.id } }
    },
    delete: isAdmin,
  },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true, index: true, label: label('ユーザー', 'User') },
    { name: 'action', type: 'text', required: true, label: label('操作', 'Action') },
    { name: 'model', type: 'text', label: label('モデル', 'Model') },
    {
      name: 'status',
      type: 'select',
      required: true,
      // 'pending' is written before the model call so concurrent requests count toward limits.
      options: ['pending', 'success', 'error'],
      label: label('結果', 'Outcome'),
    },
    { name: 'errorKind', type: 'text', label: label('エラー種別', 'Error kind') },
    { name: 'inputTokens', type: 'number', defaultValue: 0, label: label('入力トークン', 'Input tokens') },
    { name: 'outputTokens', type: 'number', defaultValue: 0, label: label('出力トークン', 'Output tokens') },
    { name: 'modelTier', type: 'select', options: ['main', 'fast'], label: label('モデル区分', 'Model tier') },
    { name: 'promptVersion', type: 'text', label: label('プロンプト版', 'Prompt version') },
    { name: 'requestId', type: 'text', label: label('リクエストID', 'Request ID') },
    {
      name: 'estimatedCostUsd',
      type: 'number',
      label: label('推定費用（USD）', 'Estimated cost (USD)'),
      admin: { description: label('トークン数と単価からの推定値です。請求額ではありません。', 'Estimated from tokens and list prices — not the billed amount.') },
    },
  ],
}
