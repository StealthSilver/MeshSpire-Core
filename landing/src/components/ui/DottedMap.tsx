"use client";

import * as React from "react";
import DottedMapLib from "dotted-map";

import { cn } from "@/lib/utils";

export const DOTTED_MAP_VIEW_W = 800;
export const DOTTED_MAP_VIEW_H = 400;
const LEGACY_VIEW_W = 200;

export interface Marker {
  lat: number;
  lng: number;
  size?: number;
  pulse?: boolean;
  color?: string;
}

type MapMarker<M extends Marker> = M & { x: number; y: number };

export function projectMapPoint(lat: number, lng: number) {
  const x = (lng + 180) * (DOTTED_MAP_VIEW_W / 360);
  const y = (90 - lat) * (DOTTED_MAP_VIEW_H / 180);
  return { x, y };
}

export interface DottedMapProps<M extends Marker = Marker>
  extends React.HTMLAttributes<HTMLDivElement> {
  markers?: M[];
  isDark?: boolean;
  dotColor?: string;
  markerColor?: string;
  dotRadius?: number;
  pulse?: boolean;
}

export function DottedMap<M extends Marker = Marker>({
  markers = [],
  isDark,
  dotColor,
  markerColor = "#FFA629",
  dotRadius = 0.22,
  pulse = false,
  className,
  style,
  ...divProps
}: DottedMapProps<M>) {
  const [mounted, setMounted] = React.useState(false);
  const markerScale = DOTTED_MAP_VIEW_W / LEGACY_VIEW_W;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const processedMarkers = React.useMemo(
    () =>
      markers.map((marker) => {
        const { x, y } = projectMapPoint(marker.lat, marker.lng);
        return { ...marker, x, y };
      }),
    [markers],
  );

  const svgMap = React.useMemo(() => {
    const map = new DottedMapLib({ height: 100, grid: "diagonal" });
    const fallbackColor = isDark ? "rgba(245,247,250,0.28)" : "rgba(15,23,42,0.22)";
    const color = dotColor ?? fallbackColor;

    return map.getSVG({
      radius: dotRadius,
      color,
      shape: "circle",
      backgroundColor: "transparent",
    });
  }, [dotColor, dotRadius, isDark]);

  return (
    <div
      className={cn("relative aspect-[2/1] h-full w-full", className)}
      style={style}
      {...divProps}
    >
      {mounted ? (
        // eslint-disable-next-line @next/next/no-img-element -- inline SVG data URL from dotted-map
        <img
          src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
          alt=""
          draggable={false}
          aria-hidden
          className="pointer-events-none h-full w-full select-none [mask-image:linear-gradient(to_bottom,transparent,white_12%,white_88%,transparent)]"
        />
      ) : (
        <div
          aria-hidden
          className="pointer-events-none h-full w-full select-none [mask-image:linear-gradient(to_bottom,transparent,white_12%,white_88%,transparent)]"
        />
      )}

      <svg
        viewBox={`0 0 ${DOTTED_MAP_VIEW_W} ${DOTTED_MAP_VIEW_H}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full select-none"
      >
        {processedMarkers.map((marker, index) => {
          const { x, y } = marker;
          const r = (marker.size ?? dotRadius) * markerScale;
          const shouldPulse = pulse
            ? marker.pulse !== false
            : marker.pulse === true;
          const pulseTo = r * 2.8;
          const pulseOffset = `${((index * 0.41) % 1.4).toFixed(2)}s`;
          const pulseOffsetInner = `${((index * 0.41 + 0.7) % 1.4).toFixed(2)}s`;
          const fill = marker.color ?? markerColor;

          return (
            <g key={`${marker.lat}-${marker.lng}-${index}`}>
              <circle cx={x} cy={y} r={r} fill={fill} />
              {shouldPulse ? (
                <g>
                  <circle
                    cx={x}
                    cy={y}
                    r={r}
                    fill="none"
                    stroke={fill}
                    strokeOpacity={1}
                    strokeWidth={0.35}
                  >
                    <animate
                      attributeName="r"
                      values={`${r};${pulseTo}`}
                      dur="1.4s"
                      begin={pulseOffset}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="1;0"
                      dur="1.4s"
                      begin={pulseOffset}
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle
                    cx={x}
                    cy={y}
                    r={r}
                    fill="none"
                    stroke={fill}
                    strokeOpacity={0.9}
                    strokeWidth={0.3}
                  >
                    <animate
                      attributeName="r"
                      values={`${r};${pulseTo}`}
                      dur="1.4s"
                      begin={pulseOffsetInner}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.9;0"
                      dur="1.4s"
                      begin={pulseOffsetInner}
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export type { MapMarker };
