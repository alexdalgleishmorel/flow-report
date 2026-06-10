import { IonIcon } from '@ionic/react';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { logEvent } from '../../analytics';
import { getTimeString, useData } from '../../dataContext';
import { DayReport, VMAX, VMIN, buildDayReport, isNow, isSun } from './dayReport';

import './flowTheme.css';
import './DayDetail.css';

const VOL_TICKS = [15, 20, 25, 30, 35, 40, 45, 50];
const SURF_LO = 25;
const SURF_HI = 35;

function useSize(ref: React.RefObject<HTMLElement>) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      setSize({ w: rect.width, h: rect.height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [ref]);
  return size;
}

interface ChartProps {
  report: DayReport;
  w: number;
  h: number;
  twelveHour: boolean;
}

function Chart({ report, w, h, twelveHour }: ChartProps) {
  const compact = w < 520;
  const padL = compact ? 36 : 56, padR = compact ? 12 : 26, padT = 18, padB = 34;
  const x0 = padL, x1 = w - padR, y0 = padT, y1 = h - padB;
  const plotW = x1 - x0;
  const plotH = y1 - y0;
  const slot = plotW / 24;
  // hour labels scale with the slot so all 24 fit without colliding
  const hourFont = Math.min(9.5, Math.max(6, slot * 0.62));
  const cx = (i: number) => x0 + slot * (i + 0.5);
  const yVol = (v: number) =>
    y1 - ((Math.max(VMIN, Math.min(VMAX, v)) - VMIN) / (VMAX - VMIN)) * plotH;

  // the faded line segment covers exactly the recorded readings; the rest
  // of the line is forecast at full opacity
  const lastRecorded = report.recorded.lastIndexOf(true);
  const recordedUntil = lastRecorded >= 0 ? lastRecorded : null;
  const bandTop = yVol(SURF_HI);
  const bandBot = yVol(SURF_LO);

  const [hover, setHover] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const moveTo = (clientX: number) => {
    const el = svgRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const hour = Math.round((clientX - rect.left - x0) / slot - 0.5);
    setHover(Math.max(0, Math.min(23, hour)));
  };

  // Rippling-water animation: a traveling wobble of two superimposed sines
  // added to the base flow value, redrawn every frame by setting the path's
  // "d" directly (not React state). Static when reduced motion is preferred.
  const flowRef = useRef<SVGPathElement>(null);
  const flowPastRef = useRef<SVGPathElement>(null);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const values = report.values.map((v) => v ?? VMIN);
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const baseY = (x: number) => {
      let hf = (x - x0) / slot - 0.5;
      hf = Math.max(0, Math.min(23, hf));
      const i = Math.floor(hf);
      const f = hf - i;
      return yVol(lerp(values[i], values[Math.min(23, i + 1)], f));
    };
    const build = (xa: number, xb: number, t: number) => {
      let d = '';
      for (let x = xa; x <= xb + 0.01; x += 3) {
        const ripple = reduce
          ? 0
          : 2.1 * Math.sin(x * 0.15 - t * 2.1) + 1.05 * Math.sin(x * 0.29 + t * 3.0);
        d += (d === '' ? 'M' : 'L') + x.toFixed(1) + ',' + (baseY(x) + ripple).toFixed(1);
      }
      return d;
    };
    const xStart = cx(0);
    const xEnd = cx(23);
    const xMid = recordedUntil != null ? cx(recordedUntil) : null;
    let raf: number | undefined;
    const frame = () => {
      const t = performance.now() / 1000;
      if (xMid != null) {
        flowPastRef.current?.setAttribute('d', build(xStart, xMid, t));
        flowRef.current?.setAttribute('d', build(xMid, xEnd, t));
      } else {
        flowRef.current?.setAttribute('d', build(xStart, xEnd, t));
      }
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    frame();
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w, h, report]);

  const fmtRange = (hour: number): string => {
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    const from = getTimeString(date, twelveHour);
    date.setHours(date.getHours() + 1);
    return `${from} – ${getTimeString(date, twelveHour)}`;
  };

  const hoverValue = hover != null ? report.values[hover] : null;
  const hoverTemp = hover != null ? report.temps[hover] : null;
  const tipLeft = hover != null ? Math.max(88, Math.min(w - 88, cx(hover))) : 0;

  // The band label sits above the flow line in the z-order with a solid
  // card-colored backing, so the (same-colored) line hides behind it
  // instead of blurring through the text.
  const labelRef = useRef<SVGTextElement>(null);
  const [labelBox, setLabelBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  useLayoutEffect(() => {
    const box = labelRef.current?.getBBox();
    if (box) setLabelBox({ x: box.x, y: box.y, width: box.width, height: box.height });
  }, [w, h]);

  return (
    <>
      <svg
        ref={svgRef}
        className="frd-chart"
        width={w}
        height={h}
        onMouseMove={(e) => moveTo(e.clientX)}
        onMouseLeave={() => setHover(null)}
        onTouchStart={(e) => moveTo(e.touches[0].clientX)}
        onTouchMove={(e) => moveTo(e.touches[0].clientX)}
        onTouchEnd={() => setHover(null)}
      >
        <rect x="0" y="0" width={w} height={h} fill="transparent" />
        {VOL_TICKS.map((tick) => (
          <g key={tick}>
            <line className="frd-grid" x1={x0} x2={x1} y1={yVol(tick)} y2={yVol(tick)} />
            <text className="frd-axl" x={x0 - 10} y={yVol(tick)} dominantBaseline="middle" textAnchor="end">
              {tick}
            </text>
          </g>
        ))}

        {/* surfable band: 25–35 m³/s */}
        <rect className="frd-band" x={x0} y={bandTop} width={plotW} height={bandBot - bandTop} />
        <line className="frd-bandline" x1={x0} x2={x1} y1={bandTop} y2={bandTop} />
        <line className="frd-bandline" x1={x0} x2={x1} y1={bandBot} y2={bandBot} />

        {recordedUntil != null && <path ref={flowPastRef} className="frd-flowline is-past" d="" />}
        <path ref={flowRef} className="frd-flowline" d="" />

        {labelBox && (
          <rect
            className="frd-bandlabel-bg"
            x={labelBox.x - 6}
            y={labelBox.y - 4}
            width={labelBox.width + 12}
            height={labelBox.height + 8}
            rx="6"
          />
        )}
        <text ref={labelRef} className="frd-bandlabel" x={x0 + 9} y={bandTop - 7}>
          Surfable window · 25–35 m³/s
        </text>

        {report.nowHour != null && (
          <line className="frd-nowline" x1={cx(report.nowHour)} x2={cx(report.nowHour)} y1={y0} y2={y1} />
        )}

        {hover != null && hoverValue != null && (
          <>
            <line className="frd-hoverline" x1={cx(hover)} x2={cx(hover)} y1={y0} y2={y1} />
            <circle className="frd-hoverdot" cx={cx(hover)} cy={yVol(hoverValue)} r="4" />
          </>
        )}

        {report.values.map((_, hour) => (
          <text
            key={hour}
            className={`frd-xl${isSun(report, hour) ? ' is-sun' : ''}${isNow(report, hour) ? ' is-now' : ''}${hover === hour ? ' is-hl' : ''}`}
            x={cx(hour)}
            y={y1 + 18}
            textAnchor="middle"
            style={{ fontSize: hourFont }}
          >
            {hour}
          </text>
        ))}

        <text className="frd-axtitle" transform={`translate(15,${(y0 + y1) / 2}) rotate(-90)`} textAnchor="middle">
          Volume (m³/s)
        </text>
      </svg>

      {hover != null && hoverValue != null && (
        <div className="frd-tip" style={{ left: tipLeft, top: y0 + 2 }}>
          <div className="frd-tip-time">{fmtRange(hover)}</div>
          <div className="frd-tip-row">
            <span className="frd-tip-k">{report.recorded[hover] ? 'Recorded' : 'Forecast'}</span>
            <span className="frd-tip-v flow">{Math.round(hoverValue)} m³/s</span>
          </div>
          {hoverTemp != null && (
            <div className="frd-tip-row">
              <span className="frd-tip-k">Air temp</span>
              <span className="frd-tip-v temp">{hoverTemp.toFixed(1)} °C</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export function DayDetail() {
  const { flowData, historicalFlowData, selectedIndex, setSelectedIndex, twelveHour, stateUpdate } = useData();
  const data = flowData[selectedIndex];
  const report = useMemo(
    () => buildDayReport(data, historicalFlowData),
    // stateUpdate re-derives nowHour/pastUntil on the hourly tick
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, historicalFlowData, stateUpdate]
  );

  const boxRef = useRef<HTMLDivElement>(null);
  const { w, h } = useSize(boxRef);

  const navigate = (index: number) => {
    setSelectedIndex(index);
    logEvent('navigate_day_detail', 'flow_view', `index_${index}`);
  };

  return (
    <div className="fr-scope fr-detail frd-app">
      <div className="frd-head">
        <h1>{report.label}</h1>
        <div className="frd-legend">
          <span className="frd-lg"><i className="frd-lg-line" />Forecast flow (m³/s)</span>
          {report.recorded.some(Boolean) && (
            <span className="frd-lg"><i className="frd-lg-line is-recorded" />Recorded flow</span>
          )}
          <span className="frd-lg"><i className="frd-lg-band" />Surfable 25–35</span>
        </div>
        <p className="frd-hint">Hover or drag across the graph to see flow and air temperature.</p>
      </div>

      <div className="frd-chartwrap">
        <div className="frd-chartbox" ref={boxRef}>
          {w > 40 && h > 40 && <Chart report={report} w={w} h={h} twelveHour={twelveHour} />}
        </div>
      </div>

      <div className="frd-foot">
        <div className="frd-foot-side">
          <button className="frd-home" onClick={() => navigate(-1)}>‹ All days</button>
        </div>
        <div className="frd-foot-side right">
          <div className="frd-nav">
            <button
              className="frd-navbtn"
              onClick={() => navigate(selectedIndex - 1)}
              disabled={selectedIndex === 0}
              aria-label="Previous day"
            >
              <IonIcon icon={chevronBackOutline} />
            </button>
            <span className="frd-date">{report.shortLabel}</span>
            <button
              className="frd-navbtn"
              onClick={() => navigate(selectedIndex + 1)}
              disabled={selectedIndex === flowData.length - 1}
              aria-label="Next day"
            >
              <IonIcon icon={chevronForwardOutline} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DayDetail;
