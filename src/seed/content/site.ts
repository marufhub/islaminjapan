import type { RichBlock } from '@/lib/richtext/build'
import type { Locale } from '@/lib/i18n/config'

export const SEED_CATEGORIES = [
  { slug: 'beliefs', group: 'beliefs', ja: 'イスラームの信仰', en: 'Islamic Beliefs' },
  { slug: 'quran-hadith', group: 'quran_hadith', ja: 'クルアーンとハディース', en: 'Quran & Hadith' },
  { slug: 'history-japan', group: 'history_japan', ja: '日本のイスラーム史', en: 'Islam in Japan History' },
  { slug: 'muslim-life', group: 'muslim_life', ja: '日本でのムスリム生活', en: 'Muslim Life in Japan' },
  { slug: 'ethics-culture', group: 'ethics_culture', ja: '倫理と文化', en: 'Islamic Ethics & Culture' },
  { slug: 'community', group: 'community', ja: '相互理解', en: 'Community Understanding' },
] as const

export const SEED_NAVIGATION: Record<Locale, Array<{ label: string; href: string }>> = {
  ja: [
    { label: 'イスラームを知る', href: '/learn' },
    { label: '日本のイスラーム', href: '/islam-in-japan' },
    { label: '日本でのムスリム生活', href: '/muslim-life' },
    { label: 'イスラームQ&A', href: '/faq' },
    { label: '記事・資料', href: '/articles' },
    { label: '私たちについて', href: '/about' },
  ],
  en: [
    { label: 'Discover Islam', href: '/learn' },
    { label: 'Islam in Japan', href: '/islam-in-japan' },
    { label: 'Muslim Life', href: '/muslim-life' },
    { label: 'Questions', href: '/faq' },
    { label: 'Articles', href: '/articles' },
    { label: 'About', href: '/about' },
  ],
}

export const SEED_SITE: Record<Locale, { siteName: string; tagline: string; description: string }> = {
  ja: {
    siteName: 'Islam in Japan',
    tagline: 'イスラームを知る。日本で学び、理解し、つながる。',
    description: 'イスラームの教え、歴史、文化、そして日本で暮らすムスリムの生活をわかりやすく紹介します。',
  },
  en: {
    siteName: 'Islam in Japan',
    tagline: 'Discover Islam. Learn, Understand, and Connect in Japan.',
    description: 'Clear introductions to Islamic teachings, history and culture, and to the lives of Muslims living in Japan.',
  },
}

export const SEED_HOMEPAGE: Record<Locale, { heroTitle: string; heroIntro: string; pathways: Array<{ title: string; description: string; href: string }> }> = {
  ja: {
    heroTitle: '日本でイスラームを知る',
    heroIntro: 'イスラームの教え、歴史、文化、そして日本で暮らすムスリムの生活をわかりやすく紹介します。',
    pathways: [
      { title: 'イスラームを知る', description: '信仰・価値観・実践の基本をやさしく解説します。', href: '/learn' },
      { title: '日本のイスラームを探る', description: '歴史、モスク、コミュニティ、文化をたどります。', href: '/islam-in-japan' },
      { title: '日本でのムスリム生活', description: '日本で暮らすムスリムに役立つ学びと情報。', href: '/muslim-life' },
    ],
  },
  en: {
    heroTitle: 'Discover Islam in Japan',
    heroIntro: 'Clear introductions to Islamic teachings, history and culture, and to the lives of Muslims living in Japan.',
    pathways: [
      { title: 'Discover Islam', description: "Learn Islam's beliefs, values and practices.", href: '/learn' },
      { title: 'Explore Islam in Japan', description: 'History, mosques, communities and culture.', href: '/islam-in-japan' },
      { title: 'Muslim Life in Japan', description: 'Learning and practical information for life in Japan.', href: '/muslim-life' },
    ],
  },
}

/** Policy texts describe how THIS platform works; the privacy policy is a draft pending legal review. */
export const SEED_POLICIES: Record<Locale, Record<'about' | 'editorialPolicy' | 'sourcesPolicy' | 'privacyPolicy', RichBlock[]>> = {
  ja: {
    about: [
      { type: 'paragraph', text: 'Islam in Japan は、日本で暮らすすべての人に向けて、イスラームの教え・歴史・文化と、日本のムスリムの暮らしを紹介する日本語中心の学習サイトです。' },
      { type: 'paragraph', text: 'ムスリムの方にも、そうでない方にも、偏りなく信頼できる情報を届け、相互理解と共生に貢献することを目指しています。' },
      { type: 'paragraph', text: '【編集部注】運営者情報はサイト設定に登録された内容のみを表示します。' },
    ],
    editorialPolicy: [
      { type: 'heading', level: 2, text: 'レビューと公開' },
      { type: 'paragraph', text: 'すべての記事は、編集者のレビューと承認を経てから公開します。著者は下書きの作成のみを行い、公開の権限を持ちません。' },
      { type: 'heading', level: 2, text: 'AIの利用について' },
      { type: 'paragraph', text: '記事の下書きや翻訳にAIを利用することがあります。AIが生成した文章が自動的に公開されることはなく、必ず人が内容と出典を確認します。根拠が確認できない記述は「要確認」として扱い、公開しません。' },
      { type: 'heading', level: 2, text: '宗教的判断について' },
      { type: 'paragraph', text: '当サイトの解説は一般的な情報です。個別の宗教的判断（ファトワー）は提供しません。必要な場合は、信頼できる学者やモスクにご相談ください。' },
      { type: 'heading', level: 2, text: '訂正' },
      { type: 'paragraph', text: '誤りが見つかった場合は速やかに訂正し、最終レビュー日を更新します。お気づきの点はお問い合わせフォームからお知らせください。' },
    ],
    sourcesPolicy: [
      { type: 'paragraph', text: '歴史的な事実や数値、引用には出典を明記します。出典は、編集者が内容を実際に確認したものに限り「検証済み」として掲載します。URLが存在するだけでは、内容を確認したことにはなりません。' },
      { type: 'paragraph', text: 'クルアーンを引用する際は章・節の番号と翻訳の出典を示し、ハディースは典拠となる校訂版を確認できる場合にのみ番号を記載します。' },
      { type: 'paragraph', text: '日付が不確かな出来事や、諸説ある事柄については、その旨を明記します。' },
    ],
    privacyPolicy: [
      { type: 'paragraph', text: '【草案・法務レビュー前】この文章は運営者による法的確認が完了していない草案です。正式版の公開前に必ず専門家の確認を受けてください。' },
      { type: 'paragraph', text: 'お問い合わせフォームでご入力いただいたお名前・メールアドレス・内容は、お問い合わせへの対応のためにのみ利用します。不正送信の防止のため、送信元IPアドレスは一方向に変換（ハッシュ化）した値のみを一時的に保存し、IPアドレスそのものは保存しません。' },
    ],
  },
  en: {
    about: [
      { type: 'paragraph', text: 'Islam in Japan is a Japanese-first learning platform introducing Islamic teachings, history and culture, and the lives of Muslims in Japan, for everyone living in Japan.' },
      { type: 'paragraph', text: 'We aim to provide balanced, trustworthy information for Muslims and non-Muslims alike, and to contribute to mutual understanding and coexistence.' },
      { type: 'paragraph', text: 'Editor’s note: organization details are shown only as entered in Site settings.' },
    ],
    editorialPolicy: [
      { type: 'heading', level: 2, text: 'Review and publication' },
      { type: 'paragraph', text: 'Every article is reviewed and approved by an editor before publication. Authors write drafts and cannot publish.' },
      { type: 'heading', level: 2, text: 'Use of AI' },
      { type: 'paragraph', text: 'We may use AI to help draft or translate articles. AI-generated text is never published automatically: people always check the content and sources. Statements that cannot be supported are marked “needs verification” and are not published.' },
      { type: 'heading', level: 2, text: 'Religious rulings' },
      { type: 'paragraph', text: 'Our explanations are general information. We do not issue religious rulings (fatwas); please consult a qualified scholar or your local mosque.' },
      { type: 'heading', level: 2, text: 'Corrections' },
      { type: 'paragraph', text: 'We correct errors promptly and update the last-reviewed date. Please let us know through the contact form.' },
    ],
    sourcesPolicy: [
      { type: 'paragraph', text: 'Historical facts, figures and quotations are cited. A source is listed as verified only when an editor has actually consulted its contents — the existence of a URL is not treated as evidence.' },
      { type: 'paragraph', text: 'Quranic quotations give the surah and verse numbers and the translation used; hadith numbers are given only when traceable to a specific edition.' },
      { type: 'paragraph', text: 'Where dates are uncertain or accounts differ, we say so explicitly.' },
    ],
    privacyPolicy: [
      { type: 'paragraph', text: 'DRAFT — pending legal review. This text has not been reviewed by a legal professional and must be reviewed before public launch.' },
      { type: 'paragraph', text: 'Names, email addresses and messages submitted through the contact form are used only to respond to inquiries. To prevent abuse, we store only a one-way hash of the sender’s IP address, never the address itself.' },
    ],
  },
}
