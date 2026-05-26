interface AvatarProps {
  width?: number;
  height?: number;
}

const Avatar5 = ({ width = 120, height = 120 }: AvatarProps) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Head */}
    <circle cx="60" cy="42" r="20" fill="#FCD34D" />
    {/* Short hair */}
    <path
      d="M40 38c0-12 9-20 20-20s20 8 20 20"
      fill="#1F2937"
    />
    {/* Eyes (determined) */}
    <rect x="51" y="40" width="6" height="3" rx="1.5" fill="#1F2937" />
    <rect x="63" y="40" width="6" height="3" rx="1.5" fill="#1F2937" />
    {/* Confident grin */}
    <path d="M53 50c3 4 11 4 14 0" stroke="#92400E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* Jersey body */}
    <path
      d="M36 82c0-13 11-24 24-24s24 11 24 24v10H36V82z"
      fill="#EF4444"
    />
    {/* Jersey number */}
    <text x="54" y="84" fontSize="14" fontWeight="bold" fill="#FFFFFF" fontFamily="sans-serif">7</text>
    {/* Jersey stripes */}
    <line x1="36" y1="72" x2="84" y2="72" stroke="#FFFFFF" strokeWidth="2" opacity="0.4" />
    <line x1="36" y1="76" x2="84" y2="76" stroke="#FFFFFF" strokeWidth="1" opacity="0.2" />
    {/* Medal */}
    <path d="M56 58l4-4 4 4" stroke="#FFA629" strokeWidth="1.5" fill="none" />
    <circle cx="60" cy="64" r="5" fill="#FFA629" />
    <text x="57" y="67" fontSize="6" fill="#FFFFFF" fontFamily="sans-serif">1</text>
    {/* Arms (athletic pose) */}
    <path d="M36 74l-6 8" stroke="#FCD34D" strokeWidth="4" strokeLinecap="round" />
    <path d="M84 74l6 8" stroke="#FCD34D" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export default Avatar5;
