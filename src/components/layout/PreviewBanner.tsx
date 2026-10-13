export function PreviewBanner({ message, exitLabel, returnPath }: { message: string; exitLabel: string; returnPath: string }) {
  return (
    <div role="status" className="bg-charcoal px-4 py-2 text-center text-sm text-white">
      {message}{' '}
      <a href={`/preview/exit?path=${encodeURIComponent(returnPath)}`} className="ml-2 text-white underline">
        {exitLabel}
      </a>
    </div>
  )
}
