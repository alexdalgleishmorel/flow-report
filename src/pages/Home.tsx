import { IonContent, IonFooter, IonHeader, IonPage, IonSpinner, IonText } from '@ionic/react';
import { useEffect } from 'react';

import LowerBanner from '../components/banner/LowerBanner';
import DailyFlowsContainer from '../components/dailyFlowsContainer/DailyFlowsContainer';
import { useData } from '../dataContext';
import './Home.css';
import Summary from '../components/summary/Summary';


const Home = () => {
  const { flowData, selectedIndex } = useData();

  useEffect(() => {
    toggleDarkTheme(isDarkModeDefault());
  }, []);

  const graphView = (
    <div className='graph-content'>
      <IonContent scrollY={false} fullscreen><DailyFlowsContainer /></IonContent>
      <IonFooter><LowerBanner /></IonFooter>
    </div>
  );

  const content = flowData.length ? (
    <IonPage>
      {selectedIndex >= 0 ? <IonContent>{graphView}</IonContent> : <IonContent><Summary></Summary></IonContent>}
    </IonPage>
  ) : <Loading></Loading>;

  return content;
};

function Loading() {
  return (
    <div className='full-screen-content'>
      <IonSpinner name='dots'></IonSpinner>
      <IonText color='primary'>Fetching River Data</IonText>
    </div>
  );
}

export function toggleDarkTheme(enable: boolean) {
  document.body.classList.toggle('dark', enable);
}

export function isDarkModeDefault(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function isDarkModeEnabled(): boolean {
  return document.body.classList.contains('dark');
}

export default Home;
