import { FlowData } from '../../dataContext';

// ---- Domain constants ----
export const SURF_LO = 25;  // surfable window low (m³/s)
export const SURF_HI = 35;  // surfable window high (m³/s)
export const VMIN = 15;     // detail chart volume axis bottom (m³/s)
export const VMAX = 50;     // detail chart volume axis top (m³/s)

export const HOURS = 24;

export type FlowClass = 'none' | 'low' | 'surf' | 'high';

// Per-day view model derived from FlowData: 24 hourly values/temps,
// the current hour (today only) and the last past hour (0..pastUntil have
// already happened — drawn faded). recorded[hour] tracks provenance: true
// where the value is an actual reading, false where it's forecast.
export interface DayReport {
  label: string;
  shortLabel: string;
  values: (number | null)[];
  temps: (number | null)[];
  recorded: boolean[];
  nowHour?: number;
  pastUntil?: number;
  sunriseHour?: number;
  sunsetHour?: number;
}

// The one rule that drives every color decision:
// inside 25–35 -> "surf" (blue, the hero); everything else recedes.
export function classify(volume: number | null | undefined): FlowClass {
  if (volume == null) return 'none';
  if (volume < SURF_LO) return 'low';
  if (volume <= SURF_HI) return 'surf';
  return 'high';
}

export const isPast = (report: DayReport, hour: number): boolean =>
  report.pastUntil != null && hour <= report.pastUntil;

export const isNow = (report: DayReport, hour: number): boolean =>
  report.nowHour === hour;

export const isSun = (report: DayReport, hour: number): boolean =>
  hour === report.sunriseHour || hour === report.sunsetHour;

export interface ValueRun {
  start: number;
  length: number;
  value: number | null;
  state: FlowClass;
  past: boolean;
}

// Consecutive hours with the same (rounded) flow value collapse into one
// run — drawn as a single rail with the value centered over it. Runs also
// split at the recorded/forecast boundary so the faded-past cue survives.
export function valueRuns(report: DayReport): ValueRun[] {
  const runs: ValueRun[] = [];
  report.values.forEach((raw, hour) => {
    const value = raw != null ? Math.round(raw) : null;
    const past = isPast(report, hour);
    const prev = runs[runs.length - 1];
    if (prev && prev.value === value && prev.past === past) {
      prev.length++;
      return;
    }
    runs.push({ start: hour, length: 1, value, state: classify(value), past });
  });
  return runs;
}

export function buildDayReport(data: FlowData, historical: FlowData): DayReport {
  const today = new Date();
  const currentHour = today.getHours();
  today.setHours(0, 0, 0, 0);
  const isToday = data.day.getTime() === today.getTime();

  const hasHistorical =
    data.day.toDateString() === historical.day.toDateString() && historical.dataPoints.length > 0;

  const values: (number | null)[] = Array(HOURS).fill(null);
  const temps: (number | null)[] = Array(HOURS).fill(null);
  const recorded: boolean[] = Array(HOURS).fill(false);
  data.dataPoints.forEach((dataPoint, index) => {
    // Recorded readings replace the forecast for hours that already happened
    const reading = hasHistorical ? historical.dataPoints[index] : undefined;
    values[dataPoint.hour] = reading ? reading.volume : dataPoint.volume;
    recorded[dataPoint.hour] = !!reading;
    temps[dataPoint.hour] = dataPoint.temperature ?? null;
  });

  let pastUntil: number | undefined;
  if (hasHistorical) {
    pastUntil = Math.min(historical.dataPoints.length - 1, HOURS - 1);
  } else if (isToday && currentHour > 0) {
    pastUntil = currentHour - 1;
  }

  return {
    label: data.day.toDateString(),
    shortLabel: data.day.toDateString().split(' ').slice(1).join(' '),
    values,
    temps,
    recorded,
    nowHour: isToday ? currentHour : undefined,
    pastUntil,
    sunriseHour: data.sunriseHour,
    sunsetHour: data.sunsetHour,
  };
}
