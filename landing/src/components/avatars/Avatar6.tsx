interface AvatarProps {
  width?: number;
  height?: number;
}

const Avatar6 = ({ width = 120, height = 120 }: AvatarProps) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Hijab */}
    <path
      d="M34 50c0-16 12-30 26-30s26 14 26 30v14c0 2-1 3-2 3H36c-1 0-2-1-2-3V50z"
      fill="#6366F1"
    />
    <path
      d="M38 50c0-13 10-24 22-24s22 11 22 24v6H38v-6z"
      fill="#818CF8"
    />
    {/* Face */}
    <ellipse cx="60" cy="50" rx="16" ry="17" fill="#FDE68A" />
    {/* Eyes */}
    <circle cx="54" cy="48" r="2.5" fill="#1F2937" />
    <circle cx="66" cy="48" r="2.5" fill="#1F2937" />
    {/* Eyelashes */}
    <path d="M51 45l-1-2M54 44v-2M57 45l1-2" stroke="#1F2937" strokeWidth="0.8" strokeLinecap="round" />
    <path d="M63 45l-1-2M66 44v-2M69 45l1-2" stroke="#1F2937" strokeWidth="0.8" strokeLinecap="round" />
    {/* Warm smile */}
    <path d="M55 56c2 3 8 3 10 0" stroke="#B45309" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* Hijab drape */}
    <path d="M34 60c-2 6-2 14 0 20l10 4v-24h-10z" fill="#6366F1" />
    <path d="M86 60c2 6 2 14 0 20l-10 4v-24h10z" fill="#6366F1" />
    {/* Body */}
    <path
      d="M40 90c0-8 9-16 20-16s20 8 20 16v4H40v-4z"
      fill="#6366F1"
    />
    {/* Notebook */}
    <rect x="46" y="86" width="16" height="12" rx="1" fill="#FEFCE8" stroke="#D1D5DB" strokeWidth="0.5" />
    <line x1="48" y1="90" x2="58" y2="90" stroke="#9CA3AF" strokeWidth="1" />
    <line x1="48" y1="93" x2="56" y2="93" stroke="#9CA3AF" strokeWidth="1" />
    <line x1="48" y1="96" x2="57" y2="96" stroke="#9CA3AF" strokeWidth="1" />
    {/* Pen */}
    <line x1="68" y1="82" x2="72" y2="96" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="68" cy="81" r="1.5" fill="#EF4444" />
  </svg>
);

export default Avatar6;
