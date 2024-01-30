import { useEffect, useState } from 'react';
import { IonContent, IonPage, IonText } from '@ionic/react';

import Countdown from '../components/countdown/Countdown';
import './Home.css';
import DailyFlowsContainer from '../components/dailyFlowsContainer/DailyFlowsContainer';

const MOCK_DATA = {
  "name":"pv_hydro_river_flow_by_site","elements":[{"day":0,"entry":[{"period":"2024-01-29 01","barrier":1,"pocaterra":1},{"period":"2024-01-29 02","barrier":1,"pocaterra":1},{"period":"2024-01-29 03","barrier":1,"pocaterra":1},{"period":"2024-01-29 04","barrier":1,"pocaterra":1},{"period":"2024-01-29 05","barrier":1,"pocaterra":1},{"period":"2024-01-29 06","barrier":4,"pocaterra":1},{"period":"2024-01-29 07","barrier":11,"pocaterra":1},{"period":"2024-01-29 08","barrier":11,"pocaterra":1},{"period":"2024-01-29 09","barrier":11,"pocaterra":1},{"period":"2024-01-29 10","barrier":4,"pocaterra":1},{"period":"2024-01-29 11","barrier":1,"pocaterra":1},{"period":"2024-01-29 12","barrier":1,"pocaterra":1},{"period":"2024-01-29 13","barrier":1,"pocaterra":1},{"period":"2024-01-29 14","barrier":1,"pocaterra":1},{"period":"2024-01-29 15","barrier":1,"pocaterra":1},{"period":"2024-01-29 16","barrier":1,"pocaterra":1},{"period":"2024-01-29 17","barrier":7,"pocaterra":14},{"period":"2024-01-29 18","barrier":11,"pocaterra":17},{"period":"2024-01-29 19","barrier":11,"pocaterra":17},{"period":"2024-01-29 20","barrier":11,"pocaterra":2},{"period":"2024-01-29 21","barrier":11,"pocaterra":1},{"period":"2024-01-29 22","barrier":10,"pocaterra":1},{"period":"2024-01-29 23","barrier":0,"pocaterra":1},{"period":"2024-01-29 24","barrier":0,"pocaterra":1}]},{"day":1,"entry":[{"period":"2024-01-30 01","barrier":0,"pocaterra":1},{"period":"2024-01-30 02","barrier":0,"pocaterra":1},{"period":"2024-01-30 03","barrier":0,"pocaterra":1},{"period":"2024-01-30 04","barrier":0,"pocaterra":1},{"period":"2024-01-30 05","barrier":0,"pocaterra":1},{"period":"2024-01-30 06","barrier":10,"pocaterra":1},{"period":"2024-01-30 07","barrier":10,"pocaterra":1},{"period":"2024-01-30 08","barrier":10,"pocaterra":1},{"period":"2024-01-30 09","barrier":10,"pocaterra":1},{"period":"2024-01-30 10","barrier":0,"pocaterra":1},{"period":"2024-01-30 11","barrier":0,"pocaterra":1},{"period":"2024-01-30 12","barrier":0,"pocaterra":1},{"period":"2024-01-30 13","barrier":0,"pocaterra":1},{"period":"2024-01-30 14","barrier":0,"pocaterra":1},{"period":"2024-01-30 15","barrier":0,"pocaterra":1},{"period":"2024-01-30 16","barrier":0,"pocaterra":1},{"period":"2024-01-30 17","barrier":10,"pocaterra":17},{"period":"2024-01-30 18","barrier":10,"pocaterra":17},{"period":"2024-01-30 19","barrier":10,"pocaterra":17},{"period":"2024-01-30 20","barrier":10,"pocaterra":1},{"period":"2024-01-30 21","barrier":10,"pocaterra":1},{"period":"2024-01-30 22","barrier":10,"pocaterra":1},{"period":"2024-01-30 23","barrier":0,"pocaterra":1},{"period":"2024-01-30 24","barrier":0,"pocaterra":1}]},{"day":2,"entry":[{"period":"2024-01-31 01","barrier":0,"pocaterra":1},{"period":"2024-01-31 02","barrier":0,"pocaterra":1},{"period":"2024-01-31 03","barrier":0,"pocaterra":1},{"period":"2024-01-31 04","barrier":0,"pocaterra":1},{"period":"2024-01-31 05","barrier":0,"pocaterra":1},{"period":"2024-01-31 06","barrier":10,"pocaterra":1},{"period":"2024-01-31 07","barrier":10,"pocaterra":1},{"period":"2024-01-31 08","barrier":10,"pocaterra":1},{"period":"2024-01-31 09","barrier":10,"pocaterra":1},{"period":"2024-01-31 10","barrier":0,"pocaterra":1},{"period":"2024-01-31 11","barrier":0,"pocaterra":1},{"period":"2024-01-31 12","barrier":0,"pocaterra":1},{"period":"2024-01-31 13","barrier":0,"pocaterra":1},{"period":"2024-01-31 14","barrier":0,"pocaterra":1},{"period":"2024-01-31 15","barrier":0,"pocaterra":1},{"period":"2024-01-31 16","barrier":0,"pocaterra":1},{"period":"2024-01-31 17","barrier":10,"pocaterra":17},{"period":"2024-01-31 18","barrier":10,"pocaterra":17},{"period":"2024-01-31 19","barrier":10,"pocaterra":17},{"period":"2024-01-31 20","barrier":10,"pocaterra":1},{"period":"2024-01-31 21","barrier":10,"pocaterra":1},{"period":"2024-01-31 22","barrier":10,"pocaterra":1},{"period":"2024-01-31 23","barrier":0,"pocaterra":1},{"period":"2024-01-31 24","barrier":0,"pocaterra":1}]},{"day":3,"entry":[{"period":"2024-02-01 01","barrier":0,"pocaterra":1},{"period":"2024-02-01 02","barrier":0,"pocaterra":1},{"period":"2024-02-01 03","barrier":0,"pocaterra":1},{"period":"2024-02-01 04","barrier":0,"pocaterra":1},{"period":"2024-02-01 05","barrier":0,"pocaterra":1},{"period":"2024-02-01 06","barrier":10,"pocaterra":1},{"period":"2024-02-01 07","barrier":10,"pocaterra":1},{"period":"2024-02-01 08","barrier":10,"pocaterra":1},{"period":"2024-02-01 09","barrier":10,"pocaterra":1},{"period":"2024-02-01 10","barrier":10,"pocaterra":1},{"period":"2024-02-01 11","barrier":10,"pocaterra":1},{"period":"2024-02-01 12","barrier":10,"pocaterra":1},{"period":"2024-02-01 13","barrier":10,"pocaterra":1},{"period":"2024-02-01 14","barrier":10,"pocaterra":1},{"period":"2024-02-01 15","barrier":0,"pocaterra":1},{"period":"2024-02-01 16","barrier":0,"pocaterra":1},{"period":"2024-02-01 17","barrier":0,"pocaterra":17},{"period":"2024-02-01 18","barrier":0,"pocaterra":17},{"period":"2024-02-01 19","barrier":0,"pocaterra":17},{"period":"2024-02-01 20","barrier":0,"pocaterra":1},{"period":"2024-02-01 21","barrier":0,"pocaterra":1},{"period":"2024-02-01 22","barrier":0,"pocaterra":1},{"period":"2024-02-01 23","barrier":0,"pocaterra":1},{"period":"2024-02-01 24","barrier":0,"pocaterra":1}]}],"links":[{"rel":"self","href":"http://denodo.transalta.org:9090/server/hydro/hydro_river_flow/views/pv_hydro_river_flow_by_site?%24format=json"}]
};

const Home: React.FC = () => {
  const [flowData, setFlowData] = useState<FlowData[]>([]);

  useEffect(() => {
    setFlowData(processFlowData(MOCK_DATA));
  }, []);

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className='content'>
          <Countdown flowData={flowData} />
          <DailyFlowsContainer flowData={flowData} />
        </div>
      </IonContent>
    </IonPage>
  );
};

function processFlowData(rawData: any): FlowData[] {
  let flowData: FlowData[] = [];
  rawData.elements.forEach((day: any) => {
    let date: string = '';
    let dataPoints: FlowDataPoint[] = [];
    day.entry.forEach((entry: any) => {
      const dateTime = entry.period.split(" ", 2);
      const volume = Number(entry.barrier);
      dataPoints.push({ hour: Number(dateTime[1]), volume: volume });
      date = dateTime[0];
    });
    flowData.push({ day: date, dataPoints: dataPoints });
  });
  console.log(flowData);
  return flowData;
}

export interface FlowData {
  day: string;
  dataPoints: FlowDataPoint[];
};

export interface FlowDataPoint {
  hour: number;
  volume: number;
}

export default Home;
