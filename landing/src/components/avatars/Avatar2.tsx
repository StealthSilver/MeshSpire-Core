interface AvatarProps {
  width?: number;
  height?: number;
}

const Avatar2 = ({ width = 120, height = 120 }: AvatarProps) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Hair (ponytail) */}
    <path
      d="M60 20c-14 0-24 10-24 24v2c0 2 1 3 2 3h44c1 0 2-1 2-3v-2c0-14-10-24-24-24z"
      fill="#7C3AED"
    />
    <path d="M78 30c4 2 6 8 6 14l8-2c0-8-6-14-14-12z" fill="#7C3AED" />
    {/* Head */}
    <circle cx="60" cy="45" r="20" fill="#FDE68A" />
    {/* Eyes */}
    <circle cx="53" cy="44" r="2.5" fill="#1F2937" />
    <circle cx="67" cy="44" r="2.5" fill="#1F2937" />
    {/* Eyelashes */}
    <path d="M50 41l-2-2M53 40v-3M56 41l2-2" stroke="#1F2937" strokeWidth="1" strokeLinecap="round" />
    <path d="M64 41l-2-2M67 40v-3M70 41l2-2" stroke="#1F2937" strokeWidth="1" strokeLinecap="round" />
    {/* Smile */}
    <path d="M55 52c2 3 8 3 10 0" stroke="#B45309" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* Lab coat body */}
    <path
      d="M38 82c0-12 10-22 22-22s22 10 22 22v10H38V82z"
      fill="#F3F4F6"
    />
    {/* Lab coat lapels */}
    <path d="M54 60l-4 16h4l3-14z" fill="#E5E7EB" />
    <path d="M66 60l4 16h-4l-3-14z" fill="#E5E7EB" />
    {/* Test tube */}
    <rect x="70" y="72" width="6" height="18" rx="3" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1" />
    <rect x="70" y="82" width="6" height="8" rx="3" fill="#60A5FA" />
    {/* Pocket */}
    <rect x="44" y="76" width="10" height="8" rx="1" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="0.5" />
  </svg>
);

export default Avatar2;
