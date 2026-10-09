import { ROUTES } from '../data/routes';
import { Icon } from '../components/Icons';
import { PageHero } from '../components/page/PageHero';

const LINKS = ROUTES.filter((r) => r.key !== 'home');

export function NotFoundPage() {
  return (
    <PageHero
      id="not-found-title"
      crumb="Page not found"
      eyebrow="404"
      title="This Page Doesn’t Exist"
      lead="The link may be out of date, or the page may have moved. Start from the homepage or one of the main sections."
      variant="page-calm"
      primary={null}
      secondary={{ label: 'Back to Home', href: '/' }}
      aside={
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {LINKS.map((r) => (
            <li key={r.key}>
              <a
                href={r.path}
                className="card group flex items-center justify-between gap-4 px-5 py-4 text-[15px] font-medium text-text transition-colors duration-300 hover:border-electric/45"
              >
                {r.label}
                <Icon name="arrowRight" className="h-4 w-4 text-electric transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </li>
          ))}
        </ul>
      }
    />
  );
}
