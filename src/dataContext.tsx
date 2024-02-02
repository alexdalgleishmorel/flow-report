import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

const LOCALHOST = 'localhost';
const MOCK_DATA = {"name":"pv_hydro_river_flow_by_site","elements":[{"day":0,"entry":[{"period":"2024-02-01 01","barrier":1,"pocaterra":1},{"period":"2024-02-01 02","barrier":1,"pocaterra":1},{"period":"2024-02-01 03","barrier":1,"pocaterra":1},{"period":"2024-02-01 04","barrier":1,"pocaterra":1},{"period":"2024-02-01 05","barrier":1,"pocaterra":1},{"period":"2024-02-01 06","barrier":1,"pocaterra":1},{"period":"2024-02-01 07","barrier":18,"pocaterra":1},{"period":"2024-02-01 08","barrier":29,"pocaterra":1},{"period":"2024-02-01 09","barrier":10,"pocaterra":1},{"period":"2024-02-01 10","barrier":1,"pocaterra":1},{"period":"2024-02-01 11","barrier":1,"pocaterra":1},{"period":"2024-02-01 12","barrier":1,"pocaterra":1},{"period":"2024-02-01 13","barrier":1,"pocaterra":1},{"period":"2024-02-01 14","barrier":1,"pocaterra":1},{"period":"2024-02-01 15","barrier":1,"pocaterra":1},{"period":"2024-02-01 16","barrier":1,"pocaterra":1},{"period":"2024-02-01 17","barrier":1,"pocaterra":14},{"period":"2024-02-01 18","barrier":1,"pocaterra":17},{"period":"2024-02-01 19","barrier":1,"pocaterra":17},{"period":"2024-02-01 20","barrier":26,"pocaterra":1},{"period":"2024-02-01 21","barrier":26,"pocaterra":1},{"period":"2024-02-01 22","barrier":0,"pocaterra":1},{"period":"2024-02-01 23","barrier":0,"pocaterra":1},{"period":"2024-02-01 24","barrier":0,"pocaterra":1}]},{"day":1,"entry":[{"period":"2024-02-02 01","barrier":0,"pocaterra":1},{"period":"2024-02-02 02","barrier":0,"pocaterra":1},{"period":"2024-02-02 03","barrier":0,"pocaterra":1},{"period":"2024-02-02 04","barrier":0,"pocaterra":1},{"period":"2024-02-02 05","barrier":0,"pocaterra":1},{"period":"2024-02-02 06","barrier":0,"pocaterra":1},{"period":"2024-02-02 07","barrier":0,"pocaterra":1},{"period":"2024-02-02 08","barrier":0,"pocaterra":1},{"period":"2024-02-02 09","barrier":0,"pocaterra":1},{"period":"2024-02-02 10","barrier":0,"pocaterra":1},{"period":"2024-02-02 11","barrier":0,"pocaterra":1},{"period":"2024-02-02 12","barrier":0,"pocaterra":1},{"period":"2024-02-02 13","barrier":0,"pocaterra":1},{"period":"2024-02-02 14","barrier":0,"pocaterra":1},{"period":"2024-02-02 15","barrier":0,"pocaterra":1},{"period":"2024-02-02 16","barrier":0,"pocaterra":1},{"period":"2024-02-02 17","barrier":26,"pocaterra":17},{"period":"2024-02-02 18","barrier":26,"pocaterra":17},{"period":"2024-02-02 19","barrier":26,"pocaterra":17},{"period":"2024-02-02 20","barrier":26,"pocaterra":1},{"period":"2024-02-02 21","barrier":0,"pocaterra":1},{"period":"2024-02-02 22","barrier":0,"pocaterra":1},{"period":"2024-02-02 23","barrier":0,"pocaterra":1},{"period":"2024-02-02 24","barrier":0,"pocaterra":1}]},{"day":2,"entry":[{"period":"2024-02-03 01","barrier":0,"pocaterra":1},{"period":"2024-02-03 02","barrier":0,"pocaterra":1},{"period":"2024-02-03 03","barrier":0,"pocaterra":1},{"period":"2024-02-03 04","barrier":0,"pocaterra":1},{"period":"2024-02-03 05","barrier":0,"pocaterra":1},{"period":"2024-02-03 06","barrier":0,"pocaterra":1},{"period":"2024-02-03 07","barrier":0,"pocaterra":1},{"period":"2024-02-03 08","barrier":0,"pocaterra":1},{"period":"2024-02-03 09","barrier":0,"pocaterra":1},{"period":"2024-02-03 10","barrier":0,"pocaterra":1},{"period":"2024-02-03 11","barrier":0,"pocaterra":1},{"period":"2024-02-03 12","barrier":0,"pocaterra":1},{"period":"2024-02-03 13","barrier":0,"pocaterra":1},{"period":"2024-02-03 14","barrier":0,"pocaterra":1},{"period":"2024-02-03 15","barrier":0,"pocaterra":1},{"period":"2024-02-03 16","barrier":0,"pocaterra":1},{"period":"2024-02-03 17","barrier":26,"pocaterra":17},{"period":"2024-02-03 18","barrier":26,"pocaterra":17},{"period":"2024-02-03 19","barrier":26,"pocaterra":17},{"period":"2024-02-03 20","barrier":26,"pocaterra":1},{"period":"2024-02-03 21","barrier":0,"pocaterra":1},{"period":"2024-02-03 22","barrier":0,"pocaterra":1},{"period":"2024-02-03 23","barrier":0,"pocaterra":1},{"period":"2024-02-03 24","barrier":0,"pocaterra":1}]},{"day":3,"entry":[{"period":"2024-02-04 01","barrier":0,"pocaterra":1},{"period":"2024-02-04 02","barrier":0,"pocaterra":1},{"period":"2024-02-04 03","barrier":0,"pocaterra":1},{"period":"2024-02-04 04","barrier":0,"pocaterra":1},{"period":"2024-02-04 05","barrier":0,"pocaterra":1},{"period":"2024-02-04 06","barrier":0,"pocaterra":1},{"period":"2024-02-04 07","barrier":0,"pocaterra":1},{"period":"2024-02-04 08","barrier":0,"pocaterra":1},{"period":"2024-02-04 09","barrier":0,"pocaterra":1},{"period":"2024-02-04 10","barrier":0,"pocaterra":1},{"period":"2024-02-04 11","barrier":0,"pocaterra":1},{"period":"2024-02-04 12","barrier":0,"pocaterra":1},{"period":"2024-02-04 13","barrier":0,"pocaterra":1},{"period":"2024-02-04 14","barrier":0,"pocaterra":1},{"period":"2024-02-04 15","barrier":0,"pocaterra":1},{"period":"2024-02-04 16","barrier":0,"pocaterra":1},{"period":"2024-02-04 17","barrier":26,"pocaterra":17},{"period":"2024-02-04 18","barrier":26,"pocaterra":17},{"period":"2024-02-04 19","barrier":26,"pocaterra":17},{"period":"2024-02-04 20","barrier":26,"pocaterra":1},{"period":"2024-02-04 21","barrier":0,"pocaterra":1},{"period":"2024-02-04 22","barrier":0,"pocaterra":1},{"period":"2024-02-04 23","barrier":0,"pocaterra":1},{"period":"2024-02-04 24","barrier":0,"pocaterra":1}]}],"links":[{"rel":"self","href":"http://denodo.transalta.org:9090/server/hydro/hydro_river_flow/views/pv_hydro_river_flow_by_site?%24format=json"}]};

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

  const fetchData = async () => {
    if (window.location.hostname !== LOCALHOST) {
      try {
        const response = await fetch('https://azf-eai-denodo-proxies.azurewebsites.net/api/riverflow', {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        setFlowData(processFlowData(json));
      } catch (e) {
        setFlowData([]);
      }
    } else {
      setFlowData(processFlowData(MOCK_DATA));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const updateOnHour = () => {
      const now = new Date();
      const currentDayOfMonth = now.getDate();

      now.setHours(now.getHours() - 1);
      const lastHourDayOfMonth = now.getDate();

      const dayChanged = currentDayOfMonth !== lastHourDayOfMonth;

      if (dayChanged) {
        selectedIndex < flowData.length-1 ? setSelectedIndex(selectedIndex+1) : fetchData();
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

function fetchAPIData() {
  return {"name":"pv_hydro_river_flow_by_site","elements":[{"day":0,"entry":[{"period":"2024-01-31 01","barrier":1,"pocaterra":1},{"period":"2024-01-31 02","barrier":1,"pocaterra":1},{"period":"2024-01-31 03","barrier":1,"pocaterra":1},{"period":"2024-01-31 04","barrier":1,"pocaterra":1},{"period":"2024-01-31 05","barrier":1,"pocaterra":1},{"period":"2024-01-31 06","barrier":1,"pocaterra":1},{"period":"2024-01-31 07","barrier":11,"pocaterra":1},{"period":"2024-01-31 08","barrier":29,"pocaterra":1},{"period":"2024-01-31 09","barrier":10,"pocaterra":1},{"period":"2024-01-31 10","barrier":10,"pocaterra":1},{"period":"2024-01-31 11","barrier":10,"pocaterra":1},{"period":"2024-01-31 12","barrier":10,"pocaterra":1},{"period":"2024-01-31 13","barrier":0,"pocaterra":1},{"period":"2024-01-31 14","barrier":3,"pocaterra":1},{"period":"2024-01-31 15","barrier":0,"pocaterra":1},{"period":"2024-01-31 16","barrier":0,"pocaterra":1},{"period":"2024-01-31 17","barrier":10,"pocaterra":17},{"period":"2024-01-31 18","barrier":10,"pocaterra":17},{"period":"2024-01-31 19","barrier":10,"pocaterra":17},{"period":"2024-01-31 20","barrier":10,"pocaterra":1},{"period":"2024-01-31 21","barrier":10,"pocaterra":1},{"period":"2024-01-31 22","barrier":10,"pocaterra":1},{"period":"2024-01-31 23","barrier":0,"pocaterra":1},{"period":"2024-01-31 24","barrier":0,"pocaterra":1}]},{"day":1,"entry":[{"period":"2024-02-01 01","barrier":0,"pocaterra":1},{"period":"2024-02-01 02","barrier":0,"pocaterra":1},{"period":"2024-02-01 03","barrier":0,"pocaterra":1},{"period":"2024-02-01 04","barrier":0,"pocaterra":1},{"period":"2024-02-01 05","barrier":0,"pocaterra":1},{"period":"2024-02-01 06","barrier":10,"pocaterra":1},{"period":"2024-02-01 07","barrier":10,"pocaterra":1},{"period":"2024-02-01 08","barrier":10,"pocaterra":1},{"period":"2024-02-01 09","barrier":10,"pocaterra":1},{"period":"2024-02-01 10","barrier":10,"pocaterra":1},{"period":"2024-02-01 11","barrier":0,"pocaterra":1},{"period":"2024-02-01 12","barrier":0,"pocaterra":1},{"period":"2024-02-01 13","barrier":0,"pocaterra":1},{"period":"2024-02-01 14","barrier":10,"pocaterra":1},{"period":"2024-02-01 15","barrier":10,"pocaterra":1},{"period":"2024-02-01 16","barrier":10,"pocaterra":1},{"period":"2024-02-01 17","barrier":10,"pocaterra":17},{"period":"2024-02-01 18","barrier":10,"pocaterra":17},{"period":"2024-02-01 19","barrier":10,"pocaterra":17},{"period":"2024-02-01 20","barrier":0,"pocaterra":1},{"period":"2024-02-01 21","barrier":10,"pocaterra":1},{"period":"2024-02-01 22","barrier":0,"pocaterra":1},{"period":"2024-02-01 23","barrier":0,"pocaterra":1},{"period":"2024-02-01 24","barrier":0,"pocaterra":1}]},{"day":2,"entry":[{"period":"2024-02-02 01","barrier":0,"pocaterra":1},{"period":"2024-02-02 02","barrier":0,"pocaterra":1},{"period":"2024-02-02 03","barrier":0,"pocaterra":1},{"period":"2024-02-02 04","barrier":0,"pocaterra":1},{"period":"2024-02-02 05","barrier":0,"pocaterra":1},{"period":"2024-02-02 06","barrier":10,"pocaterra":1},{"period":"2024-02-02 07","barrier":10,"pocaterra":1},{"period":"2024-02-02 08","barrier":10,"pocaterra":1},{"period":"2024-02-02 09","barrier":10,"pocaterra":1},{"period":"2024-02-02 10","barrier":10,"pocaterra":1},{"period":"2024-02-02 11","barrier":0,"pocaterra":1},{"period":"2024-02-02 12","barrier":0,"pocaterra":1},{"period":"2024-02-02 13","barrier":0,"pocaterra":1},{"period":"2024-02-02 14","barrier":0,"pocaterra":1},{"period":"2024-02-02 15","barrier":10,"pocaterra":1},{"period":"2024-02-02 16","barrier":10,"pocaterra":1},{"period":"2024-02-02 17","barrier":10,"pocaterra":17},{"period":"2024-02-02 18","barrier":10,"pocaterra":17},{"period":"2024-02-02 19","barrier":10,"pocaterra":17},{"period":"2024-02-02 20","barrier":10,"pocaterra":1},{"period":"2024-02-02 21","barrier":10,"pocaterra":1},{"period":"2024-02-02 22","barrier":0,"pocaterra":1},{"period":"2024-02-02 23","barrier":0,"pocaterra":1},{"period":"2024-02-02 24","barrier":0,"pocaterra":1}]},{"day":3,"entry":[{"period":"2024-02-03 01","barrier":30,"pocaterra":1},{"period":"2024-02-03 02","barrier":0,"pocaterra":1},{"period":"2024-02-03 03","barrier":0,"pocaterra":1},{"period":"2024-02-03 04","barrier":0,"pocaterra":1},{"period":"2024-02-03 05","barrier":0,"pocaterra":1},{"period":"2024-02-03 06","barrier":10,"pocaterra":1},{"period":"2024-02-03 07","barrier":10,"pocaterra":1},{"period":"2024-02-03 08","barrier":10,"pocaterra":1},{"period":"2024-02-03 09","barrier":10,"pocaterra":1},{"period":"2024-02-03 10","barrier":10,"pocaterra":1},{"period":"2024-02-03 11","barrier":0,"pocaterra":1},{"period":"2024-02-03 12","barrier":0,"pocaterra":1},{"period":"2024-02-03 13","barrier":0,"pocaterra":1},{"period":"2024-02-03 14","barrier":0,"pocaterra":1},{"period":"2024-02-03 15","barrier":10,"pocaterra":1},{"period":"2024-02-03 16","barrier":10,"pocaterra":1},{"period":"2024-02-03 17","barrier":10,"pocaterra":17},{"period":"2024-02-03 18","barrier":10,"pocaterra":17},{"period":"2024-02-03 19","barrier":10,"pocaterra":17},{"period":"2024-02-03 20","barrier":10,"pocaterra":1},{"period":"2024-02-03 21","barrier":10,"pocaterra":1},{"period":"2024-02-03 22","barrier":0,"pocaterra":1},{"period":"2024-02-03 23","barrier":0,"pocaterra":1},{"period":"2024-02-03 24","barrier":0,"pocaterra":1}]}],"links":[{"rel":"self","href":"http://denodo.transalta.org:9090/server/hydro/hydro_river_flow/views/pv_hydro_river_flow_by_site?%24format=json"}]}; 
}

export interface FlowData {
  day: Date;
  dataPoints: FlowDataPoint[];
};

export interface FlowDataPoint {
  hour: number;
  volume: number;
}
