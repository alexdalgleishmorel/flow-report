import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

import DATA from './data.json';

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
  const [targetFlow, setTargetFlow] = useState<number>(25);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [stateUpdate, setStateUpdate] = useState<number>(0);

  useEffect(() => {
    setFlowData(processFlowData(DATA));
  }, []);

  useEffect(() => {
    const updateOnHour = () => {
      const now = new Date();
      const currentDayOfMonth = now.getDate();

      now.setHours(now.getHours() - 1);
      const lastHourDayOfMonth = now.getDate();

      const dayChanged = currentDayOfMonth !== lastHourDayOfMonth;

      if (dayChanged) {
        selectedIndex < flowData.length-1 ? setSelectedIndex(selectedIndex+1) : setFlowData([]);
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

function processFlowData(rawData: any): FlowData[] {
  let flowData: FlowData[] = [];
  rawData?.elements?.forEach((day: any) => {
    let date: Date = new Date();
    let dataPoints: FlowDataPoint[] = [];
    day.entry?.forEach((entry: any) => {
      const dateTime = entry.period.split(" ", 2);
      const volume = Number(entry.barrier);
      dataPoints.push({ hour: Number(dateTime[1])-1, volume: volume });
      date = new Date(`${dateTime[0]}T00:00:00-07:00`);
    });
    let now = new Date();
    now.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    if (date >= now) {
      flowData.push({ day: date, dataPoints: dataPoints });
    }
  });
  return flowData;
}

export interface FlowData {
  day: Date;
  dataPoints: FlowDataPoint[];
};

export interface FlowDataPoint {
  hour: number;
  volume: number;
}
