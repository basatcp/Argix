import { useActiveSection } from '../../hooks/useActiveSection';

/**
 * In-page navigation for the Security page. From 1024px up it sticks under the
 * fixed header and marks the section in view (shared useActiveSection); below
 * that it is a static "On this page" index with large tap targets. Sections need a matching scroll margin (lg:!scroll-mt-[60px]:
 * the section's own top padding then clears the bar).
 */
export function SecuritySubNav({ items }: { items: { id: string; label: string }[] }) {
  const { active, select } = useActiveSection(items.map((it) => it.id));

  return (
    <nav aria-label="Security services" className="relative z-30 border-b border-line bg-ink-950/85 backdrop-blur-md lg:sticky lg:top-[72px]">
      <div className="container-site">
        <p className="pt-5 text-xs font-semibold uppercase tracking-[0.16em] text-muted lg:hidden">On this page</p>
        <ul className="grid grid-cols-2 gap-x-5 pb-4 pt-1 sm:grid-cols-3 lg:flex lg:items-center lg:justify-between lg:gap-x-2 lg:p-0">
          {items.map((it) => {
            const on = active === it.id;
            return (
              <li key={it.id}>
                <a
                  href={`#${it.id}`}
                  aria-current={on ? 'location' : undefined}
                  onClick={(e) => {
                    if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) select(it.id);
                  }}
                  className={`group relative flex min-h-[48px] items-center gap-2.5 py-2 text-[13.5px] font-medium transition-colors duration-300 lg:h-[54px] lg:min-h-0 lg:px-1 lg:py-0 ${
                    on ? 'text-text' : 'text-muted hover:text-text'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 shrink-0 rotate-45 transition-colors duration-300 ${on ? 'bg-cyan' : 'bg-electric/50 group-hover:bg-electric'}`}
                  />
                  {it.label}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-0 -bottom-px hidden h-px bg-gradient-to-r from-transparent via-cyan to-transparent transition-opacity duration-300 lg:block ${
                      on ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
