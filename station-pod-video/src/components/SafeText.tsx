import type {CSSProperties} from "react";

const FONT_FAMILY = "'Hiragino Kaku Gothic ProN', 'Yu Gothic', sans-serif";

const glyphWidth = (character: string): number => {
  if (/[0-9]/.test(character)) return 0.68;
  if (/[.,:]/.test(character)) return 0.38;
  if (/[A-Za-z]/.test(character)) return 0.62;
  return 1.05;
};

const estimateTextWidth = (text: string, fontSize: number): number =>
  [...text].reduce((sum, character) => sum + glyphWidth(character) * fontSize, 0);

const fittedValueSize = ({
  value,
  unit,
  maxWidth,
  preferredSize,
  unitSize,
  gap,
}: {
  value: string;
  unit: string;
  maxWidth: number;
  preferredSize: number;
  unitSize: number;
  gap: number;
}): number => {
  const unitWidth = estimateTextWidth(unit, unitSize);
  const valueWidth = estimateTextWidth(value, preferredSize);
  const available = Math.max(1, maxWidth - unitWidth - (unit ? gap : 0));
  return Math.max(48, Math.min(preferredSize, preferredSize * available / Math.max(1, valueWidth)));
};

type MetricRowProps = {
  layoutId: string;
  label?: string;
  value: string;
  unit?: string;
  maxWidth?: number;
  valueSize?: number;
  unitSize?: number;
  accent?: string;
  align?: CSSProperties["alignItems"];
  style?: CSSProperties;
};

export const MetricRow: React.FC<MetricRowProps> = ({
  layoutId,
  label,
  value,
  unit = "",
  maxWidth = 760,
  valueSize = 220,
  unitSize = 54,
  accent = "#D2A451",
  align = "flex-start",
  style,
}) => {
  const gap = Math.max(18, Math.round(unitSize * 0.4));
  const safeValueSize = fittedValueSize({
    value,
    unit,
    maxWidth,
    preferredSize: valueSize,
    unitSize,
    gap,
  });

  return (
    <div
      data-layout-box={layoutId}
      style={{
        width: maxWidth,
        maxWidth,
        display: "flex",
        flexDirection: "column",
        alignItems: align,
        fontFamily: FONT_FAMILY,
        ...style,
      }}
    >
      {label ? (
        <div
          style={{
            marginBottom: 16,
            color: "rgba(242,241,234,0.68)",
            fontSize: 30,
            fontWeight: 700,
            lineHeight: 1.25,
          }}
        >
          {label}
        </div>
      ) : null}
      <div
        style={{
          maxWidth,
          display: "inline-flex",
          alignItems: "baseline",
          columnGap: gap,
          whiteSpace: "nowrap",
          lineHeight: 0.92,
        }}
      >
        <span
          style={{
            color: "#F2F1EA",
            fontSize: safeValueSize,
            fontWeight: 800,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: -safeValueSize * 0.035,
          }}
        >
          {value}
        </span>
        {unit ? (
          <span
            style={{
              flexShrink: 0,
              color: accent,
              fontSize: unitSize,
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            {unit}
          </span>
        ) : null}
      </div>
    </div>
  );
};

type SvgMetricProps = {
  layoutId: string;
  x: number;
  y: number;
  label?: string;
  value: string;
  unit?: string;
  maxWidth?: number;
  valueSize?: number;
  unitSize?: number;
  accent?: string;
  opacity?: number;
};

export const SvgMetric: React.FC<SvgMetricProps> = ({
  layoutId,
  x,
  y,
  label,
  value,
  unit = "",
  maxWidth = 760,
  valueSize = 220,
  unitSize = 54,
  accent = "#D2A451",
  opacity = 1,
}) => {
  const gap = Math.max(18, Math.round(unitSize * 0.4));
  const safeValueSize = fittedValueSize({
    value,
    unit,
    maxWidth,
    preferredSize: valueSize,
    unitSize,
    gap,
  });

  return (
    <g opacity={opacity}>
      {label ? (
        <text
          data-layout-box={`${layoutId}-label`}
          x={x}
          y={y}
          fill="rgba(242,241,234,0.68)"
          fontFamily={FONT_FAMILY}
          fontSize="30"
          fontWeight="700"
        >
          {label}
        </text>
      ) : null}
      <text
        data-layout-box={`${layoutId}-value`}
        x={x}
        y={y + safeValueSize + 26}
        fill="#F2F1EA"
        fontFamily={FONT_FAMILY}
        fontSize={safeValueSize}
        fontWeight="800"
        letterSpacing={-safeValueSize * 0.035}
      >
        <tspan>{value}</tspan>
        {unit ? (
          <tspan dx={gap} fill={accent} fontSize={unitSize} letterSpacing="0">
            {unit}
          </tspan>
        ) : null}
      </text>
    </g>
  );
};
