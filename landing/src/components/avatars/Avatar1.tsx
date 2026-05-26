interface AvatarProps {
  width?: number;
  height?: number;
}

const Avatar1 = ({ width = 120, height = 120 }: AvatarProps) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Head */}
    <circle cx="60" cy="45" r="22" fill="#FBBF24" />
    {/* Hair */}
    <path
      d="M38 40c0-12 10-22 22-22s22 10 22 22"
      fill="#92400E"
    />
    {/* Glasses */}
    <circle cx="52" cy="46" r="7" stroke="#374151" strokeWidth="2" fill="none" />
    <circle cx="68" cy="46" r="7" stroke="#374151" strokeWidth="2" fill="none" />
    <line x1="59" y1="46" x2="61" y2="46" stroke="#374151" strokeWidth="2" />
    {/* Eyes */}
    <circle cx="52" cy="46" r="2.5" fill="#1F2937" />
    <circle cx="68" cy="46" r="2.5" fill="#1F2937" />
    {/* Smile */}
    <path d="M54 54c2 3 10 3 12 0" stroke="#92400E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* Body */}
    <path
      d="M40 80c0-11 9-20 20-20s20 9 20 20v12H40V80z"
      fill="#3B82F6"
    />
    {/* Book */}
    <rect x="45" y="78" width="30" height="20" rx="2" fill="#FEFCE8" />
    <line x1="60" y1="78" x2="60" y2="98" stroke="#D1D5DB" strokeWidth="1" />
    <line x1="49" y1="84" x2="57" y2="84" stroke="#9CA3AF" strokeWidth="1" />
    <line x1="49" y1="88" x2="56" y2="88" stroke="#9CA3AF" strokeWidth="1" />
    <line x1="63" y1="84" x2="71" y2="84" stroke="#9CA3AF" strokeWidth="1" />
    <line x1="63" y1="88" x2="70" y2="88" stroke="#9CA3AF" strokeWidth="1" />
  </svg>
);

export default Avatar1;
