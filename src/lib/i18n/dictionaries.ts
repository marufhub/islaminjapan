import type { Locale } from './config'

/**
 * Fixed UI strings. Editorial copy (homepage text, navigation labels) lives in the CMS;
 * these are fallbacks and interface chrome only.
 */
const ja = {
  siteName: 'Islam in Japan',
  siteSubtitle: '日本でイスラームを知る',
  skipToContent: '本文へスキップ',
  languageSwitcher: '言語を選択',
  menu: 'メニュー',
  closeMenu: 'メニューを閉じる',
  mainNavigation: 'メインナビゲーション',
  nav: {
    home: 'ホーム',
    learn: 'イスラームを知る',
    islamInJapan: '日本のイスラーム',
    muslimLife: '日本でのムスリム生活',
    faq: 'イスラームQ&A',
    articles: '記事・資料',
    about: '私たちについて',
    contact: 'お問い合わせ',
    editorialPolicy: '編集方針',
    privacy: 'プライバシーポリシー',
  },
  home: {
    heroTitle: '日本でイスラームを知る',
    heroIntro: 'イスラームの教え、歴史、文化、そして日本で暮らすムスリムの生活をわかりやすく紹介します。',
    pathwaysHeading: '3つの入口から',
    pathways: [
      { title: 'イスラームを知る', description: '信仰・価値観・実践の基本をやさしく解説します。', href: '/learn' },
      { title: '日本のイスラームを探る', description: '歴史、モスク、コミュニティ、文化をたどります。', href: '/islam-in-japan' },
      { title: '日本でのムスリム生活', description: '日本で暮らすムスリムに役立つ学びと情報。', href: '/muslim-life' },
    ],
  },
  footer: {
    tagline: 'イスラームを知る。日本で学び、理解し、つながる。',
    credibility: '掲載内容は編集方針に基づき、出典とレビュー日を明記しています。',
  },
}

export type Dictionary = typeof ja

const en: Dictionary = {
  siteName: 'Islam in Japan',
  siteSubtitle: 'Discover Islam in Japan',
  skipToContent: 'Skip to main content',
  languageSwitcher: 'Choose language',
  menu: 'Menu',
  closeMenu: 'Close menu',
  mainNavigation: 'Main navigation',
  nav: {
    home: 'Home',
    learn: 'Discover Islam',
    islamInJapan: 'Islam in Japan',
    muslimLife: 'Muslim Life in Japan',
    faq: 'Questions About Islam',
    articles: 'Articles & Resources',
    about: 'About',
    contact: 'Contact',
    editorialPolicy: 'Editorial Policy',
    privacy: 'Privacy Policy',
  },
  home: {
    heroTitle: 'Discover Islam in Japan',
    heroIntro:
      'Clear introductions to Islamic teachings, history and culture, and to the lives of Muslims living in Japan.',
    pathwaysHeading: 'Three ways to begin',
    pathways: [
      { title: 'Discover Islam', description: "Learn Islam's beliefs, values and practices.", href: '/learn' },
      { title: 'Explore Islam in Japan', description: 'History, mosques, communities and culture.', href: '/islam-in-japan' },
      { title: 'Muslim Life in Japan', description: 'Learning and practical information for life in Japan.', href: '/muslim-life' },
    ],
  },
  footer: {
    tagline: 'Discover Islam. Learn, Understand, and Connect in Japan.',
    credibility: 'Content follows our editorial policy, with sources and review dates shown.',
  },
}

const dictionaries: Record<Locale, Dictionary> = { ja, en }

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale]
