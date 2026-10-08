import { BRAND } from '../data/site';

export function LogoMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      <path d="M16 2.8 27.4 9.4v13.2L16 29.2 4.6 22.6V9.4Z" fill="none" stroke="#3B82F6" strokeWidth="1.8" />
      <path d="M16 7.6 23.3 11.8v8.4L16 24.4l-7.3-4.2v-8.4Z" fill="none" stroke="#1EA7FF" strokeOpacity=".55" strokeWidth="1.2" />
      <path d="M16 12.2 19.3 14.1v3.8L16 19.8l-3.3-1.9v-3.8Z" fill="#39D7FF" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      <span className="text-[17px] font-semibold tracking-[-0.01em] text-text">{BRAND.name}</span>
    </span>
  );
}
