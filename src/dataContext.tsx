import { debounce } from 'lodash';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

import FLOW_DATA from './flowData.json';
import WEATHER_DATA from './weatherData.json';
import TIME_DATA from './timeData.json';

interface DataContextType {
  flowData: FlowData[];
  setFlowData: (data: FlowData[]) => void;
  targetFlow: number;
  setTargetFlow: (targetFlow: number) => void;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  stateUpdate: number;
  setStateUpdate: (state: number) => void;
}

const FlowDataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [flowData, setFlowData] = useState<FlowData[]>([]);
  const [targetFlow, setTargetFlow] = useState<number>(30);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [stateUpdate, setStateUpdate] = useState<number>(0);

  useEffect(() => {
    setFlowData(processFlowData(FLOW_DATA, WEATHER_DATA));
  }, []);

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
    <FlowDataContext.Provider value={{ flowData, setFlowData, targetFlow, setTargetFlow, selectedIndex, setSelectedIndex, stateUpdate, setStateUpdate }}>
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

export function calculateTargetDateRange(targetFlow: number, flowData: FlowData[]): Date[] {
  let targetDateRange: Date[] = [];
  flowData.forEach(entry => {
      const day: Date = entry.day;
      entry.dataPoints.forEach(dataPoint => {
          const currentDate = new Date();
          const currentHour = currentDate.getHours();
          if (currentDate < day || currentHour <= dataPoint.hour) {
              if (dataPoint.volume >= targetFlow && targetDateRange.length == 0) {
                  let startTime = new Date(day);
                  startTime.setHours(dataPoint.hour);
                  targetDateRange.push(startTime);
              }
              if (dataPoint.volume < targetFlow && targetDateRange.length == 1) {
                  let endTime = new Date(day);
                  endTime.setHours(dataPoint.hour);
                  targetDateRange.push(endTime);
              }
          }
      });
  });
  return targetDateRange;
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
