"use client";

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useIsDark } from "@/hooks/useIsDark";
import {
  DottedMap,
  DOTTED_MAP_VIEW_H,
  DOTTED_MAP_VIEW_W,
  projectMapPoint,
  type Marker,
} from "@/components/ui/DottedMap";
import LazyWhenVisible from "@/components/ui/LazyWhenVisible";

const ORANGE = "#FFA629";
const BLUE = "#809FFF";
const PURPLE = "#8B5CF6";
const YELLOW = "#FFD580";
const GREEN = "#7DD3A0";
const ROSE = "#F472B6";

const FEATURE_ROW_ILLUSTRATION_CLASS =
  "w-[88%] max-w-[88%] mx-auto min-h-[8rem] h-36 sm:min-h-[9rem] sm:h-40";
const FEATURE_ROW_ILLUSTRATION_WRAPPER = "pt-4 pb-8 px-3 sm:px-4";
const FEATURE_ROW_TEXT_CLASS = "px-8 pt-4 pb-8";

const featureIllustrationCardFill = (isDark: boolean) => (isDark ? "#12151A" : "#FFFFFF");

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
  const dashDur = `${1.4 + index * 0.18}s`;
  const motionDur = `${1.6 + index * 0.2}s`;

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
        <animate attributeName="opacity" values="0.28;0;0.28" dur="1.2s" repeatCount="indefinite" />
        <animate attributeName="r" values="1.5;4;1.5" dur="1.2s" repeatCount="indefinite" />
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
  const cardFill = featureIllustrationCardFill(isDark);
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

const SCHEDULE_CARD_HEIGHT = 32;
const SCHEDULE_CARD_GAP = 4;
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
      className={`w-full max-w-[172px] mx-auto rounded-[10px] border px-[10px] pt-[8px] pb-[8px] select-none touch-none ${
        isDark
          ? "border-white/[0.1] bg-[#12151A] shadow-[0_1px_2px_rgba(0,0,0,0.35),0_8px_24px_rgba(0,0,0,0.28)]"
          : "border-[#E2E8F0] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_8px_24px_rgba(15,23,42,0.08)]"
      }`}
    >
      <div className="mb-[6px] flex items-baseline justify-between gap-2">
        <p className="font-[var(--font-secondary)] text-[9px] leading-none">
          <span className={isDark ? "text-[#94A3B8]" : "text-[#64748B]"}>Today, </span>
          <span className={`font-semibold ${isDark ? "text-[#F5F7FA]" : "text-[#0F172A]"}`}>
            {todayLabel.weekday}
          </span>
        </p>
        <span
          className={`font-[var(--font-secondary)] text-[8px] leading-none ${
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
                className="my-[6px] ml-[7px] w-[2px] shrink-0 rounded-full"
                style={{ backgroundColor: theme.accent }}
              />
              <div className="flex min-w-0 flex-col justify-center py-[5px] pl-[6px] pr-[7px]">
                <span
                  className="truncate font-[var(--font-secondary)] text-[9px] font-semibold leading-[1.15]"
                  style={{ color: theme.title }}
                >
                  {lesson.title}
                </span>
                <span
                  className="mt-[1px] font-[var(--font-secondary)] text-[8px] font-normal leading-none"
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
  { id: "eng", label: "English", color: PURPLE, start: 0.16, mid: 0.52, end: 0.82, steepness: 8.5, shift: 0.01 },
  { id: "bio", label: "Bio", color: YELLOW, start: 0.12, mid: 0.46, end: 0.88, steepness: 9.2, shift: 0.05 },
];

const CHART = { left: 12, right: 188, top: 20, bottom: 78 };
const GROWTH_LEGEND_Y = 96;
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
  const sessionBarFill = featureIllustrationCardFill(isDark);

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
  const legendSlotWidth = (CHART.right - CHART.left) / GROWTH_SERIES.length;

  return (
    <svg
      viewBox="0 0 200 120"
      className="w-full h-full select-none"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Student progress chart across four subjects"
    >
      <defs>
        <linearGradient id={`${uid}-area`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={areaAccent} stopOpacity={isDark ? 0.16 : 0.14} />
          <stop offset="100%" stopColor={areaAccent} stopOpacity="0" />
        </linearGradient>
      </defs>

      <text
        x="100"
        y="12"
        textAnchor="middle"
        fontSize="7"
        fontWeight="500"
        fill={headerColor}
        fontFamily="var(--font-secondary), system-ui, sans-serif"
        letterSpacing="0.02em"
      >
        {visibleSeries.length} subjects · Avg {avgScore}%
      </text>

      {Array.from({ length: 5 }, (_, i) => {
        const x = CHART.left + (i / 4) * (CHART.right - CHART.left);
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
            fill={sessionBarFill}
            opacity={1}
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
              strokeWidth={activeId === s.id ? 1.8 : 1.35}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transition: "stroke-width 0.2s ease" }}
            />
            <circle
              cx={last.x}
              cy={last.y}
              r={activeId === s.id ? 2.6 : 2}
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
        const tipW = 46;
        const tipH = 18;
        const tipX = Math.min(last.x - tipW - 4, CHART.right - tipW - 2);
        const tipY = Math.max(last.y - tipH - 6, CHART.top + 2);
        return (
          <g pointerEvents="none">
            <rect
              x={tipX}
              y={tipY}
              width={tipW}
              height={tipH}
              rx="3"
              fill={tooltipBg}
              stroke={tooltipStroke}
              strokeWidth="0.6"
            />
            <text
              x={tipX + tipW / 2}
              y={tipY + 8}
              textAnchor="middle"
              fontSize="6"
              fontWeight="600"
              fill={activeSeries.color}
              fontFamily="system-ui, sans-serif"
            >
              {activeSeries.label}
            </text>
            <text
              x={tipX + tipW / 2}
              y={tipY + 14}
              textAnchor="middle"
              fontSize="5.5"
              fill={headerColor}
              fontFamily="system-ui, sans-serif"
            >
              {activeSeries.score}%
            </text>
          </g>
        );
      })()}

      <g transform={`translate(0, ${GROWTH_LEGEND_Y})`}>
        {seriesData.map((s, i) => {
          const isHidden = hiddenIds.has(s.id);
          const isHovered = hoveredId === s.id;
          const x = CHART.left + i * legendSlotWidth;
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
                y={4}
                width={12}
                height={2.5}
                rx="1.25"
                fill={s.color}
                opacity={isHidden ? 0.25 : isHovered ? 1 : 0.85}
              />
              <text
                x={15}
                y={8}
                fontSize="6"
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

type SubjectDocVariant = "grid" | "lines" | "markdown" | "slides";

const SubjectDocContent = ({
  variant,
  color,
  muted,
  isDark,
}: {
  variant: SubjectDocVariant;
  color: string;
  muted: string;
  isDark: boolean;
}) => {
  const accentSoft = `${color}${isDark ? "55" : "44"}`;
  const accentFill = `${color}${isDark ? "30" : "22"}`;

  switch (variant) {
    case "grid": {
      const gx = 9;
      const gy = 11;
      const cols = 5;
      const rows = 4;
      const cw = 4.8;
      const ch = 5.2;
      return (
        <g>
          {Array.from({ length: rows + 1 }, (_, r) => (
            <line
              key={`h-${r}`}
              x1={gx}
              y1={gy + r * ch}
              x2={gx + cols * cw}
              y2={gy + r * ch}
              stroke={muted}
              strokeWidth="0.5"
            />
          ))}
          {Array.from({ length: cols + 1 }, (_, c) => (
            <line
              key={`v-${c}`}
              x1={gx + c * cw}
              y1={gy}
              x2={gx + c * cw}
              y2={gy + rows * ch}
              stroke={muted}
              strokeWidth="0.5"
            />
          ))}
          <rect x={gx + cw * 2} y={gy + ch} width={cw} height={ch} fill={accentFill} rx="0.5" />
          <rect x={gx + cw * 3} y={gy + ch * 2} width={cw} height={ch} fill={accentSoft} rx="0.5" opacity="0.65" />
        </g>
      );
    }
    case "lines":
      return (
        <g>
          {[0, 1, 2, 3, 4].map((i) => (
            <rect
              key={i}
              x={9}
              y={12 + i * 5.5}
              width={26 - i * 2}
              height="1.6"
              rx="0.8"
              fill={muted}
            />
          ))}
          <circle cx={14} cy={16} r="2.2" fill={accentFill} stroke={color} strokeWidth="0.4" opacity="0.9" />
        </g>
      );
    case "markdown":
      return (
        <g>
          {[
            { y: 12, w: 24, thick: false },
            { y: 17.5, w: 20, thick: false },
            { y: 23, w: 26, thick: true },
            { y: 29, w: 18, thick: false },
            { y: 34.5, w: 22, thick: false },
          ].map((line, i) => (
            <rect
              key={i}
              x={9}
              y={line.y}
              width={line.w}
              height={line.thick ? "2.2" : "1.5"}
              rx="0.75"
              fill={line.thick ? accentSoft : muted}
            />
          ))}
        </g>
      );
    case "slides":
      return (
        <g>
          <rect x={9} y={12} width={26} height={16} rx="1.5" fill={isDark ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.04)"} stroke={muted} strokeWidth="0.4" />
          <circle cx={15} cy={20} r="3.2" fill={accentFill} stroke={color} strokeWidth="0.35" />
          <rect x={20} y={16} width="5" height="5" rx="1" fill={accentSoft} />
          <rect x={20} y={23} width="12" height="1.4" rx="0.7" fill={muted} />
          <rect x={20} y={26} width="9" height="1.4" rx="0.7" fill={muted} />
          <rect x={9} y={32} width={10} height="1.4" rx="0.7" fill={muted} />
          <rect x={9} y={35.5} width={14} height="1.4" rx="0.7" fill={muted} />
        </g>
      );
    default:
      return null;
  }
};

const SUBJECT_CARD_W = 42;
const SUBJECT_CARD_H = 54;

const SubjectDocCard = ({
  x,
  y,
  rotate,
  badge,
  color,
  variant,
  cardFill,
  cardStroke,
  muted,
  isDark,
  badgeShadowId,
}: {
  x: number;
  y: number;
  rotate: number;
  badge: string;
  color: string;
  variant: SubjectDocVariant;
  cardFill: string;
  cardStroke: string;
  muted: string;
  isDark: boolean;
  badgeShadowId: string;
}) => {
  const w = SUBJECT_CARD_W;
  const h = SUBJECT_CARD_H;
  const fold = 7;
  const badgeW = 20;
  const badgeH = 8;
  const badgeX = w - badgeW + 2;
  const badgeY = h - badgeH + 1;

  return (
    <g transform={`translate(${x + w / 2}, ${y + h / 2}) rotate(${rotate}) translate(${-w / 2}, ${-h / 2})`}>
      <rect x={0} y={0} width={w} height={h} rx="5" fill={cardFill} stroke={cardStroke} strokeWidth="0.6" />
      <path
        d={`M${w - fold} 0 L${w} 0 L${w} ${fold} Z`}
        fill={isDark ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.05)"}
        stroke={cardStroke}
        strokeWidth="0.35"
      />
      <SubjectDocContent variant={variant} color={color} muted={muted} isDark={isDark} />
      <g filter={`url(#${badgeShadowId})`}>
        <rect x={badgeX} y={badgeY} width={badgeW} height={badgeH} rx="2.5" fill={color} />
        <text
          x={badgeX + badgeW / 2}
          y={badgeY + badgeH / 2 + 0.5}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="4.5"
          fontWeight="700"
          fill="#F8FAFC"
          fontFamily="var(--font-secondary), system-ui, sans-serif"
          letterSpacing="0.35"
        >
          {badge}
        </text>
      </g>
    </g>
  );
};

const SubjectsIllustration = ({ isDark }: { isDark: boolean }) => {
  const uid = useId().replace(/:/g, "");
  const muted = isDark ? "rgba(255,255,255,0.14)" : "rgba(15,23,42,0.1)";
  const cardFill = featureIllustrationCardFill(isDark);
  const cardStroke = isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)";

  const gapX = 12;
  const gapY = 10;
  const gridW = SUBJECT_CARD_W * 2 + gapX;
  const gridH = SUBJECT_CARD_H * 2 + gapY;
  const originX = (200 - gridW) / 2;
  const originY = (120 - gridH) / 2;

  const subjects: {
    key: string;
    col: number;
    row: number;
    rotate: number;
    badge: string;
    color: string;
    variant: SubjectDocVariant;
    badgeShadowId: string;
  }[] = [
    {
      key: "math",
      col: 0,
      row: 0,
      rotate: -2.5,
      badge: "MTH",
      color: ORANGE,
      variant: "grid",
      badgeShadowId: `${uid}-badge-orange`,
    },
    {
      key: "science",
      col: 1,
      row: 0,
      rotate: 2,
      badge: "SCI",
      color: BLUE,
      variant: "lines",
      badgeShadowId: `${uid}-badge-blue`,
    },
    {
      key: "english",
      col: 0,
      row: 1,
      rotate: -1.5,
      badge: "ENG",
      color: PURPLE,
      variant: "markdown",
      badgeShadowId: `${uid}-badge-purple`,
    },
    {
      key: "history",
      col: 1,
      row: 1,
      rotate: 2.5,
      badge: "HIS",
      color: GREEN,
      variant: "slides",
      badgeShadowId: `${uid}-badge-green`,
    },
  ];

  return (
    <svg viewBox="0 0 200 120" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id={`${uid}-card-shadow`} x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow
            dx="0"
            dy="1.5"
            stdDeviation="2"
            floodColor={isDark ? "#000" : "#0F172A"}
            floodOpacity={isDark ? 0.4 : 0.1}
          />
        </filter>
        <filter id={`${uid}-badge-orange`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor={ORANGE} floodOpacity={isDark ? 0.45 : 0.35} />
        </filter>
        <filter id={`${uid}-badge-blue`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor={BLUE} floodOpacity={isDark ? 0.45 : 0.35} />
        </filter>
        <filter id={`${uid}-badge-purple`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor={PURPLE} floodOpacity={isDark ? 0.45 : 0.35} />
        </filter>
        <filter id={`${uid}-badge-green`} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor={GREEN} floodOpacity={isDark ? 0.45 : 0.35} />
        </filter>
      </defs>

      <g filter={`url(#${uid}-card-shadow)`}>
        {subjects.map((s) => (
          <SubjectDocCard
            key={s.key}
            x={originX + s.col * (SUBJECT_CARD_W + gapX)}
            y={originY + s.row * (SUBJECT_CARD_H + gapY)}
            rotate={s.rotate}
            badge={s.badge}
            color={s.color}
            variant={s.variant}
            cardFill={cardFill}
            cardStroke={cardStroke}
            muted={muted}
            isDark={isDark}
            badgeShadowId={s.badgeShadowId}
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
  len = 10,
}: {
  x: number;
  y: number;
  corner: "tl" | "tr" | "bl" | "br";
  stroke: string;
  len?: number;
}) => {
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
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
};

const VerifiedIllustration = ({ isDark }: { isDark: boolean }) => {
  const uid = useId().replace(/:/g, "");
  const muted = isDark ? "rgba(255,255,255,0.11)" : "rgba(15,23,42,0.09)";
  const accentBar = `${BLUE}${isDark ? "38" : "2A"}`;
  const cardFill = featureIllustrationCardFill(isDark);
  const cardStroke = isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)";
  const frameFill = isDark ? "rgba(255,255,255,0.035)" : "rgba(241,245,249,0.92)";
  const frameStroke = isDark ? "rgba(255,255,255,0.07)" : "rgba(15,23,42,0.06)";
  const bracketStroke = isDark ? "rgba(245,247,250,0.42)" : "rgba(15,23,42,0.3)";
  const scanLine = isDark ? "rgba(245,247,250,0.92)" : "#0F172A";

  const frame = { x: 50, y: 4, w: 100, h: 112, rx: 10 };
  const doc = { x: 62, y: 16, w: 76, h: 88, rx: 6 };
  const bracketInset = 12;
  const scanTop = doc.y + 8;
  const scanBottom = doc.y + doc.h - 8;
  const barH = 2.2;
  const barRx = barH / 2;

  const headerBars = [
    { x: doc.x + 24, y: doc.y + 11, w: 34 },
    { x: doc.x + 24, y: doc.y + 19, w: 22, accent: true },
  ];
  const bodyBars = [
    { y: doc.y + 34, w: 52 },
    { y: doc.y + 42, w: 46 },
    { y: doc.y + 50, w: 54 },
    { y: doc.y + 58, w: 40 },
    { y: doc.y + 66, w: 48 },
    { y: doc.y + 74, w: 44 },
  ];

  return (
    <svg viewBox="0 0 200 120" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id={`${uid}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="1.5"
            stdDeviation="2"
            floodColor={isDark ? "#000" : "#0F172A"}
            floodOpacity={isDark ? 0.38 : 0.09}
          />
        </filter>
        <filter id={`${uid}-edge-glow`} x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`${uid}-line-glow`} x="-10%" y="-400%" width="120%" height="900%">
          <feGaussianBlur stdDeviation="0.6" result="blur" />
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
          <stop offset="38%" stopColor={BLUE} stopOpacity={isDark ? "0.06" : "0.04"} />
          <stop offset="50%" stopColor={BLUE} stopOpacity={isDark ? "0.2" : "0.14"} />
          <stop offset="62%" stopColor={BLUE} stopOpacity={isDark ? "0.06" : "0.04"} />
          <stop offset="100%" stopColor={BLUE} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${uid}-edge-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BLUE} stopOpacity="0" />
          <stop offset="50%" stopColor={BLUE} stopOpacity={isDark ? "0.85" : "0.7"} />
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
          stroke={frameStroke}
          strokeWidth="0.6"
        />

        <ScanCornerBracket
          x={frame.x + bracketInset}
          y={frame.y + bracketInset}
          corner="tl"
          stroke={bracketStroke}
        />
        <ScanCornerBracket
          x={frame.x + frame.w - bracketInset}
          y={frame.y + bracketInset}
          corner="tr"
          stroke={bracketStroke}
        />
        <ScanCornerBracket
          x={frame.x + bracketInset}
          y={frame.y + frame.h - bracketInset}
          corner="bl"
          stroke={bracketStroke}
        />
        <ScanCornerBracket
          x={frame.x + frame.w - bracketInset}
          y={frame.y + frame.h - bracketInset}
          corner="br"
          stroke={bracketStroke}
        />

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

        <circle cx={doc.x + 12} cy={doc.y + 15} r="5.5" fill={accentBar} />
        {headerBars.map((bar, i) => (
          <rect
            key={`hdr-${i}`}
            x={bar.x}
            y={bar.y}
            width={bar.w}
            height={barH}
            rx={barRx}
            fill={bar.accent ? accentBar : muted}
          />
        ))}
        {bodyBars.map((bar, i) => (
          <rect
            key={`body-${i}`}
            x={doc.x + 10}
            y={bar.y}
            width={bar.w}
            height={barH}
            rx={barRx}
            fill={i === 0 ? accentBar : muted}
          />
        ))}

        <g clipPath={`url(#${uid}-doc-clip)`}>
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values={`0,${scanTop}; 0,${scanBottom}; 0,${scanTop}`}
              dur="2.8s"
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
              keyTimes="0; 0.5; 1"
            />
            <rect
              x={frame.x + 2}
              y={-8}
              width={frame.w - 4}
              height={16}
              fill={`url(#${uid}-beam)`}
            />
            <line
              x1={frame.x + 2}
              y1={0}
              x2={frame.x + frame.w - 2}
              y2={0}
              stroke={scanLine}
              strokeWidth="1"
              strokeLinecap="round"
              filter={`url(#${uid}-line-glow)`}
            />
            <rect
              x={doc.x - 1}
              y={-7}
              width={3.5}
              height={14}
              rx="1.5"
              fill={`url(#${uid}-edge-fade)`}
              filter={`url(#${uid}-edge-glow)`}
            />
            <rect
              x={doc.x + doc.w - 2.5}
              y={-7}
              width={3.5}
              height={14}
              rx="1.5"
              fill={`url(#${uid}-edge-fade)`}
              filter={`url(#${uid}-edge-glow)`}
            />
          </g>
        </g>
      </g>
    </svg>
  );
};

/* ─── Instant Connect Illustration (chat) ─── */

type ConnectSender = "tutor" | "student";

type ConnectMessage = {
  id: string;
  from: ConnectSender;
  text: string;
};

const CONNECT_MESSAGES: ConnectMessage[] = [
  { id: "t1", from: "tutor", text: "Hey! Stuck on the worksheet?" },
  { id: "s1", from: "student", text: "Yes — problem 4 is tricky." },
  { id: "t2", from: "tutor", text: "Send a photo — we'll solve it." },
  { id: "s2", from: "student", text: "Just uploaded it 👍" },
];

const CONNECT_AVATAR_R = 6.5;
const CONNECT_ROW_GAP = 6;
const CONNECT_BUBBLE_H = 18;
const CONNECT_BUBBLE_RX = 8;
const CONNECT_PAD_X = 10;
const CONNECT_PAD_Y = 12;
const CONNECT_MESSAGE_MS = 1300;
const CONNECT_HOLD_MS = 2400;
const CONNECT_RESET_MS = 450;

const connectBubbleWidth = (text: string) =>
  Math.min(118, Math.max(48, text.length * 5.1 + 18));

type ConnectBubbleTheme = {
  bg: string;
  border: string;
  text: string;
  avatarFrom: string;
  avatarTo: string;
  avatarRing: string;
};

const connectBubbleThemes = (isDark: boolean): Record<ConnectSender, ConnectBubbleTheme> => {
  const cardStroke = isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)";

  if (isDark) {
    return {
      tutor: {
        bg: featureIllustrationCardFill(true),
        border: cardStroke,
        text: "#F5F7FA",
        avatarFrom: "#C4B5FD",
        avatarTo: "#6D28D9",
        avatarRing: PURPLE,
      },
      student: {
        bg: "rgba(128,159,255,0.16)",
        border: "rgba(128,159,255,0.3)",
        text: "#C7D2FE",
        avatarFrom: "#A5B4FC",
        avatarTo: "#4F6FD8",
        avatarRing: BLUE,
      },
    };
  }

  return {
    tutor: {
      bg: featureIllustrationCardFill(false),
      border: cardStroke,
      text: "#0F172A",
      avatarFrom: "#DDD6FE",
      avatarTo: "#8B5CF6",
      avatarRing: PURPLE,
    },
    student: {
      bg: "#EEF4FF",
      border: "#BFDBFE",
      text: "#2563EB",
      avatarFrom: "#BFDBFE",
      avatarTo: "#6688FF",
      avatarRing: BLUE,
    },
  };
};

const ConnectAvatar = ({
  cx,
  cy,
  theme,
  gradientId,
  isDark,
}: {
  cx: number;
  cy: number;
  theme: ConnectBubbleTheme;
  gradientId: string;
  isDark: boolean;
}) => {
  const skin = isDark ? "rgba(248,250,252,0.88)" : "rgba(255,255,255,0.92)";

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={CONNECT_AVATAR_R}
        fill={`url(#${gradientId})`}
        stroke={theme.avatarRing}
        strokeWidth="0.55"
        opacity={0.95}
      />
      <ellipse cx={cx} cy={cy - 1.2} rx="2.35" ry="2.5" fill={skin} />
      <path
        d={`M ${cx - 2.8} ${cy + 0.6} Q ${cx} ${cy + 2.8} ${cx + 2.8} ${cy + 0.6}`}
        fill={skin}
        opacity={0.5}
      />
    </g>
  );
};

const ConnectChatRow = ({
  message,
  rowY,
  visible,
  theme,
  avatarGradientId,
  isDark,
  font,
}: {
  message: ConnectMessage;
  rowY: number;
  visible: boolean;
  theme: ConnectBubbleTheme;
  avatarGradientId: string;
  isDark: boolean;
  font: string;
}) => {
  const isTutor = message.from === "tutor";
  const bubbleW = connectBubbleWidth(message.text);
  const avatarCx = isTutor
    ? CONNECT_PAD_X + CONNECT_AVATAR_R
    : 200 - CONNECT_PAD_X - CONNECT_AVATAR_R;
  const bubbleY = rowY - CONNECT_BUBBLE_H / 2;
  const bubbleX = isTutor
    ? avatarCx + CONNECT_AVATAR_R + 5
    : avatarCx - CONNECT_AVATAR_R - 5 - bubbleW;
  const textX = isTutor ? bubbleX + 9 : bubbleX + bubbleW - 9;

  const bubble = (
    <>
      <rect
        x={bubbleX}
        y={bubbleY}
        width={bubbleW}
        height={CONNECT_BUBBLE_H}
        rx={CONNECT_BUBBLE_RX}
        fill={theme.bg}
        stroke={theme.border}
        strokeWidth="0.55"
      />
      <text
        x={textX}
        y={rowY + 2}
        textAnchor={isTutor ? "start" : "end"}
        fontSize="6.2"
        fontWeight="500"
        fill={theme.text}
        fontFamily={font}
        dominantBaseline="middle"
      >
        {message.text}
      </text>
    </>
  );

  return (
    <g
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(5px)",
        transition:
          "opacity 0.42s cubic-bezier(0.22, 1, 0.36, 1), transform 0.42s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {isTutor ? (
        <>
          <ConnectAvatar
            cx={avatarCx}
            cy={rowY}
            theme={theme}
            gradientId={avatarGradientId}
            isDark={isDark}
          />
          {bubble}
        </>
      ) : (
        <>
          {bubble}
          <ConnectAvatar
            cx={avatarCx}
            cy={rowY}
            theme={theme}
            gradientId={avatarGradientId}
            isDark={isDark}
          />
        </>
      )}
    </g>
  );
};

const ConnectIllustration = ({ isDark }: { isDark: boolean }) => {
  const uid = useId().replace(/:/g, "");
  const [visibleCount, setVisibleCount] = useState(0);
  const themes = connectBubbleThemes(isDark);
  const font = "var(--font-secondary), system-ui, sans-serif";

  const rowStep = CONNECT_BUBBLE_H + CONNECT_ROW_GAP;
  const rowYs = CONNECT_MESSAGES.map(
    (_, i) => CONNECT_PAD_Y + CONNECT_BUBBLE_H / 2 + i * rowStep
  );

  useEffect(() => {
    let cancelled = false;
    let count = 0;
    let timeoutId = 0;

    const schedule = (delay: number) => {
      timeoutId = window.setTimeout(() => {
        if (cancelled) return;
        if (count >= CONNECT_MESSAGES.length) {
          setVisibleCount(0);
          count = 0;
          schedule(CONNECT_RESET_MS);
          return;
        }
        count += 1;
        setVisibleCount(count);
        const delayMs = count >= CONNECT_MESSAGES.length ? CONNECT_HOLD_MS : CONNECT_MESSAGE_MS;
        schedule(delayMs);
      }, delay);
    };

    schedule(400);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <svg
      viewBox="0 0 200 120"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Student and tutor chat messages appearing one by one"
    >
      <defs>
        <linearGradient id={`${uid}-tutor-avatar`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={themes.tutor.avatarFrom} />
          <stop offset="100%" stopColor={themes.tutor.avatarTo} />
        </linearGradient>
        <linearGradient id={`${uid}-student-avatar`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={themes.student.avatarFrom} />
          <stop offset="100%" stopColor={themes.student.avatarTo} />
        </linearGradient>
      </defs>

      {CONNECT_MESSAGES.map((message, index) => (
        <ConnectChatRow
          key={message.id}
          message={message}
          rowY={rowYs[index]}
          visible={index < visibleCount}
          theme={themes[message.from]}
          avatarGradientId={`${uid}-${message.from}-avatar`}
          isDark={isDark}
          font={font}
        />
      ))}
    </svg>
  );
};

/* ─── Learn From Anywhere Illustration (dotted world map) ─── */

type AnywherePinDef = Marker & { id: string };

const ANYWHERE_PINS: AnywherePinDef[] = [
  { id: "japan", lat: 35.68, lng: 139.69 },
  { id: "africa", lat: 0.5, lng: 25.0 },
  { id: "canada", lat: 43.65, lng: -79.38 },
];

const ANYWHERE_MAP_MARKERS = ANYWHERE_PINS;

const ANYWHERE_CONNECTIONS: {
  id: string;
  from: string;
  to: string;
  color: string;
  bend: number;
}[] = [
  { id: "japan-africa", from: "japan", to: "africa", color: ORANGE, bend: 0.1 },
  { id: "africa-canada", from: "africa", to: "canada", color: PURPLE, bend: 0.17 },
  { id: "japan-canada", from: "japan", to: "canada", color: BLUE, bend: 0.24 },
];

const AnywhereMapPin = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x}, ${y})`}>
    <ellipse cx="0" cy="1.5" rx="5" ry="1.8" fill="rgba(0,0,0,0.14)" />
    <path
      d="M 0 0 C -5.5 -7.5 -8.5 -15 0 -21.5 C 8.5 -15 5.5 -7.5 0 0 Z"
      fill="#FFFFFF"
      stroke="rgba(15,23,42,0.14)"
      strokeWidth="0.65"
      strokeLinejoin="round"
    />
    <circle cx="0" cy="-14.5" r="3.4" fill="rgba(15,23,42,0.12)" />
  </g>
);

const anywhereArcBetween = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  bend: number,
) => {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 - Math.abs(x2 - x1) * bend;
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
};

const AnywhereAnimatedPath = ({
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
  const dashDur = `${1.4 + index * 0.18}s`;
  const motionDur = `${1.6 + index * 0.2}s`;

  return (
    <g>
      <path d={d} fill="none" stroke={trackColor} strokeWidth="2.2" strokeLinecap="round" />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeDasharray="12 12"
        opacity={0.72}
      >
        <animate
          attributeName="stroke-dashoffset"
          values="0;-48"
          dur={dashDur}
          repeatCount="indefinite"
        />
      </path>
      <circle r="5.5" fill={color} opacity={0.92}>
        <animateMotion dur={motionDur} repeatCount="indefinite" path={d} />
      </circle>
      <circle r="7" fill={color} opacity="0">
        <animate attributeName="opacity" values="0.28;0;0.28" dur="1.2s" repeatCount="indefinite" />
        <animate attributeName="r" values="4;11;4" dur="1.2s" repeatCount="indefinite" />
        <animateMotion dur={motionDur} repeatCount="indefinite" path={d} />
      </circle>
    </g>
  );
};

const LearnFromAnywhereIllustration = ({ isDark }: { isDark: boolean }) => {
  const lineMuted = isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)";

  const connections = useMemo(() => {
    const byId = Object.fromEntries(
      ANYWHERE_PINS.map((pin) => [pin.id, projectMapPoint(pin.lat, pin.lng)]),
    );

    return ANYWHERE_CONNECTIONS.map((conn) => {
      const from = byId[conn.from];
      const to = byId[conn.to];
      return {
        id: conn.id,
        color: conn.color,
        d: anywhereArcBetween(from.x, from.y, to.x, to.y, conn.bend),
      };
    });
  }, []);

  return (
    <div
      className="relative h-full w-full"
      role="img"
      aria-label="Global map showing tutors connected across continents"
    >
      <DottedMap isDark={isDark} dotRadius={0.22} className="h-full w-full" />
      <svg
        viewBox={`0 0 ${DOTTED_MAP_VIEW_W} ${DOTTED_MAP_VIEW_H}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
      >
        {connections.map((conn, i) => (
          <AnywhereAnimatedPath
            key={conn.id}
            d={conn.d}
            color={conn.color}
            trackColor={lineMuted}
            index={i}
          />
        ))}
        {ANYWHERE_PINS.map((pin) => {
          const { x, y } = projectMapPoint(pin.lat, pin.lng);
          return <AnywhereMapPin key={pin.id} x={x} y={y} />;
        })}
      </svg>
    </div>
  );
};

/* ─── Session Recordings Illustration (primary → sync → replicas) ─── */

const RecordingSyncIcon = ({ stroke }: { stroke: string }) => (
  <g stroke={stroke} strokeWidth="0.85" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M -3.5 -1 A 4 4 0 1 1 0.5 3.5" />
    <path d="M 0.5 3.5 L 3 3.5 L 0.5 6" />
    <path d="M 3.5 1 A 4 4 0 1 1 -0.5 -3.5" />
    <path d="M -0.5 -3.5 L -3 -3.5 L -0.5 -6" />
  </g>
);

const DatabaseIcon = ({ color }: { color: string }) => (
  <g fill={color} stroke="none" opacity="0.92">
    <ellipse cx="0" cy="-2.8" rx="3.6" ry="1.15" />
    <rect x="-3.6" y="-2.8" width="7.2" height="4.8" />
    <ellipse cx="0" cy="2" rx="3.6" ry="1.15" />
  </g>
);

type RecordingReplicaDef = {
  id: string;
  y: number;
  label: string;
  color: string;
  iconBg: string;
};

const RECORDING_REPLICAS: RecordingReplicaDef[] = [
  {
    id: "replica-1",
    y: 8,
    label: "Replica 1",
    color: BLUE,
    iconBg: "#EEF4FF",
  },
  {
    id: "replica-2",
    y: 45,
    label: "Replica 2",
    color: PURPLE,
    iconBg: "#F5F3FF",
  },
  {
    id: "replica-3",
    y: 82,
    label: "Replica 3",
    color: GREEN,
    iconBg: "#ECFDF5",
  },
];

const SessionRecordingsIllustration = ({ isDark }: { isDark: boolean }) => {
  const cardFill = featureIllustrationCardFill(isDark);
  const cardStroke = isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)";
  const textColor = isDark ? "#F5F7FA" : "#0F172A";
  const lineMuted = isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)";
  const hubIcon = isDark ? "rgba(245,247,250,0.55)" : "rgba(15,23,42,0.45)";
  const font = "var(--font-inter, Inter), sans-serif";

  const primary = { x: 8, y: 40, w: 56, h: 40, rx: 8 };
  const hub = { x: 82, y: 60, r: 11 };
  const hubInset = 16;
  const primaryPath = `M ${primary.x + primary.w} ${hub.y} L ${hub.x - hubInset} ${hub.y}`;
  const replicaLeft = 148;
  const destW = 50;
  const destH = 30;
  const spinDur = "1.8s";

  const replicaIconBg = (color: string, lightBg: string) =>
    isDark ? `${color}${isDark ? "28" : "1A"}` : lightBg;

  return (
    <svg
      viewBox="0 0 200 120"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Session recording replicated to playback destinations"
    >
      <defs>
        <filter id="recording-card-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="1"
            stdDeviation="1.5"
            floodColor={isDark ? "#000" : "#0F172A"}
            floodOpacity={isDark ? 0.35 : 0.08}
          />
        </filter>
      </defs>

      {/* Primary → hub connector (matching-style single path) */}
      <MatchingAnimatedPath d={primaryPath} color={ORANGE} trackColor={lineMuted} index={0} />

      {/* Hub → replica connectors */}
      {RECORDING_REPLICAS.map((replica, i) => (
        <MatchingAnimatedPath
          key={`to-${replica.id}`}
          d={
            i === 0
              ? `M ${hub.x + 14} ${hub.y} C ${hub.x + 30} ${hub.y - 8}, ${replicaLeft - 20} 22, ${replicaLeft} 23`
              : i === 1
                ? `M ${hub.x + 14} ${hub.y} L ${replicaLeft} ${hub.y}`
                : `M ${hub.x + 14} ${hub.y} C ${hub.x + 30} ${hub.y + 8}, ${replicaLeft - 20} 98, ${replicaLeft} 97`
          }
          color={replica.color}
          trackColor={lineMuted}
          index={i + 1}
        />
      ))}

      {/* Primary card */}
      <g filter="url(#recording-card-shadow)">
        <rect
          x={primary.x}
          y={primary.y}
          width={primary.w}
          height={primary.h}
          rx={primary.rx}
          fill={cardFill}
          stroke={cardStroke}
          strokeWidth="0.6"
        />
        <text
          x={primary.x + primary.w / 2}
          y={primary.y + 11.5}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="5.5"
          fontWeight="700"
          fill={textColor}
          letterSpacing="0.5"
          fontFamily={font}
        >
          VIDEO
        </text>
        <g transform={`translate(${primary.x + primary.w / 2}, ${primary.y + 28})`}>
          <circle
            r="7"
            fill={`${ORANGE}${isDark ? "28" : "1A"}`}
            stroke={ORANGE}
            strokeWidth="0.5"
            opacity="0.95"
          />
          <polygon points="-2.2,-3.2 4.2,0 -2.2,3.2" fill={ORANGE} opacity="0.92" />
        </g>
      </g>

      {/* Sync hub */}
      <g filter="url(#recording-card-shadow)">
        <circle
          cx={hub.x}
          cy={hub.y}
          r={hub.r}
          fill={cardFill}
          stroke={cardStroke}
          strokeWidth="0.6"
        />
        <g transform={`translate(${hub.x}, ${hub.y})`}>
          <g>
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 0 0"
              to="360 0 0"
              dur={spinDur}
              repeatCount="indefinite"
            />
            <RecordingSyncIcon stroke={hubIcon} />
          </g>
        </g>
      </g>

      {/* Replica cards */}
      {RECORDING_REPLICAS.map((replica) => {
        const cy = replica.y + destH / 2;

        return (
          <g key={replica.id} filter="url(#recording-card-shadow)">
            <rect
              x={replicaLeft}
              y={replica.y}
              width={destW}
              height={destH}
              rx="3"
              fill={cardFill}
              stroke={cardStroke}
              strokeWidth="0.6"
            />
            <rect
              x={replicaLeft + 6}
              y={replica.y + 8}
              width="10"
              height="10"
              rx="2"
              fill={replicaIconBg(replica.color, replica.iconBg)}
            />
            <g transform={`translate(${replicaLeft + 11}, ${cy})`}>
              <DatabaseIcon color={replica.color} />
            </g>
            <text
              x={replicaLeft + 21}
              y={cy + 1}
              dominantBaseline="middle"
              fontSize="5.8"
              fontWeight="600"
              fill={textColor}
              fontFamily={font}
            >
              {replica.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

/* ─── Transparent Pricing Illustration (payment flow) ─── */

const PRICING_STEP_COUNT = 5;

const PricingCreditCardIcon = ({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    <rect x="0" y="1" width="12" height="8" rx="1.2" fill="none" stroke={ORANGE} strokeWidth="0.75" />
    <line x1="0" y1="3.8" x2="12" y2="3.8" stroke={ORANGE} strokeWidth="0.6" opacity="0.5" />
    <rect x="1.5" y="5.5" width="4" height="2" rx="0.4" fill={ORANGE} opacity="0.3" />
  </g>
);

const PricingReceiptIcon = ({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    <path
      d="M1 0 L11 0 L11 9.5 L9 8.2 L6.5 9.5 L4 8.2 L1 9.5 Z"
      fill="none"
      stroke={PURPLE}
      strokeWidth="0.7"
      strokeLinejoin="round"
    />
    <text x="6" y="5.8" textAnchor="middle" fontSize="3.8" fontWeight="700" fill={PURPLE}>
      $
    </text>
  </g>
);

const PricingIllustration = ({ isDark }: { isDark: boolean }) => {
  const uid = useId().replace(/:/g, "");
  const [activePhase, setActivePhase] = useState(0);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePhase((s) => (s + 1) % PRICING_STEP_COUNT);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  const muted = isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)";
  const cardFill = isDark ? "#12151A" : "#FFFFFF";
  const cardStroke = isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)";
  const textColor = isDark ? "#F5F7FA" : "#0F172A";
  const subtext = isDark ? "rgba(245,247,250,0.45)" : "rgba(15,23,42,0.45)";
  const connectorBase = isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)";
  const connectorActive = isDark ? "#E2E8F0" : "rgba(15,23,42,0.35)";
  const hatchStroke = isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)";
  const font = "var(--font-secondary), system-ui, sans-serif";

  const centerX = 100;
  const topW = 108;
  const topH = 26;
  const topX = centerX - topW / 2;
  const topRx = 4;
  const stackGap = 5;
  const payment = { x: topX, y: 6, w: topW, h: topH, rx: topRx };
  const verified = { x: topX, y: payment.y + topH + stackGap, w: topW, h: topH, rx: topRx };
  const receiptW = 44;
  const receiptH = 48;
  const receipt = {
    x: centerX - receiptW / 2,
    y: verified.y + topH + stackGap,
    w: receiptW,
    h: receiptH,
    rx: topRx,
  };

  const activeStep = activePhase >= 4 ? 2 : Math.floor((activePhase + 1) / 2);
  const isVisible = (index: number) => index <= activeStep;
  const lineVisible = (index: 0 | 1) => activePhase >= (index === 0 ? 1 : 3);

  const stepOpacity = (index: number) => {
    if (isVisible(index)) return 1;
    if (hoveredStep === index) return 0.88;
    return 0.16;
  };

  const stepLift = (index: number) => (hoveredStep === index || activeStep === index ? -1.2 : 0);

  const stepStroke = (index: number) => {
    if (activeStep === index) return isDark ? "rgba(125,211,160,0.45)" : "rgba(61,154,110,0.35)";
    if (hoveredStep === index) return isDark ? "rgba(255,255,255,0.18)" : "rgba(15,23,42,0.14)";
    return cardStroke;
  };

  const goToStep = (index: number) => setActivePhase(index * 2);

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
          <rect x={verified.x} y={verified.y} width="26" height={verified.h} rx={verified.rx} />
        </clipPath>
      </defs>

      {/* Connector: payment → verified */}
      <line
        x1={centerX}
        y1={payment.y + payment.h}
        x2={centerX}
        y2={verified.y}
        stroke={lineVisible(0) ? connectorActive : connectorBase}
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity={lineVisible(0) ? 1 : 0.25}
        style={{ transition: "stroke 0.35s ease, opacity 0.35s ease" }}
      />
      {/* Connector: verified → receipt */}
      <line
        x1={centerX}
        y1={verified.y + verified.h}
        x2={centerX}
        y2={receipt.y}
        stroke={lineVisible(1) ? connectorActive : connectorBase}
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity={lineVisible(1) ? 1 : 0.25}
        style={{ transition: "stroke 0.35s ease, opacity 0.35s ease" }}
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
        <PricingCreditCardIcon x={payment.x + 9} y={payment.y + 6} scale={0.92} />
        <text
          x={payment.x + 26}
          y={payment.y + 12}
          fontSize="6.2"
          fontWeight="700"
          fill={textColor}
          letterSpacing="0.4"
          fontFamily={font}
        >
          PAYMENT
        </text>
        <line
          x1={payment.x + 9}
          y1={payment.y + 16}
          x2={payment.x + payment.w - 9}
          y2={payment.y + 16}
          stroke={muted}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1={payment.x + 9}
          y1={payment.y + 21}
          x2={payment.x + payment.w * 0.55}
          y2={payment.y + 21}
          stroke={muted}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <line
          x1={payment.x + payment.w * 0.6}
          y1={payment.y + 21}
          x2={payment.x + payment.w - 9}
          y2={payment.y + 21}
          stroke={muted}
          strokeWidth="1.6"
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
          <rect x={verified.x} y={verified.y} width="26" height={verified.h} fill={`url(#${uid}-hatch)`} />
        </g>
        <circle
          cx={verified.x + 15}
          cy={verified.y + topH / 2}
          r="5"
          fill={GREEN}
          opacity={activeStep >= 1 ? 1 : 0.55}
          style={{ transition: "opacity 0.35s ease" }}
        />
        <path
          d={`M ${verified.x + 12.5} ${verified.y + topH / 2} L ${verified.x + 14.5} ${verified.y + topH / 2 + 2} L ${verified.x + 18} ${verified.y + topH / 2 - 2.5}`}
          fill="none"
          stroke="#F8FAFC"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          x={verified.x + 28}
          y={verified.y + topH / 2 - 1}
          fontSize="6.5"
          fontWeight="700"
          fill={textColor}
          fontFamily={font}
        >
          Verified
        </text>
        <text x={verified.x + 28} y={verified.y + topH / 2 + 6} fontSize="4.8" fill={subtext} fontFamily={font}>
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
        <PricingReceiptIcon x={receipt.x + 7} y={receipt.y + 6} scale={0.88} />
        <text
          x={receipt.x + receipt.w / 2}
          y={receipt.y + 11}
          textAnchor="middle"
          fontSize="5.5"
          fontWeight="700"
          fill={textColor}
          letterSpacing="0.35"
          fontFamily={font}
        >
          RECEIPT
        </text>
        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1={receipt.x + 7}
            y1={receipt.y + 16 + i * 5}
            x2={receipt.x + receipt.w - 7 - i * 4}
            y2={receipt.y + 16 + i * 5}
            stroke={muted}
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity={activeStep >= 2 ? 1 : 0.55}
            style={{ transition: "opacity 0.35s ease" }}
          />
        ))}
        <rect
          x={receipt.x + 7}
          y={receipt.y + receipt.h - 8}
          width="14"
          height="4"
          rx="2"
          fill={isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)"}
          className="pointer-events-none"
        />
        <rect
          x={receipt.x + receipt.w - 21}
          y={receipt.y + receipt.h - 8}
          width="14"
          height="4"
          rx="2"
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
    illustrationClassName: FEATURE_ROW_ILLUSTRATION_CLASS,
    illustrationWrapperClassName: FEATURE_ROW_ILLUSTRATION_WRAPPER,
  },
  {
    key: "schedule",
    title: "Flexible Scheduling",
    description: "Book sessions when you're sharpest morning or midnight.",
    Illustration: ScheduleIllustration,
    illustrationClassName: `${FEATURE_ROW_ILLUSTRATION_CLASS} flex items-center justify-center`,
    illustrationWrapperClassName: FEATURE_ROW_ILLUSTRATION_WRAPPER,
  },
  {
    key: "progress",
    title: "Track Your Growth",
    description: "Visual analytics for every session, every milestone tracked.",
    Illustration: ProgressIllustration,
    illustrationClassName: FEATURE_ROW_ILLUSTRATION_CLASS,
    illustrationWrapperClassName: FEATURE_ROW_ILLUSTRATION_WRAPPER,
  },
  {
    key: "subjects",
    title: "Every Subject Covered",
    description: "Specialized tutors for math, sciences, languages, and humanities, all here.",
    Illustration: SubjectsIllustration,
    illustrationClassName: FEATURE_ROW_ILLUSTRATION_CLASS,
    illustrationWrapperClassName: FEATURE_ROW_ILLUSTRATION_WRAPPER,
  },
  {
    key: "verified",
    title: "Verified & Vetted Tutors",
    description: "Rigorous background checks and teaching assessments for every tutor.",
    Illustration: VerifiedIllustration,
    illustrationClassName: FEATURE_ROW_ILLUSTRATION_CLASS,
    illustrationWrapperClassName: FEATURE_ROW_ILLUSTRATION_WRAPPER,
  },
  {
    key: "connect",
    title: "Instant Connect",
    description: "Message your tutor and get answers between sessions instantly.",
    Illustration: ConnectIllustration,
    illustrationClassName: FEATURE_ROW_ILLUSTRATION_CLASS,
    illustrationWrapperClassName: FEATURE_ROW_ILLUSTRATION_WRAPPER,
  },
  {
    key: "devices",
    title: "Learn From Anywhere",
    description: "Connect with tutors across the globe sessions from any timezone, any location.",
    Illustration: LearnFromAnywhereIllustration,
    illustrationClassName: FEATURE_ROW_ILLUSTRATION_CLASS,
    illustrationWrapperClassName: FEATURE_ROW_ILLUSTRATION_WRAPPER,
  },
  {
    key: "resources",
    title: "Session Recordings",
    description: "Every session recorded and available with shared notes and resources.",
    Illustration: SessionRecordingsIllustration,
    illustrationClassName: FEATURE_ROW_ILLUSTRATION_CLASS,
    illustrationWrapperClassName: FEATURE_ROW_ILLUSTRATION_WRAPPER,
  },
  {
    key: "pricing",
    title: "Transparent Pricing",
    description: "No hidden fees clear, affordable rates for every session.",
    Illustration: PricingIllustration,
    illustrationClassName: FEATURE_ROW_ILLUSTRATION_CLASS,
    illustrationWrapperClassName: FEATURE_ROW_ILLUSTRATION_WRAPPER,
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
                    <LazyWhenVisible
                      className="h-full w-full"
                      placeholderClassName="h-full w-full"
                    >
                      <Ill isDark={isDark} />
                    </LazyWhenVisible>
                  </div>
                </div>
                <div
                  className={
                    feat.illustrationWrapperClassName === FEATURE_ROW_ILLUSTRATION_WRAPPER
                      ? FEATURE_ROW_TEXT_CLASS
                      : "px-8 pb-8"
                  }
                >
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
