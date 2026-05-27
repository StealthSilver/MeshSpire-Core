"use client";

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useIsDark } from "@/hooks/useIsDark";

const ORANGE = "#FFA629";
const BLUE = "#809FFF";
const PURPLE = "#8B5CF6";
const GREEN = "#7DD3A0";
const ROSE = "#F472B6";

/* ─── Matching Illustration ─── */

const MeshSpireLogogram = ({ centerFill }: { centerFill: string }) => (
  <g transform="translate(100, 60) scale(0.52) translate(-31.65, -20.27)">
    <path
      d="M40.1509 20.27C40.1509 31.3157 31.1966 40.27 20.1509 40.27C9.10524 40.27 0.150879 31.3157 0.150879 20.27C0.150879 9.2243 9.10524 0.269989 20.1509 0.269989C31.1966 0.269989 40.1509 9.2243 40.1509 20.27Z"
      fill={ORANGE}
    />
    <path
      d="M63.1509 20.27C63.1509 31.3157 54.1964 40.27 43.1508 40.27C32.1052 40.27 23.1509 31.3157 23.1509 20.27C23.1509 9.2243 32.1052 0.269989 43.1508 0.269989C54.1964 0.269989 63.1509 9.2243 63.1509 20.27Z"
      fill={BLUE}
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M31.6509 36.6351C36.792 33.0157 40.1509 27.0351 40.1509 20.27C40.1509 13.5049 36.792 7.52425 31.6509 3.90488C26.5098 7.52425 23.1509 13.5049 23.1509 20.27C23.1509 27.0351 26.5098 33.0157 31.6509 36.6351Z"
      fill={centerFill}
    />
  </g>
);

const StudentCard = ({
  x,
  y,
  textColor,
  muted,
  cardFill,
  cardStroke,
}: {
  x: number;
  y: number;
  textColor: string;
  muted: string;
  cardFill: string;
  cardStroke: string;
}) => {
  const w = 56;
  const h = 40;
  const padX = 8;
  const padY = 11;
  const barH = 2.4;
  const bars = [{ w: 34 }, { w: 24 }, { w: 14 }];

  return (
    <g filter="url(#match-card-shadow)">
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="8"
        fill={cardFill}
        stroke={cardStroke}
        strokeWidth="0.6"
      />
      <text
        x={x + padX}
        y={y + padY + 4}
        textAnchor="start"
        dominantBaseline="middle"
        fontSize="5.5"
        fontWeight="700"
        fill={textColor}
        letterSpacing="0.5"
        fontFamily="var(--font-inter, Inter), sans-serif"
      >
        STUDENT
      </text>
      {bars.map((bar, i) => (
        <rect
          key={i}
          x={x + padX}
          y={y + padY + 12 + i * 5.5}
          width={bar.w}
          height={barH}
          rx={barH / 2}
          fill={muted}
        />
      ))}
    </g>
  );
};

const MatchingAnimatedPath = ({
  d,
  color,
  trackColor,
  index,
}: {
  d: string;
  color: string;
  trackColor: string;
  index: number;
}) => {
  const dashDur = `${3.6 + index * 0.45}s`;
  const motionDur = `${4.2 + index * 0.5}s`;

  return (
    <g>
      <path d={d} fill="none" stroke={trackColor} strokeWidth="0.6" strokeLinecap="round" />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray="4 4"
        opacity={0.72}
      >
        <animate
          attributeName="stroke-dashoffset"
          values="0;-16"
          dur={dashDur}
          repeatCount="indefinite"
        />
      </path>
      <circle r="2" fill={color} opacity={0.92}>
        <animateMotion dur={motionDur} repeatCount="indefinite" path={d} />
      </circle>
      <circle r="2.5" fill={color} opacity="0">
        <animate attributeName="opacity" values="0.28;0;0.28" dur="2s" repeatCount="indefinite" />
        <animate attributeName="r" values="1.5;4;1.5" dur="2s" repeatCount="indefinite" />
        <animateMotion dur={motionDur} repeatCount="indefinite" path={d} />
      </circle>
    </g>
  );
};

const TutorCard = ({
  x,
  y,
  badge,
  badgeColor,
  isDark,
  muted,
  cardFill,
  cardStroke,
}: {
  x: number;
  y: number;
  badge: string;
  badgeColor: string;
  isDark: boolean;
  muted: string;
  cardFill: string;
  cardStroke: string;
}) => {
  const w = 44;
  const h = 30;
  const fold = 7;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="3"
        fill={cardFill}
        stroke={cardStroke}
        strokeWidth="0.6"
      />
      <path
        d={`M${x + w - fold} ${y} L${x + w} ${y} L${x + w} ${y + fold} Z`}
        fill={isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}
        stroke={cardStroke}
        strokeWidth="0.4"
      />
      <circle cx={x + 9} cy={y + 11} r="4" fill={`${badgeColor}${isDark ? "18" : "12"}`} stroke={badgeColor} strokeWidth="0.5" opacity="0.85" />
      <circle cx={x + 9} cy={y + 11} r="1.8" fill={badgeColor} opacity="0.55" />
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1={x + 17}
          y1={y + 7 + i * 4.5}
          x2={x + w - 5 - i * 2}
          y2={y + 7 + i * 4.5}
          stroke={muted}
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="2,1.5"
        />
      ))}
      <rect x={x + w - 18} y={y + h - 9} width="16" height="7" rx="1.5" fill={badgeColor} />
      <text
        x={x + w - 10}
        y={y + h - 4.5}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="4.5"
        fontWeight="600"
        fill="#F8FAFC"
        letterSpacing="0.3"
      >
        {badge}
      </text>
    </g>
  );
};

const MatchingIllustration = ({ isDark }: { isDark: boolean }) => {
  const muted = isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.12)";
  const cardFill = isDark ? "#12151A" : "#FFFFFF";
  const cardStroke = isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)";
  const textColor = isDark ? "#F5F7FA" : "#0F172A";
  const logogramCenter = isDark ? "#F8FAFC" : "#0F172A";

  const hub = { x: 100, y: 60 };
  const studentCardW = 56;
  const studentCardH = 40;
  const studentCard = { x: 8, y: hub.y - studentCardH / 2, w: studentCardW, h: studentCardH };
  const studentRight = studentCard.x + studentCard.w;
  const hubInset = 16;
  const tutorLeft = 148;
  const studentPath = `M ${studentRight} ${hub.y} L ${hub.x - hubInset} ${hub.y}`;
  const tutors = [
    { y: 8, badge: "Math", color: ORANGE, path: `M ${hub.x + 14} ${hub.y} C ${hub.x + 30} ${hub.y - 8}, ${tutorLeft - 20} 22, ${tutorLeft} 23` },
    { y: 45, badge: "Chem", color: BLUE, path: `M ${hub.x + 14} ${hub.y} L ${tutorLeft} ${hub.y}` },
    { y: 82, badge: "Bio", color: GREEN, path: `M ${hub.x + 14} ${hub.y} C ${hub.x + 30} ${hub.y + 8}, ${tutorLeft - 20} 98, ${tutorLeft} 97` },
  ];
  const lineMuted = isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)";

  return (
    <svg viewBox="0 0 200 120" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="match-card-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor={isDark ? "#000" : "#0F172A"} floodOpacity={isDark ? 0.35 : 0.08} />
        </filter>
      </defs>

      {/* Animated connection paths */}
      <MatchingAnimatedPath d={studentPath} color={ORANGE} trackColor={lineMuted} index={0} />
      {tutors.map((t, i) => (
        <MatchingAnimatedPath key={`conn-${i}`} d={t.path} color={t.color} trackColor={lineMuted} index={i + 1} />
      ))}

      {/* Student card */}
      <StudentCard
        x={studentCard.x}
        y={studentCard.y}
        textColor={textColor}
        muted={muted}
        cardFill={cardFill}
        cardStroke={cardStroke}
      />

      {/* MeshSpire logogram — theme-aware, no hub background */}
      <MeshSpireLogogram centerFill={logogramCenter} />

      {/* Tutor cards */}
      {tutors.map((t, i) => (
        <g key={`tutor-${i}`} filter="url(#match-card-shadow)">
          <TutorCard
            x={tutorLeft}
            y={t.y}
            badge={t.badge}
            badgeColor={t.color}
            isDark={isDark}
            muted={muted}
            cardFill={cardFill}
            cardStroke={cardStroke}
          />
        </g>
      ))}
    </svg>
  );
};

/* ─── Schedule Illustration (today view with draggable lessons) ─── */

type ScheduleLesson = {
  id: string;
  title: string;
  time: string;
  theme: "blue" | "purple" | "green";
};

const SCHEDULE_LESSONS: ScheduleLesson[] = [
  { id: "math", title: "Math Lesson", time: "09:00 - 09:30", theme: "blue" },
  { id: "chem", title: "Chemistry", time: "11:00 - 12:00", theme: "green" },
  { id: "english", title: "English Lesson", time: "14:00 - 15:00", theme: "purple" },
];

const SCHEDULE_CARD_HEIGHT = 38;
const SCHEDULE_CARD_GAP = 5;
const SCHEDULE_STEP = SCHEDULE_CARD_HEIGHT + SCHEDULE_CARD_GAP;

const scheduleThemeStyles = (theme: ScheduleLesson["theme"], isDark: boolean) => {
  if (isDark) {
    const dark = {
      blue: {
        bg: "rgba(59,130,246,0.14)",
        border: "rgba(96,165,250,0.28)",
        accent: "#60A5FA",
        title: "#93C5FD",
        time: "rgba(147,197,253,0.72)",
      },
      purple: {
        bg: "rgba(139,92,246,0.14)",
        border: "rgba(167,139,250,0.28)",
        accent: "#A78BFA",
        title: "#C4B5FD",
        time: "rgba(196,181,253,0.72)",
      },
      green: {
        bg: "rgba(16,185,129,0.14)",
        border: "rgba(52,211,153,0.28)",
        accent: "#34D399",
        title: "#6EE7B7",
        time: "rgba(110,231,183,0.72)",
      },
    };
    return dark[theme];
  }

  const light = {
    blue: {
      bg: "#EEF4FF",
      border: "#BFDBFE",
      accent: "#3B82F6",
      title: "#2563EB",
      time: "#60A5FA",
    },
    purple: {
      bg: "#F5F3FF",
      border: "#DDD6FE",
      accent: "#8B5CF6",
      title: "#7C3AED",
      time: "#A78BFA",
    },
    green: {
      bg: "#ECFDF5",
      border: "#A7F3D0",
      accent: "#10B981",
      title: "#059669",
      time: "#34D399",
    },
  };
  return light[theme];
};

const ScheduleIllustration = ({ isDark }: { isDark: boolean }) => {
  const [order, setOrder] = useState(() => SCHEDULE_LESSONS.map((lesson) => lesson.id));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [offsetY, setOffsetY] = useState(0);
  const dragStartY = useRef(0);

  const lessonsById = useMemo(
    () => Object.fromEntries(SCHEDULE_LESSONS.map((lesson) => [lesson.id, lesson])),
    []
  );

  const todayLabel = useMemo(() => {
    const now = new Date();
    return {
      weekday: now.toLocaleDateString("en-US", { weekday: "long" }),
      date: now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    };
  }, []);

  const activeIndex = activeId ? order.indexOf(activeId) : -1;
  const targetIndex =
    activeIndex >= 0
      ? Math.max(0, Math.min(order.length - 1, Math.round(activeIndex + offsetY / SCHEDULE_STEP)))
      : -1;

  const getVisualIndex = (index: number) => {
    if (activeIndex < 0 || targetIndex < 0) return index;
    if (index === activeIndex) return targetIndex;
    if (activeIndex < targetIndex && index > activeIndex && index <= targetIndex) return index - 1;
    if (activeIndex > targetIndex && index >= targetIndex && index < activeIndex) return index + 1;
    return index;
  };

  const finishDrag = useCallback(() => {
    if (activeId && activeIndex >= 0 && targetIndex >= 0 && activeIndex !== targetIndex) {
      setOrder((prev) => {
        const next = [...prev];
        const [moved] = next.splice(activeIndex, 1);
        next.splice(targetIndex, 0, moved);
        return next;
      });
    }
    setActiveId(null);
    setOffsetY(0);
  }, [activeId, activeIndex, targetIndex]);

  useEffect(() => {
    if (!activeId) return;

    const onPointerMove = (e: PointerEvent) => {
      setOffsetY(e.clientY - dragStartY.current);
    };

    const onPointerUp = () => finishDrag();

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [activeId, finishDrag]);

  const listHeight = order.length * SCHEDULE_CARD_HEIGHT + (order.length - 1) * SCHEDULE_CARD_GAP;

  return (
    <div
      className={`w-full max-w-[188px] mx-auto rounded-[10px] border px-[12px] pt-[10px] pb-[10px] select-none touch-none ${
        isDark
          ? "border-white/[0.1] bg-[#12151A] shadow-[0_1px_2px_rgba(0,0,0,0.35),0_8px_24px_rgba(0,0,0,0.28)]"
          : "border-[#E2E8F0] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_8px_24px_rgba(15,23,42,0.08)]"
      }`}
    >
      <div className="mb-[8px] flex items-baseline justify-between gap-2">
        <p className="font-[var(--font-secondary)] text-[10px] leading-none">
          <span className={isDark ? "text-[#94A3B8]" : "text-[#64748B]"}>Today, </span>
          <span className={`font-semibold ${isDark ? "text-[#F5F7FA]" : "text-[#0F172A]"}`}>
            {todayLabel.weekday}
          </span>
        </p>
        <span
          className={`font-[var(--font-secondary)] text-[9px] leading-none ${
            isDark ? "text-[#64748B]" : "text-[#94A3B8]"
          }`}
        >
          {todayLabel.date}
        </span>
      </div>

      <div className="relative" style={{ height: listHeight }}>
        {order.map((id, index) => {
          const lesson = lessonsById[id];
          const theme = scheduleThemeStyles(lesson.theme, isDark);
          const isDragging = activeId === id;
          const visualIndex = getVisualIndex(index);
          const translateY = visualIndex * SCHEDULE_STEP + (isDragging ? offsetY : 0);

          return (
            <div
              key={id}
              role="button"
              tabIndex={0}
              aria-grabbed={isDragging}
              aria-label={`Reorder ${lesson.title}`}
              className={`absolute left-0 right-0 flex items-stretch overflow-hidden rounded-[8px] border cursor-grab active:cursor-grabbing ${
                isDragging ? "shadow-[0_8px_20px_rgba(15,23,42,0.12)]" : ""
              }`}
              style={{
                height: SCHEDULE_CARD_HEIGHT,
                transform: `translateY(${translateY}px)`,
                transition: isDragging ? "none" : "transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
                zIndex: isDragging ? 20 : 1,
                backgroundColor: theme.bg,
                borderColor: theme.border,
              }}
              onPointerDown={(e) => {
                e.preventDefault();
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                dragStartY.current = e.clientY;
                setActiveId(id);
                setOffsetY(0);
              }}
              onKeyDown={(e) => {
                if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
                e.preventDefault();
                const currentIndex = order.indexOf(id);
                const nextIndex = e.key === "ArrowUp" ? currentIndex - 1 : currentIndex + 1;
                if (nextIndex < 0 || nextIndex >= order.length) return;
                setOrder((prev) => {
                  const next = [...prev];
                  const [moved] = next.splice(currentIndex, 1);
                  next.splice(nextIndex, 0, moved);
                  return next;
                });
              }}
            >
              <div
                className="my-[7px] ml-[8px] w-[2.5px] shrink-0 rounded-full"
                style={{ backgroundColor: theme.accent }}
              />
              <div className="flex min-w-0 flex-col justify-center py-[6px] pl-[7px] pr-[8px]">
                <span
                  className="truncate font-[var(--font-secondary)] text-[10px] font-semibold leading-[1.15]"
                  style={{ color: theme.title }}
                >
                  {lesson.title}
                </span>
                <span
                  className="mt-[2px] font-[var(--font-secondary)] text-[9px] font-normal leading-none"
                  style={{ color: theme.time }}
                >
                  {lesson.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Progress Illustration ─── */

type ChartPoint = { x: number; y: number };

type GrowthSeries = {
  id: string;
  label: string;
  color: string;
  start: number;
  mid: number;
  end: number;
  steepness: number;
  shift: number;
};

const GROWTH_SERIES: GrowthSeries[] = [
  { id: "math", label: "Math", color: ORANGE, start: 0.1, mid: 0.48, end: 0.9, steepness: 9.5, shift: 0 },
  { id: "chem", label: "Chem", color: BLUE, start: 0.06, mid: 0.44, end: 0.94, steepness: 10.5, shift: 0.03 },
  { id: "phys", label: "Physics", color: PURPLE, start: 0.14, mid: 0.5, end: 0.86, steepness: 9, shift: 0.02 },
  { id: "bio", label: "Bio", color: GREEN, start: 0.12, mid: 0.46, end: 0.88, steepness: 9.2, shift: 0.05 },
  { id: "eng", label: "English", color: PURPLE, start: 0.16, mid: 0.52, end: 0.82, steepness: 8.5, shift: 0.01 },
  { id: "hist", label: "History", color: ROSE, start: 0.18, mid: 0.54, end: 0.8, steepness: 8, shift: 0.06 },
];

const CHART = { left: 18, right: 302, top: 26, bottom: 126 };
const POINT_COUNT = 28;

const sigmoidValue = (t: number, s: GrowthSeries) => {
  const shifted = Math.min(1, Math.max(0, t - s.shift));
  const raw = s.start + (s.end - s.start) / (1 + Math.exp(-s.steepness * (shifted - s.mid)));
  return Math.min(1, Math.max(0, raw));
};

const seriesPoints = (s: GrowthSeries): ChartPoint[] => {
  const { left, right, top, bottom } = CHART;
  const w = right - left;
  const h = bottom - top;
  return Array.from({ length: POINT_COUNT }, (_, i) => {
    const t = i / (POINT_COUNT - 1);
    const v = sigmoidValue(t, s);
    return { x: left + t * w, y: bottom - v * h };
  });
};

const smoothPath = (pts: ChartPoint[]) => {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cpx1 = prev.x + (curr.x - prev.x) * 0.45;
    const cpx2 = curr.x - (curr.x - prev.x) * 0.45;
    d += ` C ${cpx1} ${prev.y}, ${cpx2} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
};

const SESSION_BAR_HEIGHTS = [0.22, 0.35, 0.28, 0.48, 0.55, 0.42, 0.62, 0.7, 0.58, 0.75, 0.68, 0.82];

const ProgressIllustration = ({ isDark }: { isDark: boolean }) => {
  const uid = useId().replace(/:/g, "");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set());

  const gridStroke = isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)";
  const headerColor = isDark ? "rgba(245,247,250,0.45)" : "rgba(15,23,42,0.45)";
  const legendMuted = isDark ? "rgba(245,247,250,0.35)" : "rgba(15,23,42,0.4)";
  const tooltipBg = isDark ? "#1A1F26" : "#FFFFFF";
  const tooltipStroke = isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)";
  const dotFill = isDark ? "#0A0C0F" : "#F8FAFC";
  const areaAccent = BLUE;

  const seriesData = useMemo(
    () =>
      GROWTH_SERIES.map((s) => ({
        ...s,
        points: seriesPoints(s),
        path: smoothPath(seriesPoints(s)),
        score: Math.round(sigmoidValue(1, s) * 100),
      })),
    [],
  );

  const visibleSeries = seriesData.filter((s) => !hiddenIds.has(s.id));
  const avgScore =
    visibleSeries.length > 0
      ? Math.round(visibleSeries.reduce((sum, s) => sum + s.score, 0) / visibleSeries.length)
      : 0;

  const envelopePath = useMemo(() => {
    if (visibleSeries.length === 0) return "";
    const maxPts: ChartPoint[] = [];
    for (let i = 0; i < POINT_COUNT; i++) {
      const ys = visibleSeries.map((s) => s.points[i].y);
      maxPts.push({ x: visibleSeries[0].points[i].x, y: Math.min(...ys) });
    }
    const mid = Math.floor(POINT_COUNT * 0.42);
    const slice = maxPts.slice(mid);
    const line = smoothPath(slice);
    const last = slice[slice.length - 1];
    const first = slice[0];
    return `${line} L ${last.x} ${CHART.bottom} L ${first.x} ${CHART.bottom} Z`;
  }, [visibleSeries]);

  const activeId = hoveredId && !hiddenIds.has(hoveredId) ? hoveredId : null;
  const activeSeries = activeId ? seriesData.find((s) => s.id === activeId) : null;

  const toggleSeries = (id: string) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (hoveredId === id) setHoveredId(null);
  };

  const barCount = SESSION_BAR_HEIGHTS.length;
  const barWidth = (CHART.right - CHART.left) / barCount;

  return (
    <svg
      viewBox="0 0 320 155"
      className="w-full h-full select-none"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Student progress chart across six subjects"
    >
      <defs>
        <linearGradient id={`${uid}-area`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={areaAccent} stopOpacity={isDark ? 0.16 : 0.14} />
          <stop offset="100%" stopColor={areaAccent} stopOpacity="0" />
        </linearGradient>
      </defs>

      <text
        x="160"
        y="18"
        textAnchor="middle"
        fontSize="9"
        fontWeight="500"
        fill={headerColor}
        fontFamily="var(--font-secondary), system-ui, sans-serif"
        letterSpacing="0.02em"
      >
        {visibleSeries.length} subjects tracked · Avg score {avgScore}%
      </text>

      {Array.from({ length: 7 }, (_, i) => {
        const x = CHART.left + (i / 6) * (CHART.right - CHART.left);
        return (
          <line key={`v-${i}`} x1={x} y1={CHART.top} x2={x} y2={CHART.bottom} stroke={gridStroke} strokeWidth="0.6" />
        );
      })}

      {SESSION_BAR_HEIGHTS.map((h, i) => {
        const barH = h * (CHART.bottom - CHART.top) * 0.55;
        const x = CHART.left + i * barWidth + barWidth * 0.2;
        const w = barWidth * 0.55;
        return (
          <rect
            key={`bar-${i}`}
            x={x}
            y={CHART.bottom - barH}
            width={w}
            height={barH}
            rx="1.5"
            fill={areaAccent}
            opacity={isDark ? 0.08 : 0.11}
          />
        );
      })}

      {envelopePath && <path d={envelopePath} fill={`url(#${uid}-area)`} />}

      {seriesData.map((s) => {
        if (hiddenIds.has(s.id)) return null;
        const isActive = activeId === null || activeId === s.id;
        const opacity = isActive ? (activeId === s.id ? 1 : 0.72) : 0.18;
        const last = s.points[s.points.length - 1];

        return (
          <g key={s.id} opacity={opacity} style={{ transition: "opacity 0.2s ease" }}>
            <path
              d={s.path}
              fill="none"
              stroke={s.color}
              strokeWidth={activeId === s.id ? 2.2 : 1.65}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transition: "stroke-width 0.2s ease" }}
            />
            <circle
              cx={last.x}
              cy={last.y}
              r={activeId === s.id ? 3.2 : 2.4}
              fill={dotFill}
              stroke={s.color}
              strokeWidth={activeId === s.id ? 1.4 : 1}
            />
            <path
              d={s.path}
              fill="none"
              stroke="transparent"
              strokeWidth="14"
              strokeLinecap="round"
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHoveredId(s.id)}
              onMouseLeave={() => setHoveredId(null)}
            />
          </g>
        );
      })}

      {activeSeries && (() => {
        const last = activeSeries.points[activeSeries.points.length - 1];
        const tipW = 52;
        const tipH = 22;
        const tipX = Math.min(last.x - tipW - 6, CHART.right - tipW - 4);
        const tipY = Math.max(last.y - tipH - 8, CHART.top + 2);
        return (
          <g pointerEvents="none">
            <rect
              x={tipX}
              y={tipY}
              width={tipW}
              height={tipH}
              rx="4"
              fill={tooltipBg}
              stroke={tooltipStroke}
              strokeWidth="0.6"
            />
            <text
              x={tipX + tipW / 2}
              y={tipY + 9}
              textAnchor="middle"
              fontSize="7"
              fontWeight="600"
              fill={activeSeries.color}
              fontFamily="system-ui, sans-serif"
            >
              {activeSeries.label}
            </text>
            <text
              x={tipX + tipW / 2}
              y={tipY + 17}
              textAnchor="middle"
              fontSize="6.5"
              fill={headerColor}
              fontFamily="system-ui, sans-serif"
            >
              {activeSeries.score}% mastery
            </text>
          </g>
        );
      })()}

      <g transform="translate(0, 132)">
        {seriesData.map((s, i) => {
          const isHidden = hiddenIds.has(s.id);
          const isHovered = hoveredId === s.id;
          const x = 12 + i * 52;
          return (
            <g
              key={`leg-${s.id}`}
              transform={`translate(${x}, 0)`}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHoveredId(s.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => toggleSeries(s.id)}
              role="button"
              tabIndex={0}
              aria-pressed={!isHidden}
              aria-label={`${s.label}, ${s.score} percent. Click to ${isHidden ? "show" : "hide"}.`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleSeries(s.id);
                }
              }}
            >
              <rect
                x={0}
                y={5}
                width={14}
                height={3}
                rx="1.5"
                fill={s.color}
                opacity={isHidden ? 0.25 : isHovered ? 1 : 0.85}
              />
              <text
                x={18}
                y={9}
                fontSize="7"
                fontWeight={isHovered ? "600" : "500"}
                fill={isHidden ? legendMuted : isHovered ? (isDark ? "#F5F7FA" : "#0F172A") : legendMuted}
                fontFamily="var(--font-secondary), system-ui, sans-serif"
              >
                {s.label}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
};

/* ─── Subjects Illustration ─── */

const SubjectIcon = ({ type, color }: { type: string; color: string }) => {
  const sw = 0.75;
  switch (type) {
    case "math":
      return (
        <text x="0" y="0.5" textAnchor="middle" dominantBaseline="middle" fontSize="7" fontWeight="600" fill={color} opacity="0.9">
          π
        </text>
      );
    case "science":
      return (
        <g stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round" opacity="0.85">
          <path d="M-3.5,-2.5 L3.5,-2.5 L4.5,4 L-4.5,4 Z" />
          <line x1="-1.5" y1="-2.5" x2="-2.5" y2="-5" />
          <line x1="1.5" y1="-2.5" x2="2.5" y2="-5" />
        </g>
      );
    case "english":
      return (
        <g stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round" opacity="0.85">
          <path d="M-4,0 L0,-4 L4,0 L4,4.5 L-4,4.5 Z" />
          <line x1="0" y1="-4" x2="0" y2="4.5" />
        </g>
      );
    case "history":
      return (
        <g stroke={color} strokeWidth={sw} fill="none" opacity="0.85">
          <circle cx="0" cy="0" r="4.5" />
          <ellipse cx="0" cy="0" rx="4.5" ry="1.6" />
          <line x1="0" y1="-4.5" x2="0" y2="4.5" />
        </g>
      );
    case "art":
      return (
        <g stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round" opacity="0.85">
          <path d="M-4,3.5 Q-4,-3 0,-3 Q4,-3 4,3.5" />
          <circle cx="-2" cy="0" r="0.9" fill={ORANGE} stroke="none" />
          <circle cx="0.5" cy="-1" r="0.9" fill={BLUE} stroke="none" />
          <circle cx="2.5" cy="1" r="0.9" fill={GREEN} stroke="none" />
        </g>
      );
    default:
      return null;
  }
};

const SubjectCard = ({
  x,
  y,
  rotate,
  label,
  badge,
  color,
  icon,
  cardFill,
  cardStroke,
  textColor,
  muted,
  isDark,
}: {
  x: number;
  y: number;
  rotate: number;
  label: string;
  badge: string;
  color: string;
  icon: string;
  cardFill: string;
  cardStroke: string;
  textColor: string;
  muted: string;
  isDark: boolean;
}) => {
  const w = 40;
  const h = 56;
  const fold = 6;
  const headerH = 14;
  const tint = `${color}${isDark ? "22" : "18"}`;

  return (
    <g transform={`translate(${x + w / 2}, ${y + h / 2}) rotate(${rotate}) translate(${-w / 2}, ${-h / 2})`}>
      <rect x={0} y={0} width={w} height={h} rx="3" fill={cardFill} stroke={cardStroke} strokeWidth="0.6" />
      <path
        d={`M${w - fold} 0 L${w} 0 L${w} ${fold} Z`}
        fill={isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}
        stroke={cardStroke}
        strokeWidth="0.4"
      />
      <rect x={0.5} y={0.5} width={w - 1} height={headerH} rx="2.5" fill={tint} />
      <g transform={`translate(9, ${headerH / 2 + 0.5})`}>
        <circle cx={0} cy={0} r="4.5" fill={`${color}${isDark ? "20" : "14"}`} stroke={color} strokeWidth="0.45" opacity="0.9" />
        <g transform="translate(0, 0)">
          <SubjectIcon type={icon} color={color} />
        </g>
      </g>
      <text
        x={18}
        y={headerH / 2 + 1}
        fontSize={label.length > 6 ? "5" : "5.5"}
        fontWeight="600"
        fill={textColor}
        fontFamily="var(--font-secondary), system-ui, sans-serif"
        letterSpacing="0.1"
      >
        {label}
      </text>
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1={8}
          y1={headerH + 6 + i * 5}
          x2={w - 7 - i * 2}
          y2={headerH + 6 + i * 5}
          stroke={muted}
          strokeWidth="1"
          strokeLinecap="round"
          strokeDasharray="2,1.5"
        />
      ))}
      <rect x={w - 20} y={h - 10} width={17} height={7} rx="1.5" fill={color} opacity={isDark ? 0.85 : 0.9} />
      <text
        x={w - 11.5}
        y={h - 6.5}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="4.5"
        fontWeight="600"
        fill="#F8FAFC"
        fontFamily="var(--font-secondary), system-ui, sans-serif"
        letterSpacing="0.2"
      >
        {badge}
      </text>
    </g>
  );
};

const SubjectsIllustration = ({ isDark }: { isDark: boolean }) => {
  const uid = useId().replace(/:/g, "");
  const muted = isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.12)";
  const cardFill = isDark ? "#12151A" : "#FFFFFF";
  const cardStroke = isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)";
  const textColor = isDark ? "#F5F7FA" : "#0F172A";

  const subjects = [
    { x: 34, y: 32, rotate: -6, label: "Math", badge: "Math", color: ORANGE, icon: "math" },
    { x: 48, y: 28, rotate: -3, label: "Science", badge: "Sci", color: BLUE, icon: "science" },
    { x: 62, y: 24, rotate: 0, label: "English", badge: "Eng", color: PURPLE, icon: "english" },
    { x: 76, y: 28, rotate: 3, label: "History", badge: "Hist", color: GREEN, icon: "history" },
    { x: 90, y: 32, rotate: 6, label: "Art", badge: "Art", color: ROSE, icon: "art" },
  ];

  return (
    <svg viewBox="0 0 200 120" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id={`${uid}-shadow`} x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow
            dx="0"
            dy="1"
            stdDeviation="1.5"
            floodColor={isDark ? "#000" : "#0F172A"}
            floodOpacity={isDark ? 0.35 : 0.08}
          />
        </filter>
      </defs>

      <g filter={`url(#${uid}-shadow)`} transform="translate(100, 62) rotate(5) translate(-82, -40)">
        {subjects.map((s) => (
          <SubjectCard
            key={s.label}
            x={s.x}
            y={s.y}
            rotate={s.rotate}
            label={s.label}
            badge={s.badge}
            color={s.color}
            icon={s.icon}
            cardFill={cardFill}
            cardStroke={cardStroke}
            textColor={textColor}
            muted={muted}
            isDark={isDark}
          />
        ))}
      </g>
    </svg>
  );
};

/* ─── Verified Tutors Illustration (document scan) ─── */

const ScanCornerBracket = ({
  x,
  y,
  corner,
  stroke,
}: {
  x: number;
  y: number;
  corner: "tl" | "tr" | "bl" | "br";
  stroke: string;
}) => {
  const len = 11;
  const paths = {
    tl: `M ${x + len} ${y} L ${x} ${y} L ${x} ${y + len}`,
    tr: `M ${x - len} ${y} L ${x} ${y} L ${x} ${y + len}`,
    bl: `M ${x} ${y - len} L ${x} ${y} L ${x + len} ${y}`,
    br: `M ${x - len} ${y} L ${x} ${y} L ${x} ${y - len}`,
  };
  return (
    <path
      d={paths[corner]}
      fill="none"
      stroke={stroke}
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
};

const VerifiedIllustration = ({ isDark }: { isDark: boolean }) => {
  const uid = useId().replace(/:/g, "");
  const muted = isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)";
  const cardFill = isDark ? "#12151A" : "#FFFFFF";
  const cardStroke = isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)";
  const frameFill = isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.04)";
  const bracketStroke = isDark ? "rgba(245,247,250,0.4)" : "rgba(15,23,42,0.28)";
  const scanLine = isDark ? "#F5F7FA" : "#0F172A";

  const frame = { x: 38, y: 12, w: 124, h: 96, rx: 8 };
  const doc = { x: 52, y: 26, w: 96, h: 68, rx: 5 };
  const scanTop = doc.y + 6;
  const scanBottom = doc.y + doc.h - 6;

  const bodyLines = [
    { y: 52, w: 72 },
    { y: 60, w: 64 },
    { y: 68, w: 68 },
    { y: 76, w: 56 },
    { y: 84, w: 62 },
  ];

  return (
    <svg viewBox="0 0 200 120" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id={`${uid}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="1"
            stdDeviation="1.5"
            floodColor={isDark ? "#000" : "#0F172A"}
            floodOpacity={isDark ? 0.35 : 0.08}
          />
        </filter>
        <filter id={`${uid}-scan-glow`} x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id={`${uid}-doc-clip`}>
          <rect x={doc.x} y={doc.y} width={doc.w} height={doc.h} rx={doc.rx} />
        </clipPath>
        <linearGradient id={`${uid}-beam`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BLUE} stopOpacity="0" />
          <stop offset="45%" stopColor={BLUE} stopOpacity={isDark ? 0.12 : 0.08} />
          <stop offset="50%" stopColor={BLUE} stopOpacity={isDark ? 0.22 : 0.14} />
          <stop offset="55%" stopColor={BLUE} stopOpacity={isDark ? 0.12 : 0.08} />
          <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
        </linearGradient>
      </defs>

      <g filter={`url(#${uid}-shadow)`}>
        <rect
          x={frame.x}
          y={frame.y}
          width={frame.w}
          height={frame.h}
          rx={frame.rx}
          fill={frameFill}
          stroke={cardStroke}
          strokeWidth="0.6"
        />

        <ScanCornerBracket x={frame.x + 10} y={frame.y + 10} corner="tl" stroke={bracketStroke} />
        <ScanCornerBracket x={frame.x + frame.w - 10} y={frame.y + 10} corner="tr" stroke={bracketStroke} />
        <ScanCornerBracket x={frame.x + 10} y={frame.y + frame.h - 10} corner="bl" stroke={bracketStroke} />
        <ScanCornerBracket x={frame.x + frame.w - 10} y={frame.y + frame.h - 10} corner="br" stroke={bracketStroke} />

        <rect
          x={doc.x}
          y={doc.y}
          width={doc.w}
          height={doc.h}
          rx={doc.rx}
          fill={cardFill}
          stroke={cardStroke}
          strokeWidth="0.6"
        />

        <circle cx={doc.x + 14} cy={doc.y + 16} r="5.5" fill={`${BLUE}${isDark ? "35" : "28"}`} />
        <line x1={doc.x + 26} y1={doc.y + 12} x2={doc.x + 58} y2={doc.y + 12} stroke={muted} strokeWidth="2.2" strokeLinecap="round" />
        <line x1={doc.x + 26} y1={doc.y + 20} x2={doc.x + 48} y2={doc.y + 20} stroke={muted} strokeWidth="2.2" strokeLinecap="round" />
        {bodyLines.map((line) => (
          <line
            key={line.y}
            x1={doc.x + 12}
            y1={line.y}
            x2={doc.x + 12 + line.w}
            y2={line.y}
            stroke={muted}
            strokeWidth="2"
            strokeLinecap="round"
          />
        ))}

        <g clipPath={`url(#${uid}-doc-clip)`}>
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values={`0,${scanTop}; 0,${scanBottom}; 0,${scanTop}`}
              dur="2.6s"
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
              keyTimes="0; 0.5; 1"
            />
            <rect
              x={doc.x}
              y={-6}
              width={doc.w}
              height={12}
              fill={`url(#${uid}-beam)`}
            />
            <line
              x1={frame.x + 4}
              y1={0}
              x2={frame.x + frame.w - 4}
              y2={0}
              stroke={scanLine}
              strokeWidth="0.9"
              strokeLinecap="round"
            />
            <rect
              x={doc.x}
              y={-4}
              width={2}
              height={8}
              rx="1"
              fill={BLUE}
              opacity={isDark ? 0.75 : 0.65}
              filter={`url(#${uid}-scan-glow)`}
            />
            <rect
              x={doc.x + doc.w - 2}
              y={-4}
              width={2}
              height={8}
              rx="1"
              fill={BLUE}
              opacity={isDark ? 0.75 : 0.65}
              filter={`url(#${uid}-scan-glow)`}
            />
          </g>
        </g>
      </g>
    </svg>
  );
};

/* ─── Instant Connect Illustration (chat) ─── */

const ConnectTypingDots = ({
  x,
  y,
  fill,
  begin,
}: {
  x: number;
  y: number;
  fill: string;
  begin: string;
}) => (
  <g opacity="0">
    <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.14;0.34;0.4;1" dur="7s" begin={begin} repeatCount="indefinite" />
    {[0, 7, 14].map((dx, i) => (
      <circle key={dx} cx={x + dx} cy={y} r="2.2" fill={fill}>
        <animate
          attributeName="opacity"
          values="0.35;1;0.35"
          dur="0.9s"
          begin={`${begin}; ${i * 0.15}s`}
          repeatCount="indefinite"
        />
        <animate
          attributeName="cy"
          values={`${y};${y - 2.5};${y}`}
          dur="0.9s"
          begin={`${begin}; ${i * 0.15}s`}
          repeatCount="indefinite"
        />
      </circle>
    ))}
  </g>
);

const ConnectIllustration = ({ isDark }: { isDark: boolean }) => {
  const uid = useId().replace(/:/g, "");
  const panelFill = isDark ? "#12151A" : "#FFFFFF";
  const panelStroke = isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)";
  const chatBg = isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC";
  const meta = isDark ? "rgba(245,247,250,0.42)" : "rgba(15,23,42,0.42)";
  const tutorBubbleFill = isDark ? "#1A1F27" : "#FFFFFF";
  const tutorBubbleStroke = isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.06)";
  const tutorText = isDark ? "#F5F7FA" : "#0F172A";
  const studentText = "#F8FAFC";
  const typingFill = isDark ? "rgba(245,247,250,0.55)" : "rgba(15,23,42,0.35)";
  const font = "var(--font-secondary), system-ui, sans-serif";

  const tutor = {
    x: 14,
    y: 28,
    w: 104,
    h: 32,
    rx: 10,
    lines: ["Happy to help — send me", "the problem you're stuck on."],
  };
  const student = {
    x: 82,
    y: 66,
    w: 104,
    h: 32,
    rx: 10,
    lines: ["Can you walk me through", "question 4 from the worksheet?"],
  };
  const typing = { x: 186, y: 54, w: 40, h: 20, rx: 9 };

  return (
    <svg viewBox="0 0 200 120" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id={`${uid}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="1"
            stdDeviation="1.5"
            floodColor={isDark ? "#000" : "#0F172A"}
            floodOpacity={isDark ? 0.35 : 0.08}
          />
        </filter>
        <filter id={`${uid}-bubble`} x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow
            dx="0"
            dy="0.5"
            stdDeviation="1"
            floodColor={isDark ? "#000" : "#0F172A"}
            floodOpacity={isDark ? 0.25 : 0.06}
          />
        </filter>
      </defs>

      <g filter={`url(#${uid}-shadow)`}>
        <rect x="0" y="0" width="200" height="120" rx="8" fill={panelFill} stroke={panelStroke} strokeWidth="0.6" />
        <rect x="8" y="8" width="184" height="104" rx="6" fill={chatBg} />

        {/* Tutor date */}
        <g opacity="0">
          <animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;0.06;0.9;0.97;1" dur="7s" repeatCount="indefinite" />
          <text x={tutor.x} y="22" fontSize="6" fill={meta} fontFamily={font}>
            Sat 22 Feb
          </text>
        </g>

        {/* Tutor message (left) */}
        <g opacity="0" filter={`url(#${uid}-bubble)`}>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,5; 0,0; 0,0; 0,5"
            keyTimes="0;0.1;0.9;1"
            dur="7s"
            repeatCount="indefinite"
          />
          <animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;0.08;0.9;0.97;1" dur="7s" repeatCount="indefinite" />
          <rect
            x={tutor.x}
            y={tutor.y}
            width={tutor.w}
            height={tutor.h}
            rx={tutor.rx}
            fill={tutorBubbleFill}
            stroke={tutorBubbleStroke}
            strokeWidth="0.5"
          />
          <text x={tutor.x + 10} y={tutor.y + 14} fontSize="6.2" fontWeight="500" fill={tutorText} fontFamily={font}>
            {tutor.lines[0]}
          </text>
          <text x={tutor.x + 10} y={tutor.y + 24} fontSize="6.2" fontWeight="500" fill={tutorText} fontFamily={font}>
            {tutor.lines[1]}
          </text>
        </g>

        {/* Typing indicator (student side) */}
        <g>
          <rect
            x={typing.x - typing.w}
            y={typing.y}
            width={typing.w}
            height={typing.h}
            rx={typing.rx}
            fill={isDark ? "#1A1F27" : "#FFFFFF"}
            stroke={tutorBubbleStroke}
            strokeWidth="0.5"
            opacity="0"
          >
            <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.16;0.2;0.34;0.4;1" dur="7s" repeatCount="indefinite" />
          </rect>
          <ConnectTypingDots x={typing.x - typing.w + 12} y={typing.y + 10} fill={typingFill} begin="0s" />
        </g>

        {/* Student message (right) */}
        <g opacity="0" filter={`url(#${uid}-bubble)`}>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,5; 0,0; 0,0; 0,5"
            keyTimes="0;0.38;0.9;1"
            dur="7s"
            repeatCount="indefinite"
          />
          <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.36;0.9;1" dur="7s" repeatCount="indefinite" />
          <rect
            x={student.x}
            y={student.y}
            width={student.w}
            height={student.h}
            rx={student.rx}
            fill={PURPLE}
            opacity={isDark ? 0.9 : 0.88}
          />
          <text x={student.x + 10} y={student.y + 14} fontSize="6.2" fontWeight="500" fill={studentText} fontFamily={font}>
            {student.lines[0]}
          </text>
          <text x={student.x + 10} y={student.y + 24} fontSize="6.2" fontWeight="500" fill={studentText} fontFamily={font}>
            {student.lines[1]}
          </text>
        </g>

        {/* Student timestamp */}
        <g opacity="0">
          <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.44;0.9;1" dur="7s" repeatCount="indefinite" />
          <text
            x={student.x + student.w}
            y={student.y + student.h + 9}
            textAnchor="end"
            fontSize="5"
            fill={meta}
            fontFamily={font}
          >
            Now
          </text>
        </g>
      </g>
    </svg>
  );
};

/* ─── Learn From Anywhere Illustration (global map) ─── */

function mapSrand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

type MapPinDef = {
  id: string;
  x: number;
  y: number;
  label: string;
  avatarFrom: string;
  avatarTo: string;
  accent: string;
};

const ANYWHERE_PINS: MapPinDef[] = [
  { id: "sa", x: 52, y: 82, label: "São Paulo", avatarFrom: "#E8B88A", avatarTo: "#A0714F", accent: ORANGE },
  { id: "af", x: 98, y: 62, label: "Lagos", avatarFrom: "#9AE6B4", avatarTo: "#52B788", accent: GREEN },
  { id: "as", x: 158, y: 42, label: "Tokyo", avatarFrom: "#A5B4FC", avatarTo: "#6688FF", accent: BLUE },
];

const ANYWHERE_CONNECTIONS = [
  { id: "sa-af", from: "sa", to: "af", color: ORANGE, bend: 0.22 },
  { id: "af-as", from: "af", to: "as", color: PURPLE, bend: 0.28 },
  { id: "sa-as", from: "sa", to: "as", color: BLUE, bend: 0.38 },
];

const arcBetween = (x1: number, y1: number, x2: number, y2: number, bend: number) => {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 - Math.abs(x2 - x1) * bend;
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
};

const buildWorldDots = (mapX: number, mapY: number, mapW: number, mapH: number) => {
  const spacing = 3.1;
  const cols = Math.floor(mapW / spacing);
  const rows = Math.floor(mapH / spacing);
  const regions = [
    { cx: 0.17, cy: 0.26, rx: 0.12, ry: 0.2, density: 0.88 },
    { cx: 0.24, cy: 0.68, rx: 0.075, ry: 0.26, density: 0.92 },
    { cx: 0.5, cy: 0.52, rx: 0.095, ry: 0.31, density: 0.9 },
    { cx: 0.54, cy: 0.24, rx: 0.065, ry: 0.11, density: 0.86 },
    { cx: 0.7, cy: 0.34, rx: 0.21, ry: 0.24, density: 0.84 },
    { cx: 0.78, cy: 0.72, rx: 0.075, ry: 0.085, density: 0.82 },
    { cx: 0.52, cy: 0.16, rx: 0.045, ry: 0.07, density: 0.72 },
  ];

  const dots: { x: number; y: number; o: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const nx = (c + 0.5) / cols;
      const ny = (r + 0.5) / rows;
      const seed = c * 137 + r * 311 + 42;
      const jitter = mapSrand(seed);

      for (const reg of regions) {
        const dx = (nx - reg.cx) / reg.rx;
        const dy = (ny - reg.cy) / reg.ry;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= 1 && jitter < reg.density * (1 - dist * 0.35)) {
          dots.push({
            x: mapX + c * spacing + spacing / 2,
            y: mapY + r * spacing + spacing / 2,
            o: 0.22 + (1 - dist) * 0.38,
          });
          break;
        }
      }
    }
  }
  return dots;
};

const MapPinAvatar = ({
  uid,
  pin,
  isDark,
}: {
  uid: string;
  pin: MapPinDef;
  isDark: boolean;
}) => {
  const skin = isDark ? "rgba(15,20,25,0.35)" : "rgba(255,255,255,0.45)";
  return (
    <g clipPath={`url(#${uid}-${pin.id}-clip)`}>
      <circle cx="0" cy="-14" r="5.5" fill={`url(#${uid}-${pin.id}-avatar)`} />
      <ellipse cx="0" cy="-15.5" rx="2.4" ry="2.6" fill={skin} />
      <path
        d="M -3.2 -12.2 Q 0 -10.2 3.2 -12.2 Q 0 -8.2 -3.2 -12.2"
        fill={skin}
        opacity="0.55"
      />
    </g>
  );
};

const LearnFromAnywhereIllustration = ({ isDark }: { isDark: boolean }) => {
  const uid = useId().replace(/:/g, "");
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);

  const dotColor = isDark ? "rgba(245,247,250,0.28)" : "rgba(15,23,42,0.22)";
  const lineMuted = isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)";
  const pinFill = isDark ? "#F5F7FA" : "#FFFFFF";
  const pinStroke = isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.08)";
  const labelColor = isDark ? "rgba(245,247,250,0.45)" : "rgba(15,23,42,0.42)";

  const map = { x: 16, y: 24, w: 168, h: 78 };
  const worldDots = useMemo(() => buildWorldDots(map.x, map.y, map.w, map.h), []);

  const pinById = useMemo(
    () => Object.fromEntries(ANYWHERE_PINS.map((p) => [p.id, p])),
    [],
  );

  const connections = useMemo(
    () =>
      ANYWHERE_CONNECTIONS.map((c) => {
        const from = pinById[c.from];
        const to = pinById[c.to];
        const path = arcBetween(from.x, from.y - 16, to.x, to.y - 16, c.bend);
        return { ...c, path };
      }),
    [pinById],
  );

  const isConnActive = (conn: (typeof connections)[0]) =>
    !hoveredPin || conn.from === hoveredPin || conn.to === hoveredPin;

  return (
    <svg
      viewBox="0 0 200 120"
      className="w-full h-full select-none"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Global map showing tutors connected across continents"
    >
      <defs>
        <filter id={`${uid}-pin-shadow`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx="0"
            dy="1.5"
            stdDeviation="1.8"
            floodColor={isDark ? "#000" : "#0F172A"}
            floodOpacity={isDark ? 0.4 : 0.12}
          />
        </filter>
        {ANYWHERE_PINS.map((pin) => (
          <React.Fragment key={pin.id}>
            <linearGradient id={`${uid}-${pin.id}-avatar`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={pin.avatarFrom} />
              <stop offset="100%" stopColor={pin.avatarTo} />
            </linearGradient>
            <clipPath id={`${uid}-${pin.id}-clip`}>
              <circle cx={pin.x} cy={pin.y - 14} r="5.5" />
            </clipPath>
          </React.Fragment>
        ))}
      </defs>

      {/* Dot-matrix world map */}
      {worldDots.map((d, i) => (
        <circle key={`dot-${i}`} cx={d.x} cy={d.y} r="0.65" fill={dotColor} opacity={d.o} />
      ))}

      {/* Connection arcs */}
      {connections.map((conn, i) => {
        const active = isConnActive(conn);
        return (
          <g
            key={conn.id}
            opacity={active ? 1 : 0.22}
            style={{ transition: "opacity 0.25s ease" }}
          >
            <path
              d={conn.path}
              fill="none"
              stroke={lineMuted}
              strokeWidth="0.6"
              strokeLinecap="round"
            />
            <path
              d={conn.path}
              fill="none"
              stroke={conn.color}
              strokeWidth={active ? 1 : 0.7}
              strokeLinecap="round"
              strokeDasharray="3.5 3"
              opacity={active ? 0.75 : 0.35}
            >
              <animate
                attributeName="stroke-dashoffset"
                values="0;-13"
                dur={`${2.8 + i * 0.4}s`}
                repeatCount="indefinite"
              />
            </path>
            <circle r={active ? 2 : 1.4} fill={conn.color} opacity={active ? 0.95 : 0.45}>
              <animateMotion
                dur={`${3.2 + i * 0.5}s`}
                repeatCount="indefinite"
                path={conn.path}
              />
            </circle>
            {active && (
              <circle r="2.5" fill={conn.color} opacity="0">
                <animate attributeName="opacity" values="0.35;0;0.35" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="r" values="1.5;4.5;1.5" dur="1.8s" repeatCount="indefinite" />
                <animateMotion dur={`${3.2 + i * 0.5}s`} repeatCount="indefinite" path={conn.path} />
              </circle>
            )}
          </g>
        );
      })}

      {/* Location pins */}
      {ANYWHERE_PINS.map((pin) => {
        const isHovered = hoveredPin === pin.id;
        const isDimmed = hoveredPin !== null && !isHovered;
        return (
          <g
            key={pin.id}
            transform={`translate(${pin.x}, ${pin.y}) scale(${isHovered ? 1.1 : 1})`}
            style={{ transition: "transform 0.2s ease", cursor: "pointer" }}
            opacity={isDimmed ? 0.55 : 1}
            filter={`url(#${uid}-pin-shadow)`}
            onMouseEnter={() => setHoveredPin(pin.id)}
            onMouseLeave={() => setHoveredPin(null)}
            role="button"
            tabIndex={0}
            aria-label={`${pin.label} tutor location`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setHoveredPin((prev) => (prev === pin.id ? null : pin.id));
              }
            }}
          >
            <ellipse cx="0" cy="13" rx="5.5" ry="1.6" fill={isDark ? "#000" : "#0F172A"} opacity="0.1" />
            <path
              d="M -7.5 -15 A 7.5 7.5 0 1 1 7.5 -15 L 0 11 Z"
              fill={pinFill}
              stroke={pinStroke}
              strokeWidth="0.55"
            />
            <circle
              cx="0"
              cy="-15"
              r="6.2"
              fill="none"
              stroke={isHovered ? pin.accent : pinStroke}
              strokeWidth={isHovered ? 1 : 0.45}
              style={{ transition: "stroke 0.2s ease" }}
            />
            <MapPinAvatar uid={uid} pin={pin} isDark={isDark} />
            <g opacity={isHovered ? 1 : 0} style={{ transition: "opacity 0.2s ease" }} pointerEvents="none">
              <rect
                x={-18}
                y={-34}
                width={36}
                height={12}
                rx="3"
                fill={isDark ? "#1A1F27" : "#FFFFFF"}
                stroke={pinStroke}
                strokeWidth="0.5"
              />
              <text
                x={0}
                y={-26}
                textAnchor="middle"
                fontSize="5.5"
                fontWeight="600"
                fill={pin.accent}
                fontFamily="var(--font-secondary), system-ui, sans-serif"
              >
                {pin.label}
              </text>
            </g>
          </g>
        );
      })}

      {/* Live sessions hint */}
      <g opacity={hoveredPin ? 0 : 0.85} style={{ transition: "opacity 0.25s ease" }}>
        <circle cx="178" cy="14" r="2.2" fill={GREEN}>
          <animate attributeName="opacity" values="1;0.35;1" dur="2s" repeatCount="indefinite" />
        </circle>
        <text
          x="172"
          y="14.5"
          textAnchor="end"
          fontSize="5.5"
          fill={labelColor}
          fontFamily="var(--font-secondary), system-ui, sans-serif"
        >
          Live now
        </text>
      </g>
    </svg>
  );
};

/* ─── Session Recordings Illustration (live → record → destinations) ─── */

const RecordingSyncIcon = ({ stroke }: { stroke: string }) => (
  <g stroke={stroke} strokeWidth="0.9" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M -3.5 -1 A 4 4 0 1 1 0.5 3.5" />
    <path d="M 0.5 3.5 L 3 3.5 L 0.5 6" />
    <path d="M 3.5 1 A 4 4 0 1 1 -0.5 -3.5" />
    <path d="M -0.5 -3.5 L -3 -3.5 L -0.5 -6" />
  </g>
);

const RecordingDestIcon = ({ type, color }: { type: "playback" | "notes" | "library"; color: string }) => {
  const sw = 0.75;
  switch (type) {
    case "playback":
      return (
        <g fill={color} stroke="none" opacity="0.9">
          <polygon points="-2.5,-3 3.5,0 -2.5,3" />
        </g>
      );
    case "notes":
      return (
        <g stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round" opacity="0.9">
          <rect x="-3.5" y="-4" width="7" height="8" rx="0.8" />
          <line x1="-1.5" y1="-1" x2="1.5" y2="-1" />
          <line x1="-1.5" y1="1" x2="1" y2="1" />
        </g>
      );
    case "library":
      return (
        <g fill={color} stroke="none" opacity="0.9">
          <ellipse cx="0" cy="-2.5" rx="3.5" ry="1.2" />
          <rect x="-3.5" y="-2.5" width="7" height="4" />
          <ellipse cx="0" cy="2.5" rx="3.5" ry="1.2" />
        </g>
      );
    default:
      return null;
  }
};

type RecordingDestDef = {
  id: string;
  y: number;
  label: string;
  color: string;
  icon: "playback" | "notes" | "library";
  fromPath: string;
  toPath: string;
  flowPath: string;
};

const RECORDING_DESTS: RecordingDestDef[] = [
  {
    id: "playback",
    y: 10,
    label: "Playback",
    color: BLUE,
    icon: "playback",
    fromPath: "M 58 38 C 66 36, 70 52, 71 54",
    toPath: "M 93 54 C 98 30, 102 23, 106 23",
    flowPath: "M 58 38 C 66 36, 70 52, 71 54 L 93 54 C 98 30, 102 23, 106 23",
  },
  {
    id: "notes",
    y: 47,
    label: "Notes",
    color: PURPLE,
    icon: "notes",
    fromPath: "M 58 60 L 71 60",
    toPath: "M 93 60 L 106 60",
    flowPath: "M 58 60 L 71 60 L 93 60 L 106 60",
  },
  {
    id: "library",
    y: 84,
    label: "Library",
    color: GREEN,
    icon: "library",
    fromPath: "M 58 82 C 66 84, 70 68, 71 66",
    toPath: "M 93 66 C 98 90, 102 97, 106 97",
    flowPath: "M 58 82 C 66 84, 70 68, 71 66 L 93 66 C 98 90, 102 97, 106 97",
  },
];

const SessionRecordingsIllustration = ({ isDark }: { isDark: boolean }) => {
  const uid = useId().replace(/:/g, "");
  const [hoveredDest, setHoveredDest] = useState<string | null>(null);

  const muted = isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)";
  const cardFill = isDark ? "#12151A" : "#FFFFFF";
  const cardStroke = isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)";
  const textColor = isDark ? "#F5F7FA" : "#0F172A";
  const subtext = isDark ? "rgba(245,247,250,0.45)" : "rgba(15,23,42,0.45)";
  const lineMuted = isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)";
  const hubIcon = isDark ? "rgba(245,247,250,0.55)" : "rgba(15,23,42,0.45)";
  const font = "var(--font-secondary), system-ui, sans-serif";

  const live = { x: 4, y: 18, w: 54, h: 84, rx: 6 };
  const hub = { x: 82, y: 60, r: 11 };
  const destW = 88;
  const destH = 26;
  const destX = 106;

  const isDestActive = (id: string) => !hoveredDest || hoveredDest === id;

  return (
    <svg
      viewBox="0 0 200 120"
      className="w-full h-full select-none"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Live session recording distributed to playback, notes, and library"
    >
      <defs>
        <filter id={`${uid}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="1"
            stdDeviation="1.5"
            floodColor={isDark ? "#000" : "#0F172A"}
            floodOpacity={isDark ? 0.35 : 0.08}
          />
        </filter>
      </defs>

      {/* Connectors */}
      {RECORDING_DESTS.map((dest, i) => {
        const active = isDestActive(dest.id);
        return (
          <g key={dest.id} opacity={active ? 1 : 0.25} style={{ transition: "opacity 0.25s ease" }}>
            <path d={dest.fromPath} fill="none" stroke={lineMuted} strokeWidth="0.65" strokeLinecap="round" />
            <path d={dest.toPath} fill="none" stroke={lineMuted} strokeWidth="0.65" strokeLinecap="round" />
            <path
              d={dest.flowPath}
              fill="none"
              stroke={dest.color}
              strokeWidth={active ? 0.9 : 0.65}
              strokeLinecap="round"
              strokeDasharray="3 3"
              opacity={active ? 0.8 : 0.35}
            >
              <animate
                attributeName="stroke-dashoffset"
                values="0;-12"
                dur={`${2.6 + i * 0.35}s`}
                repeatCount="indefinite"
              />
            </path>
            {active && (
              <circle r="1.8" fill={dest.color}>
                <animateMotion dur={`${3 + i * 0.4}s`} repeatCount="indefinite" path={dest.flowPath} />
              </circle>
            )}
          </g>
        );
      })}

      {/* Live session card */}
      <g filter={`url(#${uid}-shadow)`}>
        <rect
          x={live.x}
          y={live.y}
          width={live.w}
          height={live.h}
          rx={live.rx}
          fill={cardFill}
          stroke={cardStroke}
          strokeWidth="0.6"
        />
        <circle cx={live.x + 14} cy={live.y + 18} r="5" fill={`${ORANGE}${isDark ? "30" : "22"}`} />
        <circle cx={live.x + 14} cy={live.y + 18} r="2" fill={ORANGE} opacity="0.85">
          <animate attributeName="opacity" values="0.85;0.35;0.85" dur="1.6s" repeatCount="indefinite" />
        </circle>
        <text x={live.x + 24} y={live.y + 20} fontSize="7.5" fontWeight="700" fill={textColor} fontFamily={font}>
          Live Session
        </text>
        <text x={live.x + 24} y={live.y + 30} fontSize="5.5" fill={subtext} fontFamily={font}>
          Recording
        </text>
        <line
          x1={live.x + 12}
          y1={live.y + 42}
          x2={live.x + live.w - 12}
          y2={live.y + 42}
          stroke={muted}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <line
          x1={live.x + 12}
          y1={live.y + 52}
          x2={live.x + live.w - 22}
          y2={live.y + 52}
          stroke={muted}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <rect
          x={live.x + 10}
          y={live.y + live.h - 22}
          width={live.w - 20}
          height={12}
          rx="3"
          fill={isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.04)"}
          stroke={cardStroke}
          strokeWidth="0.4"
        />
        <circle cx={live.x + 16} cy={live.y + live.h - 16} r="2" fill={GREEN} opacity="0.9">
          <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
        </circle>
        <text x={live.x + 22} y={live.y + live.h - 14.5} fontSize="4.5" fill={subtext} fontFamily={font}>
          In progress
        </text>
      </g>

      {/* Record / sync hub */}
      <g filter={`url(#${uid}-shadow)`}>
        <circle
          cx={hub.x}
          cy={hub.y}
          r={hub.r}
          fill={cardFill}
          stroke={cardStroke}
          strokeWidth="0.6"
        />
        <g transform={`translate(${hub.x}, ${hub.y})`}>
          <RecordingSyncIcon stroke={hubIcon} />
        </g>
      </g>

      {/* Destination cards */}
      {RECORDING_DESTS.map((dest) => {
        const cy = dest.y + destH / 2;
        const active = isDestActive(dest.id);
        const dimmed = hoveredDest !== null && !active;
        const tint = `${dest.color}${isDark ? "28" : "1A"}`;

        return (
          <g
            key={dest.id}
            filter={`url(#${uid}-shadow)`}
            opacity={dimmed ? 0.5 : 1}
            transform={`translate(0, ${active && hoveredDest === dest.id ? -1 : 0})`}
            style={{ transition: "opacity 0.25s ease, transform 0.2s ease", cursor: "pointer" }}
            onMouseEnter={() => setHoveredDest(dest.id)}
            onMouseLeave={() => setHoveredDest(null)}
            role="button"
            tabIndex={0}
            aria-label={dest.label}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setHoveredDest((prev) => (prev === dest.id ? null : dest.id));
              }
            }}
          >
            <rect
              x={destX}
              y={dest.y}
              width={destW}
              height={destH}
              rx="5"
              fill={cardFill}
              stroke={active && hoveredDest === dest.id ? `${dest.color}55` : cardStroke}
              strokeWidth={hoveredDest === dest.id ? 0.85 : 0.6}
              style={{ transition: "stroke 0.2s ease" }}
            />
            <rect x={destX + 8} y={dest.y + 6} width="14" height="14" rx="3" fill={tint} />
            <g transform={`translate(${destX + 15}, ${cy})`}>
              <RecordingDestIcon type={dest.icon} color={dest.color} />
            </g>
            <text
              x={destX + 28}
              y={cy + 1}
              dominantBaseline="middle"
              fontSize="6.5"
              fontWeight="600"
              fill={textColor}
              fontFamily={font}
            >
              {dest.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

/* ─── Transparent Pricing Illustration (payment flow) ─── */

const PRICING_STEP_COUNT = 3;

const PricingCreditCardIcon = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    <rect x="0" y="1" width="14" height="10" rx="1.5" fill="none" stroke={ORANGE} strokeWidth="0.9" />
    <line x1="0" y1="4.5" x2="14" y2="4.5" stroke={ORANGE} strokeWidth="0.7" opacity="0.55" />
    <rect x="2" y="7" width="5" height="2.5" rx="0.5" fill={ORANGE} opacity="0.35" />
  </g>
);

const PricingReceiptIcon = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    <path
      d="M1 0 L13 0 L13 11 L10.5 9.5 L8 11 L5.5 9.5 L3 11 L1 11 Z"
      fill="none"
      stroke={PURPLE}
      strokeWidth="0.85"
      strokeLinejoin="round"
    />
    <rect x="4.5" y="3" width="5" height="4.5" rx="0.6" fill={`${PURPLE}${"22"}`} stroke={PURPLE} strokeWidth="0.5" />
    <text x="7" y="6.6" textAnchor="middle" fontSize="4.5" fontWeight="700" fill={PURPLE}>
      $
    </text>
  </g>
);

const PricingIllustration = ({ isDark }: { isDark: boolean }) => {
  const uid = useId().replace(/:/g, "");
  const [activeStep, setActiveStep] = useState(0);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((s) => (s + 1) % PRICING_STEP_COUNT);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const muted = isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)";
  const cardFill = isDark ? "#12151A" : "#FFFFFF";
  const cardStroke = isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)";
  const textColor = isDark ? "#F5F7FA" : "#0F172A";
  const subtext = isDark ? "rgba(245,247,250,0.45)" : "rgba(15,23,42,0.45)";
  const connectorBase = isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)";
  const connectorActive = GREEN;
  const hatchStroke = isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)";
  const font = "var(--font-secondary), system-ui, sans-serif";

  const cardX = 34;
  const cardW = 132;
  const centerX = 100;
  const payment = { x: cardX, y: 3, w: cardW, h: 28, rx: 5 };
  const verified = { x: cardX, y: 37, w: cardW, h: 28, rx: 5 };
  const receipt = { x: cardX, y: 71, w: cardW, h: 46, rx: 5 };

  const stepOpacity = (index: number) => {
    if (index <= activeStep) return 1;
    if (hoveredStep === index) return 0.88;
    return 0.42;
  };

  const stepLift = (index: number) => (hoveredStep === index || activeStep === index ? -1.2 : 0);

  const stepStroke = (index: number) => {
    if (activeStep === index) return isDark ? "rgba(125,211,160,0.45)" : "rgba(61,154,110,0.35)";
    if (hoveredStep === index) return isDark ? "rgba(255,255,255,0.18)" : "rgba(15,23,42,0.14)";
    return cardStroke;
  };

  const goToStep = (index: number) => setActiveStep(index);

  return (
    <svg viewBox="0 0 200 120" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id={`${uid}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="1"
            stdDeviation="1.5"
            floodColor={isDark ? "#000" : "#0F172A"}
            floodOpacity={isDark ? 0.35 : 0.08}
          />
        </filter>
        <pattern id={`${uid}-hatch`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="5" stroke={hatchStroke} strokeWidth="1.2" />
        </pattern>
        <clipPath id={`${uid}-verified-hatch`}>
          <rect x={verified.x} y={verified.y} width="34" height={verified.h} rx={verified.rx} />
        </clipPath>
      </defs>

      {/* Connector: payment → verified */}
      <line
        x1={centerX}
        y1={payment.y + payment.h}
        x2={centerX}
        y2={verified.y}
        stroke={activeStep >= 1 ? connectorActive : connectorBase}
        strokeWidth="0.8"
        strokeLinecap="round"
        style={{ transition: "stroke 0.4s ease" }}
      />
      {/* Connector: verified → receipt */}
      <line
        x1={centerX}
        y1={verified.y + verified.h}
        x2={centerX}
        y2={receipt.y}
        stroke={activeStep >= 2 ? connectorActive : connectorBase}
        strokeWidth="0.8"
        strokeLinecap="round"
        style={{ transition: "stroke 0.4s ease" }}
      />

      {/* Payment card */}
      <g
        filter={`url(#${uid}-shadow)`}
        opacity={stepOpacity(0)}
        transform={`translate(0, ${stepLift(0)})`}
        style={{ transition: "opacity 0.35s ease, transform 0.25s ease" }}
        className="cursor-pointer"
        onClick={() => goToStep(0)}
        onMouseEnter={() => setHoveredStep(0)}
        onMouseLeave={() => setHoveredStep(null)}
        role="button"
        tabIndex={0}
        aria-label="Payment step"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") goToStep(0);
        }}
      >
        <rect
          x={payment.x}
          y={payment.y}
          width={payment.w}
          height={payment.h}
          rx={payment.rx}
          fill={cardFill}
          stroke={stepStroke(0)}
          strokeWidth={activeStep === 0 ? 0.9 : 0.6}
        />
        <PricingCreditCardIcon x={payment.x + 10} y={payment.y + 9} />
        <text
          x={payment.x + 28}
          y={payment.y + 16}
          fontSize="7"
          fontWeight="700"
          fill={textColor}
          letterSpacing="0.5"
          fontFamily={font}
        >
          PAYMENT
        </text>
        <line
          x1={payment.x + 10}
          y1={payment.y + 22}
          x2={payment.x + payment.w - 12}
          y2={payment.y + 22}
          stroke={muted}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <line
          x1={payment.x + 10}
          y1={payment.y + 28}
          x2={payment.x + 72}
          y2={payment.y + 28}
          stroke={muted}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <line
          x1={payment.x + 78}
          y1={payment.y + 28}
          x2={payment.x + payment.w - 12}
          y2={payment.y + 28}
          stroke={muted}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </g>

      {/* Verified card */}
      <g
        filter={`url(#${uid}-shadow)`}
        opacity={stepOpacity(1)}
        transform={`translate(0, ${stepLift(1)})`}
        style={{ transition: "opacity 0.35s ease, transform 0.25s ease" }}
        className="cursor-pointer"
        onClick={() => goToStep(1)}
        onMouseEnter={() => setHoveredStep(1)}
        onMouseLeave={() => setHoveredStep(null)}
        role="button"
        tabIndex={0}
        aria-label="Verified step"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") goToStep(1);
        }}
      >
        <rect
          x={verified.x}
          y={verified.y}
          width={verified.w}
          height={verified.h}
          rx={verified.rx}
          fill={cardFill}
          stroke={stepStroke(1)}
          strokeWidth={activeStep === 1 ? 0.9 : 0.6}
        />
        <g clipPath={`url(#${uid}-verified-hatch)`}>
          <rect x={verified.x} y={verified.y} width="34" height={verified.h} fill={`url(#${uid}-hatch)`} />
        </g>
        <rect
          x={verified.x + 8}
          y={verified.y + 7}
          width="18"
          height="14"
          rx="2"
          fill={`${GREEN}${isDark ? "28" : "18"}`}
        />
        <circle
          cx={verified.x + 17}
          cy={verified.y + 14}
          r="6"
          fill={GREEN}
          opacity={activeStep >= 1 ? 1 : 0.5}
          style={{ transition: "opacity 0.35s ease" }}
        >
          {activeStep >= 1 && (
            <animate attributeName="r" values="6;6.8;6" dur="1.2s" repeatCount="indefinite" />
          )}
        </circle>
        <path
          d={`M ${verified.x + 14} ${verified.y + 14} L ${verified.x + 16.5} ${verified.y + 16.5} L ${verified.x + 21} ${verified.y + 11.5}`}
          fill="none"
          stroke="#F8FAFC"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text x={verified.x + 32} y={verified.y + 13} fontSize="7.5" fontWeight="700" fill={textColor} fontFamily={font}>
          Verified
        </text>
        <text x={verified.x + 32} y={verified.y + 22} fontSize="5.5" fill={subtext} fontFamily={font}>
          Payment processed
        </text>
      </g>

      {/* Receipt card */}
      <g
        filter={`url(#${uid}-shadow)`}
        opacity={stepOpacity(2)}
        transform={`translate(0, ${stepLift(2)})`}
        style={{ transition: "opacity 0.35s ease, transform 0.25s ease" }}
        className="cursor-pointer"
        onClick={() => goToStep(2)}
        onMouseEnter={() => setHoveredStep(2)}
        onMouseLeave={() => setHoveredStep(null)}
        role="button"
        tabIndex={0}
        aria-label="Receipt step"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") goToStep(2);
        }}
      >
        <rect
          x={receipt.x}
          y={receipt.y}
          width={receipt.w}
          height={receipt.h}
          rx={receipt.rx}
          fill={cardFill}
          stroke={stepStroke(2)}
          strokeWidth={activeStep === 2 ? 0.9 : 0.6}
        />
        <PricingReceiptIcon x={receipt.x + 10} y={receipt.y + 9} />
        <text
          x={receipt.x + 28}
          y={receipt.y + 16}
          fontSize="7"
          fontWeight="700"
          fill={textColor}
          letterSpacing="0.5"
          fontFamily={font}
        >
          RECEIPT
        </text>
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1={receipt.x + 10}
            y1={receipt.y + 22 + i * 5}
            x2={receipt.x + receipt.w - 12 - i * 6}
            y2={receipt.y + 22 + i * 5}
            stroke={muted}
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity={activeStep >= 2 ? 1 : 0.6}
            style={{ transition: "opacity 0.35s ease" }}
          />
        ))}
        <rect
          x={receipt.x + 10}
          y={receipt.y + receipt.h - 12}
          width="28"
          height="8"
          rx="4"
          fill={isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)"}
          className="pointer-events-none"
        />
        <rect
          x={receipt.x + receipt.w - 38}
          y={receipt.y + receipt.h - 12}
          width="28"
          height="8"
          rx="4"
          fill={GREEN}
          opacity={activeStep === 2 ? 1 : 0.65}
          style={{ transition: "opacity 0.3s ease" }}
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            goToStep(2);
          }}
          onMouseEnter={() => setHoveredStep(2)}
        />
      </g>
    </svg>
  );
};

/* ─── Features Section ─── */

type FeatureItem = {
  key: string;
  title: string;
  description: string;
  Illustration: React.FC<{ isDark: boolean }>;
  illustrationClassName?: string;
  illustrationWrapperClassName?: string;
};

const features: FeatureItem[] = [
  {
    key: "matching",
    title: "Intelligent Matching",
    description: "Algorithm-powered pairing based on your learning style and goals.",
    Illustration: MatchingIllustration,
    illustrationClassName: "w-[88%] max-w-[88%] mx-auto min-h-[10rem] h-44 sm:min-h-[11.5rem] sm:h-52",
    illustrationWrapperClassName: "pt-5 pb-3 px-3 sm:px-4",
  },
  {
    key: "schedule",
    title: "Flexible Scheduling",
    description: "Book sessions when you're sharpest morning or midnight.",
    Illustration: ScheduleIllustration,
    illustrationClassName: "w-[88%] max-w-[88%] mx-auto min-h-[10rem] h-44 sm:min-h-[11.5rem] sm:h-52 flex items-center justify-center",
    illustrationWrapperClassName: "pt-5 pb-3 px-3 sm:px-4",
  },
  {
    key: "progress",
    title: "Track Your Growth",
    description: "Visual analytics for every session, every milestone tracked.",
    Illustration: ProgressIllustration,
    illustrationClassName: "w-full min-h-[18rem] h-[18rem] sm:min-h-[20rem] sm:h-[20rem]",
    illustrationWrapperClassName: "py-4 px-3 sm:px-4",
  },
  {
    key: "subjects",
    title: "Every Subject Covered",
    description: "Specialized tutors for math, sciences, languages, arts — all here.",
    Illustration: SubjectsIllustration,
    illustrationClassName: "w-full min-h-[15rem] h-64 sm:min-h-[17rem] sm:h-72",
  },
  {
    key: "verified",
    title: "Verified & Vetted Tutors",
    description: "Rigorous background checks and teaching assessments for every tutor.",
    Illustration: VerifiedIllustration,
    illustrationClassName: "w-full min-h-[15rem] h-64 sm:min-h-[17rem] sm:h-72",
  },
  {
    key: "connect",
    title: "Instant Connect",
    description: "Message your tutor and get answers between sessions instantly.",
    Illustration: ConnectIllustration,
    illustrationClassName: "w-full min-h-[15rem] h-64 sm:min-h-[17rem] sm:h-72",
  },
  {
    key: "devices",
    title: "Learn From Anywhere",
    description: "Connect with tutors across the globe — sessions from any timezone, any location.",
    Illustration: LearnFromAnywhereIllustration,
    illustrationClassName: "w-full min-h-[15rem] h-64 sm:min-h-[17rem] sm:h-72",
  },
  {
    key: "resources",
    title: "Session Recordings",
    description: "Every session recorded and available with shared notes and resources.",
    Illustration: SessionRecordingsIllustration,
    illustrationClassName: "w-full min-h-[15rem] h-64 sm:min-h-[17rem] sm:h-72",
  },
  {
    key: "pricing",
    title: "Transparent Pricing",
    description: "No hidden fees — clear, affordable rates for every session.",
    Illustration: PricingIllustration,
    illustrationClassName: "w-full min-h-[15rem] h-64 sm:min-h-[17rem] sm:h-72",
  },
];

const Features = () => {
  const isDark = useIsDark();

  return (
    <section
      id="features"
      className="relative w-full py-32 overflow-hidden bg-[var(--background)] transition-colors duration-700"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <span className="inline-block text-sm font-[var(--font-secondary)] font-medium tracking-widest uppercase text-[#FFA629] mb-6">
            Features
          </span>
          <h2 className="font-[var(--font-primary)] text-5xl font-thin tracking-tight leading-tight text-[#0F172A] dark:text-[#F5F7FA]">
            Built for Personalising the learning
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {features.map((feat) => {
            const Ill = feat.Illustration;
            return (
              <div
                key={feat.key}
                className={`
                  group relative rounded-lg border overflow-hidden transition-all duration-300
                  ${
                    isDark
                      ? "border-white/[0.06] bg-[#0A0C0F] hover:border-white/[0.12]"
                      : "border-[#0F172A]/[0.06] bg-[#F1F5F9] hover:border-[#0F172A]/[0.12] hover:shadow-lg"
                  }
                `}
              >
                <div
                  className={`flex items-center justify-center ${
                    feat.illustrationWrapperClassName ??
                    (feat.illustrationClassName ? "py-6 px-3 sm:px-4" : "py-12 px-6")
                  }`}
                >
                  <div className={feat.illustrationClassName ?? "w-44 h-44"}>
                    <Ill isDark={isDark} />
                  </div>
                </div>
                <div className="px-8 pb-8">
                  <h3 className="font-[var(--font-primary)] text-xl font-normal text-[#0F172A] dark:text-[#F5F7FA] mb-3">
                    {feat.title}
                  </h3>
                  <p className="font-[var(--font-secondary)] text-sm font-light leading-relaxed text-[#0F172A]/55 dark:text-[#F5F7FA]/55">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <hr className="border-t border-[var(--foreground)]/10" />
      </div>
    </section>
  );
};

export default Features;
