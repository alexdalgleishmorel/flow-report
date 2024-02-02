import { IonContent, IonFooter, IonHeader, IonPage, IonSpinner, IonText } from '@ionic/react';
import { useEffect } from 'react';

import LowerBanner from '../components/banner/LowerBanner';
import UpperBanner from '../components/banner/UpperBanner';
import DailyFlowsContainer from '../components/dailyFlowsContainer/DailyFlowsContainer';
import { useData } from '../dataContext';
import './Home.css';


const Home = () => {
  const { flowData } = useData();

  useEffect(() => {
    toggleDarkTheme(isDarkModeDefault());
  }, []);

  const content = flowData.length ? (
    <IonPage>
      <IonHeader><UpperBanner /></IonHeader>
      <IonContent scrollY={false} fullscreen>
        <div className='content'><DailyFlowsContainer /></div>
      </IonContent>
      <IonFooter><LowerBanner /></IonFooter>
    </IonPage>
  ) : <Loading></Loading>;

  return content;
};

function Loading() {
  return (
    <div className='content'>
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
