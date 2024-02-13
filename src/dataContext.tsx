import { debounce } from 'lodash';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

import FLOW_DATA from './flowData.json';
import WEATHER_DATA from './weatherData.json';
import TIME_DATA from './timeData.json';
import { PREFERRED_FLOW_RATE, PREFERRED_HOME_VIEW, PREFERS_DARK_COLOR_SCHEME, PREFERS_TWELVE_HOUR } from './App';

export enum HomeViewType {
  SUMMARY = 'SUMMARY',
  CHARTS = 'CHARTS'
}

interface DataContextType {
  flowData: FlowData[];
  setFlowData: (data: FlowData[]) => void;
  targetFlow: number;
  setTargetFlow: (targetFlow: number) => void;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  stateUpdate: number;
  setStateUpdate: (state: number) => void;
  darkMode: boolean;
  setDarkMode: (state: boolean) => void;
  twelveHour: boolean;
  setTwelveHour: (state: boolean) => void;
  homeViewType: HomeViewType;
  setHomeViewType: (type: HomeViewType) => void;
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
  const [targetFlow, setTargetFlow] = useState<number>(getPreferredFlowFromStorage());
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [stateUpdate, setStateUpdate] = useState<number>(0);
  const [darkMode, setDarkMode] = useState<boolean>(getDarkModePreference());
  const [twelveHour, setTwelveHour] = useState<boolean>(getTwelveHourPreference());
  const [homeViewType, setHomeViewType] = useState<HomeViewType>(getPreferredHomeViewFromStorage());

  useEffect(() => {
    setFlowData(processFlowData(FLOW_DATA, WEATHER_DATA));
  }, []);

  const setDarkTheme = (state: boolean) => {
    document.body.classList.toggle('dark', state);
  }

  useEffect(() => {
    setDarkTheme(darkMode);
    localStorage.setItem(PREFERS_DARK_COLOR_SCHEME, String(darkMode));
    localStorage.setItem(PREFERS_TWELVE_HOUR, String(twelveHour));
    localStorage.setItem(PREFERRED_FLOW_RATE, String(targetFlow));
    localStorage.setItem(PREFERRED_HOME_VIEW, homeViewType);
  }, [darkMode, twelveHour, targetFlow, homeViewType]);

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
    <FlowDataContext.Provider value={{ flowData, setFlowData, targetFlow, setTargetFlow, selectedIndex, setSelectedIndex, stateUpdate, setStateUpdate, darkMode, setDarkMode, twelveHour, setTwelveHour, homeViewType, setHomeViewType }}>
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
  const isDST: boolean = TIME_DATA['dst'];
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
      const volume = Number(entry.barrier);
      dataPoints.push({ hour: Number(dateTime[1])-1, volume: volume, temperature: hourlyTemperatures.shift() });
      date = new Date(`${dateTime[0]}T00:00:00-0${isDST ? 6 : 7}:00`);
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

export function calculateTargetDateRanges(targetFlow: number, flowData: FlowData): Date[][] {
  let ranges: Date[][] = [];
  let timeRange: Date[] = [];
  const day: Date = flowData.day;
  flowData.dataPoints.forEach(dataPoint => {
    if (dataPoint.volume >= targetFlow && timeRange.length == 0) {
        let startTime = new Date(day);
        startTime.setHours(dataPoint.hour);
        timeRange.push(startTime);
    }
    if (dataPoint.volume < targetFlow && timeRange.length == 1) {
        let endTime = new Date(day);
        endTime.setHours(dataPoint.hour);
        timeRange.push(endTime);
    }
    if (timeRange.length == 2) {
      ranges.push(timeRange);
      timeRange = [];
    }
  });
  if (timeRange.length) {
    let endTime = new Date(day);
    endTime.setHours(24);
    timeRange.push(endTime);
    ranges.push(timeRange);
  }
  return ranges;
}

export function isUpcomingTargetDateRange(dateRange: Date[]): boolean {
  return Date.now() < dateRange[0]?.getTime();
}

export function isInsideTargetDateRange(dateRange: Date[]): boolean {
  return Date.now() >= dateRange[0]?.getTime() && Date.now() <= dateRange[1]?.getTime();
}

export function isIndefiniteTargetDateRange(dateRange: Date[]): boolean {
  return dateRange.length === 1;
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

function getPreferredFlowFromStorage(): number {
  const value = localStorage.getItem(PREFERRED_FLOW_RATE);
  return value ? Number(value) : 30;
}

export function getPreferredHomeViewFromStorage(): HomeViewType {
  const value = localStorage.getItem(PREFERRED_HOME_VIEW);
  return value ? (value === HomeViewType.CHARTS ? HomeViewType.CHARTS : HomeViewType.SUMMARY) : HomeViewType.SUMMARY;
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
