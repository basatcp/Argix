import type { ReactNode } from 'react';

export function SectionHeading({
  id,
  eyebrow,
  title,
  lead,
  align = 'center',
}: {
  id: string;
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: 'center' | 'left';
}) {
  const center = align === 'center';
  return (
    <div className={center ? 'mx-auto max-w-[760px] text-center' : 'max-w-[680px]'}>
      {eyebrow && (
        <p data-reveal className="eyebrow">
          {eyebrow}
        </p>
      )}
      <h2 id={id} data-reveal className="h-section mt-4">
        {title}
      </h2>
      {lead && (
        <p data-reveal className={`lead mt-5 ${center ? 'mx-auto max-w-[620px]' : ''}`}>
          {lead}
        </p>
      )}
    </div>
  );
}
