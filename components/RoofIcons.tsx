type IconProps = { className?: string };

export function IconRoof({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M6 20 L20 8 L34 20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 20 V32 H30 V20" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M17 32 V24 H23 V32" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  );
}

export function IconRepair({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M14 28 L26 16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M24 14 L28 18 L22 24 L18 20 Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M12 30 H18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="13" cy="13" r="4.5" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  );
}

export function IconStorm({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M12 18 H26 A6 6 0 0 0 26 6 H24 A7 7 0 0 0 10 11 A5 5 0 0 0 12 18 Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M18 20 L15 27 H20 L17 34" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconSiding({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M8 10 H32" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M8 17 H32" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M8 24 H32" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M8 31 H32" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function IconGutter({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M8 12 H32 V18 H8 Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M28 18 V30" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M25 30 H31" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M12 18 V22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function IconInsulation({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect x="9" y="9" width="22" height="22" rx="3" stroke="currentColor" strokeWidth="2.2" />
      <path d="M9 16 C14 13, 18 19, 23 16 C27 13, 31 18, 31 16" stroke="currentColor" strokeWidth="2" />
      <path d="M9 23 C14 20, 18 26, 23 23 C27 20, 31 25, 31 23" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function IconShield({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M20 7 L30 11 V20 C30 27 25 31 20 33 C15 31 10 27 10 20 V11 Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M15 20 L18.5 23.5 L26 16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconCrew({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="14" r="5" stroke="currentColor" strokeWidth="2.2" />
      <path d="M10 30 C11 24 15 22 20 22 C25 22 29 24 30 30" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function IconMaterial({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M8 26 L20 10 L32 26 Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M14 26 H26" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M17 21 H23" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function IconClock({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="11" stroke="currentColor" strokeWidth="2.2" />
      <path d="M20 13 V21 L25 24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
