interface AvatarProps {
  width?: number;
  height?: number;
}

const Avatar3 = ({ width = 120, height = 120 }: AvatarProps) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Hood */}
    <path
      d="M36 50c0-14 11-26 24-26s24 12 24 26v4c0 2-1 3-2 3H38c-1 0-2-1-2-3v-4z"
      fill="#1F2937"
    />
    {/* Head */}
    <circle cx="60" cy="44" r="18" fill="#FCD34D" />
    {/* Hair (messy) */}
    <path d="M46 36c2-6 8-10 14-10s12 4 14 10" fill="#374151" />
    <path d="M48 34l-2-3M72 34l2-3M58 26v-3" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
    {/* Eyes (focused) */}
    <rect x="51" y="42" width="5" height="4" rx="2" fill="#1F2937" />
    <rect x="64" y="42" width="5" height="4" rx="2" fill="#1F2937" />
    {/* Smirk */}
    <path d="M56 52c1 2 7 2 8 0" stroke="#92400E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* Hoodie body */}
    <path
      d="M36 84c0-13 11-24 24-24s24 11 24 24v8H36V84z"
      fill="#1F2937"
    />
    {/* Hoodie pocket */}
    <path d="M46 82h28v8c0 2-2 3-4 3H50c-2 0-4-1-4-3v-8z" fill="#111827" />
    {/* Laptop */}
    <rect x="42" y="88" width="36" height="3" rx="1" fill="#6B7280" />
    <path d="M46 88v-10h28v10" fill="#374151" />
    {/* Screen glow */}
    <rect x="49" y="80" width="22" height="8" rx="1" fill="#34D399" opacity="0.6" />
    {/* Code lines on screen */}
    <line x1="51" y1="82" x2="59" y2="82" stroke="#ECFDF5" strokeWidth="1" />
    <line x1="51" y1="84" x2="65" y2="84" stroke="#ECFDF5" strokeWidth="1" />
    <line x1="51" y1="86" x2="62" y2="86" stroke="#ECFDF5" strokeWidth="1" />
  </svg>
);

export default Avatar3;
