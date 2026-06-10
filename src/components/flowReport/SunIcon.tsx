interface SunIconProps {
  kind: 'rise' | 'set';
}

// Sun-on-horizon glyph with rays (no directional arrow), used for the
// sunrise/sunset hour markers and the report key.
export function SunIcon({ kind }: SunIconProps) {
  return (
    <svg
      className="fr-sun-ic"
      viewBox="0 0 24 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label={kind === 'rise' ? 'sunrise' : 'sunset'}
    >
      <line x1="2.5" y1="15" x2="21.5" y2="15" />
      <path d="M7 15 a5 5 0 0 1 10 0" />
      <line x1="12" y1="8.4" x2="12" y2="5.2" />
      <line x1="16.7" y1="10.3" x2="18.9" y2="8.1" />
      <line x1="7.3" y1="10.3" x2="5.1" y2="8.1" />
      <line x1="18.4" y1="12.9" x2="21.2" y2="11.9" />
      <line x1="5.6" y1="12.9" x2="2.8" y2="11.9" />
    </svg>
  );
}

export default SunIcon;
