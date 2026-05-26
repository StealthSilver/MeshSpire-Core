interface AvatarProps {
  width?: number;
  height?: number;
}

const Avatar4 = ({ width = 120, height = 120 }: AvatarProps) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Beret */}
    <ellipse cx="60" cy="28" rx="18" ry="8" fill="#DC2626" />
    <circle cx="60" cy="26" r="3" fill="#DC2626" />
    {/* Head */}
    <circle cx="60" cy="44" r="20" fill="#FBBF24" />
    {/* Hair (wavy) */}
    <path
      d="M42 40c0-4 2-8 6-10s8-2 12-2 8 0 12 2 6 6 6 10"
      fill="#92400E"
    />
    <path d="M40 44c-2 4-2 10 0 14" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
    <path d="M80 44c2 4 2 10 0 14" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
    {/* Eyes */}
    <circle cx="53" cy="44" r="2.5" fill="#1F2937" />
    <circle cx="67" cy="44" r="2.5" fill="#1F2937" />
    {/* Blush */}
    <circle cx="48" cy="50" r="3" fill="#FCA5A5" opacity="0.5" />
    <circle cx="72" cy="50" r="3" fill="#FCA5A5" opacity="0.5" />
    {/* Smile */}
    <path d="M54 54c2 3 10 3 12 0" stroke="#B45309" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* Body (artistic smock) */}
    <path
      d="M38 84c0-12 10-22 22-22s22 10 22 22v8H38V84z"
      fill="#7C3AED"
    />
    {/* Paint palette */}
    <ellipse cx="48" cy="86" rx="10" ry="7" fill="#FDE68A" />
    <circle cx="44" cy="84" r="2" fill="#EF4444" />
    <circle cx="48" cy="82" r="2" fill="#3B82F6" />
    <circle cx="52" cy="84" r="2" fill="#10B981" />
    <circle cx="46" cy="88" r="2" fill="#F59E0B" />
    {/* Paintbrush */}
    <line x1="72" y1="74" x2="80" y2="90" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
    <path d="M70 72l4 4-2 2-4-4z" fill="#F59E0B" />
  </svg>
);

export default Avatar4;
