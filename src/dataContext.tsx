import { debounce } from 'lodash';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

import { PREFERS_DARK_COLOR_SCHEME, PREFERS_TWELVE_HOUR } from './App';

// Data is served at runtime by the reader Lambda (Function URL), no longer
// bundled at build time. Set VITE_DATA_API_URL at build to the Function URL.
const DATA_API_URL = import.meta.env.VITE_DATA_API_URL as string | undefined;

interface DataContextType {
  flowData: FlowData[];
  setFlowData: (data: FlowData[]) => void;
  historicalFlowData: FlowData;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  stateUpdate: number;
  setStateUpdate: (state: number) => void;
  darkMode: boolean;
  setDarkMode: (state: boolean) => void;
  twelveHour: boolean;
  setTwelveHour: (state: boolean) => void;
}

const FlowDataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const getDarkModePreference = (): boolean => {
    return localStorage.getItem(PREFERS_DARK_COLOR_SCHEME) ? getPrefersDarkFromStorage() : window.matchMedia('(prefers-color-scheme: dark)').matches;
  };
  const getTwelveHourPreference = (): boolean => {
    return localStorage.getItem(PREFERS_TWELVE_HOUR) ? getPrefersTwelveHourFromStorage() : true;
  };

  const [flowData, setFlowData] = useState<FlowData[]>([]);
  const [historicalFlowData, setHistoricalFlowData] = useState<FlowData>({ day: new Date(), dataPoints: [] });
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [stateUpdate, setStateUpdate] = useState<number>(0);
  const [darkMode, setDarkMode] = useState<boolean>(getDarkModePreference());
  const [twelveHour, setTwelveHour] = useState<boolean>(getTwelveHourPreference());

  useEffect(() => {
    if (!DATA_API_URL) {
      console.error('VITE_DATA_API_URL is not set; cannot load flow data');
      return;
    }
    let cancelled = false;
    fetch(DATA_API_URL)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setFlowData(processFlowData(data.flow, data.weather));
        setHistoricalFlowData(processHistoricalFlowData(data.historical));
      })
      .catch((err) => console.error('Failed to load flow data', err));
    return () => {
      cancelled = true;
    };
  }, []);

  const setDarkTheme = (state: boolean) => {
    document.body.classList.toggle('dark', state);
  }

  useEffect(() => {
    setDarkTheme(darkMode);
    localStorage.setItem(PREFERS_DARK_COLOR_SCHEME, String(darkMode));
    localStorage.setItem(PREFERS_TWELVE_HOUR, String(twelveHour));
    setStateUpdate(stateUpdate+1);
  }, [darkMode, twelveHour]);

  useEffect(() => {
    const updateOnHour = () => {
      const now = new Date();
      const currentDayOfMonth = now.getDate();

      now.setHours(now.getHours() - 1);
      const lastHourDayOfMonth = now.getDate();

      const dayChanged = currentDayOfMonth !== lastHourDayOfMonth;

      if (dayChanged) {
        window.location.reload();
      }

      setStateUpdate(state => state + 1);
    };

    const now = new Date();
    const nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0, 0);
    const delayUntilNextHour = nextHour.getTime() - now.getTime();

    const timeoutId = setTimeout(() => {
      updateOnHour();
      setInterval(updateOnHour, 1000 * 60 * 60);
    }, delayUntilNextHour);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [flowData]);

  useEffect(() => {
    const handleResize = () => setStateUpdate((state) => state+1);
    const debouncedHandleResize = debounce(handleResize, 250);
    window.addEventListener('resize', debouncedHandleResize);
    return () => window.removeEventListener('resize', debouncedHandleResize);
  }, []);

  return (
    <FlowDataContext.Provider value={{ flowData, setFlowData, selectedIndex, setSelectedIndex, stateUpdate, setStateUpdate, darkMode, setDarkMode, twelveHour, setTwelveHour, historicalFlowData }}>
      {children}
    </FlowDataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(FlowDataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

function processFlowData(rawFlowData: any, rawWeatherData: any): FlowData[] {
  const hourlyTemperatures: number[] = rawWeatherData['hourly']['temperature_2m'].slice(0, 168);
  const sunriseStrings: string[] = rawWeatherData['daily']['sunrise'].slice(0, 4).map((value: string) => value.split('T')[1]);
  let sunriseHours: number [] = sunriseStrings.map(string => {
    let parts = string.split(":");
    let hour = parseInt(parts[0], 10);
    let minutes = parseInt(parts[1], 10);
    
    return minutes > 30 ? hour + 1 : hour;
  });
  let sunsetStrings: string[] = rawWeatherData['daily']['sunset'].slice(0, 4).map((value: string) => value.split('T')[1]);
  let sunsetHours: number [] = sunsetStrings.map(string => {
    let parts = string.split(":");
    let hour = parseInt(parts[0], 10);
    let minutes = parseInt(parts[1], 10);
    
    return minutes > 30 ? hour + 1 : hour;
  });
  
  let flowData: FlowData[] = [];
  rawFlowData?.elements?.forEach((day: any) => {
    let date: Date = new Date();
    let dataPoints: FlowDataPoint[] = [];
    day.entry?.forEach((entry: any) => {
      const dateTime = entry.period.split(" ", 2);
      const yearMonthDay = dateTime[0].split("-", 3);
      const volume = Number(entry.barrier);
      dataPoints.push({ hour: Number(dateTime[1])-1, volume: volume, temperature: hourlyTemperatures.shift() });
      date = new Date();
      date.setFullYear(yearMonthDay[0], yearMonthDay[1]-1, yearMonthDay[2]);
    });
    let now = new Date();
    now.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    const sunriseHour: number | undefined = sunriseHours.shift();
    const sunsetHour: number | undefined = sunsetHours.shift();
    if (date >= now) {
      flowData.push({
        day: date, 
        dataPoints: dataPoints, 
        sunriseHour: sunriseHour, 
        sunsetHour: sunsetHour 
      });
    }
  });
  return flowData;
}

function processHistoricalFlowData(rawHistorical: string | null | undefined): FlowData {
  try {
    if (!rawHistorical) throw new Error('no historical data');
    const readings = JSON.parse(rawHistorical)[0].data as Array<[string, number, number, number, number]>;

    const lastEntry = readings[readings.length - 1];
    const mostRecentDate = lastEntry[0].split(" ")[0];

    let dataPoints: FlowDataPoint[] = [];

    for (let i = readings.length-1; i > 0; i --) {
      const [timestamp, level, outflow] = readings[i];
      const dateString = timestamp.split(" ")[0];
      if (dateString !== mostRecentDate) {
        break
      }
      const date: Date = new Date(timestamp);
      dataPoints.push({ hour: date.getHours()+1, volume: Number(outflow) });
    }

    dataPoints.reverse();
    dataPoints = dataPoints.slice(1);

    return { day: new Date(mostRecentDate + 'T00:00:00'), dataPoints: dataPoints };
  } catch {
    return { day: new Date(), dataPoints: [] };
  }
}

export function getTimeString(date: Date, twelveHour: boolean): string {
  return date.toLocaleString([], {hour12: twelveHour, hour: 'numeric', minute: '2-digit'});
}

function getPrefersDarkFromStorage(): boolean {
  return localStorage.getItem(PREFERS_DARK_COLOR_SCHEME) === 'true' ? true : false;
}

function getPrefersTwelveHourFromStorage(): boolean {
  return localStorage.getItem(PREFERS_TWELVE_HOUR) === 'true' ? true : false;
}

export interface FlowData {
  day: Date;
  sunriseHour?: number;
  sunsetHour?: number;
  dataPoints: FlowDataPoint[];
};

export interface FlowDataPoint {
  hour: number;
  volume: number;
  temperature?: number;
}
