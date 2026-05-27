type SectionSkeletonProps = {
  minHeight?: string;
  className?: string;
};

export default function SectionSkeleton({
  minHeight = "24rem",
  className = "",
}: SectionSkeletonProps) {
  return (
    <div
      aria-hidden
      className={`w-full bg-[var(--background)] ${className}`}
      style={{ minHeight }}
    />
  );
}
