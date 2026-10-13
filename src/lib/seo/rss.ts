const escapeXml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

export type RssItem = { title: string; url: string; description?: string | null; publishedAt?: string | null }

export const buildRss = (channel: { title: string; url: string; description: string; language: string; items: RssItem[] }): string => {
  const items = channel.items
    .map((item) =>
      [
        '<item>',
        `<title>${escapeXml(item.title)}</title>`,
        `<link>${escapeXml(item.url)}</link>`,
        `<guid isPermaLink="true">${escapeXml(item.url)}</guid>`,
        item.description ? `<description>${escapeXml(item.description)}</description>` : '',
        item.publishedAt ? `<pubDate>${new Date(item.publishedAt).toUTCString()}</pubDate>` : '',
        '</item>',
      ].join(''),
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>${escapeXml(channel.title)}</title>
<link>${escapeXml(channel.url)}</link>
<description>${escapeXml(channel.description)}</description>
<language>${channel.language}</language>
${items}
</channel></rss>`
}
