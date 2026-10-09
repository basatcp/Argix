/** Minimal "Home / Page" trail for inner pages. */
export function Breadcrumbs({ current }: { current: string }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 text-[13px] font-medium text-muted">
        <li>
          {/* The ::after extends the tap target to about 44px without moving the layout. */}
          <a href="/" className="relative rounded transition-colors after:absolute after:-inset-x-2 after:-inset-y-3.5 after:content-[''] hover:text-text">
            Home
          </a>
        </li>
        <li aria-hidden="true" className="text-muted/50">
          /
        </li>
        <li>
          <span aria-current="page" className="text-[#C9D3E0]">
            {current}
          </span>
        </li>
      </ol>
    </nav>
  );
}
