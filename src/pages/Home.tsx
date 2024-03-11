import { IonContent, IonFooter, IonPage, IonSpinner, IonText } from '@ionic/react';

import LowerBanner from '../components/banner/LowerBanner';
import DailyFlowsContainer from '../components/dailyFlowsContainer/DailyFlowsContainer';
import { useData } from '../dataContext';
import Summary from '../components/summary/Summary';

import './Home.css';

const Home = () => {
  const { flowData, selectedIndex } = useData();

  const graphView = (
    <div className='graph-content'>
      <IonContent scrollY={false} fullscreen><DailyFlowsContainer /></IonContent>
      <IonFooter><LowerBanner /></IonFooter>
    </div>
  );

  const content = flowData.length ? (
    <IonPage>
      {selectedIndex >= 0 ? <IonContent scrollY={false}>{graphView}</IonContent> : <IonContent scrollY={false}><Summary></Summary></IonContent>}
    </IonPage>
  ) : <Loading></Loading>;

  return content;
};

function Loading() {
  return (
    <div className='summary-screen-content'>
      <IonSpinner name='dots'></IonSpinner>
      <IonText color='primary'>Fetching River Data</IonText>
    </div>
  );
}

export function isDarkModeEnabled(): boolean {
  return document.body.classList.contains('dark');
}

export default Home;
