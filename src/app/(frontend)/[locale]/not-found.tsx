import Link from 'next/link'

import { Container } from '@/components/ui/Container'

/** Rendered inside the locale layout; text is bilingual because the locale is not passed to not-found. */
export default function NotFound() {
  return (
    <Container size="reading" className="py-24 text-center">
      <h1 className="text-3xl font-bold text-primary">ページが見つかりません</h1>
      <p className="mt-2 text-muted" lang="en">
        Page not found
      </p>
      <p className="mt-8">
        <Link href="/ja">トップページへ</Link>
        {' · '}
        <Link href="/en" lang="en">
          English home
        </Link>
      </p>
    </Container>
  )
}
