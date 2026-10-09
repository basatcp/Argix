import { Icon } from '../Icons';
import { useConsultation } from '../consultation/ConsultationModal';

/**
 * Primary call to action: opens the consultation popup. `source` names the
 * placement for analytics (e.g. "services-hero"); focus returns here on close.
 */
export function ConsultButton({
  source,
  label = 'Book a Free Consultation',
  variant = 'primary',
  context,
  className = '',
}: {
  source: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'link';
  /** Visually hidden text after the label, for repeated buttons (e.g. "about Penetration Testing"). */
  context?: string;
  className?: string;
}) {
  const { openConsultation } = useConsultation();
  const style =
    variant === 'primary'
      ? 'btn-primary'
      : variant === 'secondary'
        ? 'btn-secondary'
        : 'group inline-flex items-center gap-1.5 rounded text-sm font-medium text-electric transition-colors hover:text-cyan';
  return (
    <button type="button" aria-haspopup="dialog" onClick={(e) => openConsultation(source, e.currentTarget)} className={`${style} ${className}`}>
      {label}
      {context && <span className="sr-only"> {context}</span>}
      <Icon name="arrowRight" className={`h-4 w-4 ${variant === 'link' ? 'transition-transform duration-300 group-hover:translate-x-1' : ''}`} />
    </button>
  );
}
