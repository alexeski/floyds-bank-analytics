import type { CSSProperties, ReactNode } from "react";
import {
  CHART_SPECS,
  KPI_SPECS,
  LOB_ROWS,
  LOB_SPEC,
  SIGNAL_SPECS,
  SIGNALS_SPEC,
  type WidgetKind,
  type WidgetSpec,
} from "@/lib/overview/spec";

/**
 * The Overview page before live data is connected: a design-spec canvas in
 * the same grid as the live widgets. Each frame says what its widget will
 * show and the data it needs; when getOverviewData() returns live figures,
 * the real widgets replace the frames.
 */

/** Annotation colour: the "designer's redline", distinct from the brand greens. */
const INK = "#6d3fd1";
const WIRE = "#c3cac6";

const rise = (step: number): CSSProperties => ({ ["--rise-delay" as string]: `${step * 60}ms` });

export default function OverviewSpec() {
  return (
    <div className="rounded-2xl border border-dashed border-[#cdbdf3] bg-[#fbfaff] bg-[radial-gradient(circle,#e4dcfa_1px,transparent_1px)] [background-size:18px_18px] p-3 sm:p-5">
      <section aria-label="Headline metrics (spec)" className="mt-3 grid gap-x-4 gap-y-7 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_SPECS.map((spec, i) => (
          <SpecFrame key={spec.id} spec={spec} step={i + 1} compact />
        ))}
      </section>

      <div className="mt-8 grid gap-x-6 gap-y-8 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
        {CHART_SPECS.slice(0, 2).map((spec, i) => (
          <SpecFrame key={spec.id} spec={spec} step={i + 5} />
        ))}
      </div>

      <div className="mt-8 grid gap-x-6 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
        {CHART_SPECS.slice(2).map((spec, i) => (
          <SpecFrame key={spec.id} spec={spec} step={i + 7} />
        ))}
      </div>

      <div className="mt-8">
        <SpecFrame spec={LOB_SPEC} step={10}>
          <LobTable />
        </SpecFrame>
      </div>
    </div>
  );
}

function SpecFrame({
  spec,
  step,
  compact = false,
  children,
}: {
  spec: WidgetSpec;
  step: number;
  compact?: boolean;
  children?: ReactNode;
}) {
  return (
    <section
      aria-label={`${spec.id}: ${spec.title} (spec)`}
      style={rise(step)}
      className="motion-rise relative flex min-w-0 flex-col rounded-xl border-2 border-dashed border-[#cdbdf3] bg-white/95 p-4 sm:p-5"
    >
      {/* Frame label, as in a design tool. */}
      <span
        className="absolute -top-2.5 left-4 rounded px-1.5 py-px font-mono text-[10px] font-bold tracking-wide text-white"
        style={{ background: INK }}
      >
        {spec.id}
      </span>
      <span className="absolute -top-2.5 right-4 inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-px text-[10px] font-semibold text-muted ring-1 ring-[#e1d6fb]">
        <span className="size-1.5 animate-pulse rounded-full" style={{ background: INK }} />
        Awaiting data
      </span>
      <h3 className="font-bold tracking-tight text-ink">{spec.title}</h3>
      <p className="mt-1 text-sm text-muted italic">&ldquo;{spec.question}&rdquo;</p>

      {children ?? (
        <div className={compact ? "mt-3" : "mt-4"}>
          <Wireframe kind={spec.kind} />
        </div>
      )}

      <dl className="mt-4 space-y-2 border-t border-dashed border-line pt-3 text-xs">
        <div className="flex gap-2">
          <dt className="w-12 shrink-0 font-mono font-semibold uppercase" style={{ color: INK }}>
            Data
          </dt>
          <dd className="text-ink">
            {spec.data.length === 1 ? (
              spec.data[0]
            ) : (
              <ul className="space-y-0.5">
                {spec.data.map((line) => (
                  <li key={line}>· {line}</li>
                ))}
              </ul>
            )}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-12 shrink-0 font-mono font-semibold uppercase" style={{ color: INK }}>
            Slice
          </dt>
          <dd className="text-ink">
            {spec.slice}
            <span className="text-muted">
              {" "}
              · {spec.regionFilter ? "follows the region filter" : "ignores the region filter"}
            </span>
          </dd>
        </div>
      </dl>
      {spec.note && (
        <p className="mt-3 rounded-md border-l-2 border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-950">
          {spec.note}
        </p>
      )}
    </section>
  );
}

/** Grey wireframes, one per widget kind, annotated in the redline colour. */
function Wireframe({ kind }: { kind: WidgetKind }) {
  const common = { fill: "none", stroke: WIRE, strokeWidth: 2, strokeLinecap: "round" as const };
  switch (kind) {
    case "kpi":
      return (
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[26px] leading-none font-extrabold tracking-tight text-[#b9c1bc]">$ —.— B</p>
            <p className="mt-2 text-xs font-bold text-[#b9c1bc]">▲ —.—%</p>
          </div>
          <svg viewBox="0 0 112 48" className="h-12 w-28" aria-hidden>
            <path d="M4 38 C 20 34, 28 36, 40 28 S 64 26, 76 18 S 98 12, 108 8" {...common} strokeDasharray="4 4" />
            <circle cx="108" cy="8" r="3" fill={INK} />
          </svg>
        </div>
      );
    case "kpi-split":
      return (
        <div>
          <p className="text-[26px] leading-none font-extrabold tracking-tight text-[#b9c1bc]">—— K</p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-[#9aa39e]">
            <span>Avg score <b className="block text-base text-[#b9c1bc]">———</b></span>
            <span>Products each <b className="block text-base text-[#b9c1bc]">—.——</b></span>
          </div>
        </div>
      );
    case "line":
      return (
        <svg viewBox="0 0 480 180" className="h-auto w-full" aria-hidden>
          {[30, 75, 120, 165].map((y) => (
            <line key={y} x1="28" x2="472" y1={y} y2={y} stroke="#eef0ee" strokeWidth="1" />
          ))}
          <line x1="28" x2="472" y1="120" y2="120" stroke={INK} strokeWidth="1" strokeDasharray="3 4" />
          <text x="32" y="138" fontSize="11" fill={INK} fontFamily="var(--font-mono)">
            index = 100
          </text>
          <path d="M28 120 C 120 110, 200 92, 280 70 S 420 34, 472 26" {...common} strokeWidth={2.5} />
          <path d="M28 120 C 120 118, 200 104, 300 96 S 420 88, 472 82" {...common} strokeDasharray="6 5" />
          <path d="M28 120 C 120 124, 220 120, 320 116 S 420 110, 472 108" {...common} strokeDasharray="2 5" />
          {["Savings", "Cards", "Checking"].map((label, i) => (
            <text key={label} x="40" y="168" dx={i * 96} fontSize="11" fill="#9aa39e">
              ● {label}
            </text>
          ))}
        </svg>
      );
    case "bars":
      return (
        <div className="space-y-3.5" aria-hidden>
          {[
            [44, 56],
            [36, 44],
            [34, 46],
            [28, 40],
            [26, 30],
          ].map(([a, b], i) => {
            const hot = i === 1;
            return (
              <div key={i}>
                <div className="flex justify-between">
                  <span className="h-2 w-16 rounded-full bg-[#e6e9e7]" />
                  <span className="h-2 w-12 rounded-full bg-[#e6e9e7]" />
                </div>
                <div className="mt-1.5 flex h-2.5 gap-0.5">
                  <span className="rounded-l-full" style={{ width: `${a}%`, background: hot ? "#c4b2f2" : "#d6dbd8" }} />
                  <span className="rounded-r-full" style={{ width: `${b}%`, background: hot ? "#d9cdf7" : "#e6e9e7" }} />
                </div>
              </div>
            );
          })}
          <p className="font-mono text-[11px]" style={{ color: INK }}>
            checking | savings · selected region highlighted
          </p>
        </div>
      );
    case "hbars":
      return (
        <div className="space-y-3" aria-hidden>
          {[92, 74, 51, 33, 22, 14].map((w) => (
            <div key={w}>
              <div className="flex justify-between">
                <span className="h-2 w-24 rounded-full bg-[#e6e9e7]" />
                <span className="h-2 w-10 rounded-full bg-[#e6e9e7]" />
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-surface">
                <div className="h-full rounded-full bg-[#d6dbd8]" style={{ width: `${w}%` }} />
              </div>
            </div>
          ))}
        </div>
      );
    case "columns":
      return (
        <svg viewBox="0 0 300 180" className="h-auto w-full" aria-hidden>
          {[54, 82, 104, 120, 132, 140].map((h, i) => (
            <g key={i}>
              <rect x={14 + i * 48} y={150 - h} width="32" height={h} rx="4" fill="#dfe3e0" />
              <rect x={18 + i * 48} y="160" width="24" height="6" rx="3" fill="#e6e9e7" />
            </g>
          ))}
          <text x="14" y="14" fontSize="11" fill={INK} fontFamily="var(--font-mono)">
            avg per customer
          </text>
        </svg>
      );
    case "stacked":
      return (
        <div aria-hidden>
          <div className="flex h-4 gap-0.5 overflow-hidden rounded-full">
            {[
              [8, "#eef0ee"],
              [17, "#e2e6e3"],
              [33, "#d3d9d5"],
              [27, "#c3cac6"],
              [15, "#b2bab5"],
            ].map(([w, c]) => (
              <span key={c} style={{ width: `${w}%`, background: c as string }} />
            ))}
          </div>
          <ul className="mt-4 space-y-2.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <li key={i} className="flex items-center gap-2.5">
                <span className="size-3 rounded-sm bg-[#d6dbd8]" />
                <span className="h-2 flex-1 rounded-full bg-[#eef0ee]" />
                <span className="h-2 w-8 rounded-full bg-[#e6e9e7]" />
              </li>
            ))}
          </ul>
        </div>
      );
    default:
      return null;
  }
}

/** The Signals list's spec (SIG-01 to SIG-04), shown in the Signals column until data is live. */
export function SignalsSpec() {
  return (
    <SpecFrame spec={SIGNALS_SPEC} step={11}>
      <SignalTable />
    </SpecFrame>
  );
}

function SignalTable() {
  return (
    <ul className="mt-4 divide-y divide-dashed divide-line text-xs">
      {SIGNAL_SPECS.map((signal) => (
        <li key={signal.id} className="grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[4.5rem_minmax(0,1fr)]">
          <span className="font-mono font-bold" style={{ color: INK }}>
            {signal.id}
          </span>
          <div className="min-w-0 space-y-1">
            <p className="font-semibold text-ink">
              {signal.name} <span className="font-normal text-muted">· {signal.area}</span>
            </p>
            <p className="text-ink">
              <span className="text-muted">Title </span>
              {signal.title}
            </p>
            <p className="text-ink">
              <span className="text-muted">Detail </span>
              {signal.detail}
            </p>
            <p className="text-ink">
              <span className="text-muted">Tone </span>
              {signal.tone}
            </p>
            <p className="text-ink">
              <span className="font-mono font-semibold uppercase" style={{ color: INK }}>Data </span>
              {signal.data}
              <span className="text-muted">
                {" "}
                · {signal.regionFilter ? "follows the region filter" : "ignores the region filter"}
              </span>
            </p>
            <p className="text-ink">
              <span className="text-muted">Ask Scout </span>&ldquo;{signal.question}&rdquo;
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function LobTable() {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-xs">
        <thead>
          <tr className="border-b border-line text-muted">
            <th className="py-2 pr-3 font-mono font-semibold uppercase" style={{ color: INK }}>ID</th>
            <th className="py-2 pr-3 font-semibold">Card</th>
            <th className="py-2 pr-3 font-semibold">Customer count</th>
            <th className="py-2 pr-3 font-semibold">Headline figure</th>
            <th className="py-2 font-semibold">Footer</th>
          </tr>
        </thead>
        <tbody>
          {LOB_ROWS.map((row) => (
            <tr key={row.id} className="border-b border-dashed border-line last:border-0">
              <td className="py-2 pr-3 font-mono font-bold" style={{ color: INK }}>{row.id}</td>
              <td className="py-2 pr-3 font-semibold text-ink">{row.line}</td>
              <td className="py-2 pr-3 text-ink">{row.customers}</td>
              <td className="py-2 pr-3 text-ink">{row.metric}</td>
              <td className="py-2 text-muted">{row.footer}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
