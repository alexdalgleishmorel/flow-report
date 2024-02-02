import { useEffect, useState } from 'react';
import { IonContent, IonFooter, IonHeader, IonPage, IonSpinner, IonText } from '@ionic/react';

import UpperBanner from '../components/banner/UpperBanner';
import './Home.css';
import DailyFlowsContainer from '../components/dailyFlowsContainer/DailyFlowsContainer';
import LowerBanner from '../components/banner/LowerBanner';

import { useData } from '../dataContext';

const Home: React.FC = () => {
  const { flowData } = useData();

  useEffect(() => {
    toggleDarkTheme(isDarkModeDefault());
  }, []);

  if (flowData.length) {
    return (
      <IonPage>
        <IonHeader><UpperBanner /></IonHeader>
        <IonContent scrollY={false} fullscreen>
          <div className='content'>
            <DailyFlowsContainer />
          </div>
        </IonContent>
        <IonFooter><LowerBanner /></IonFooter>
      </IonPage>
    );
  } else {
    return (
      <IonPage>
        <IonContent>
          <div className='content'>
            <IonSpinner name='dots'></IonSpinner>
            <IonText color='primary'>Fetching River Data</IonText>
          </div>
        </IonContent>
      </IonPage>
    );
  }
};

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
