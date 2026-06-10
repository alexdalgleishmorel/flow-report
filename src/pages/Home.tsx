import { IonContent, IonPage, IonSpinner, IonText } from '@ionic/react';

import DayDetail from '../components/flowReport/DayDetail';
import FlowReport from '../components/flowReport/FlowReport';
import { useData } from '../dataContext';

import './Home.css';

const Home = () => {
  const { flowData, selectedIndex } = useData();

  if (!flowData.length) {
    return <Loading></Loading>;
  }

  return (
    <IonPage>
      <IonContent scrollY={false}>
        {selectedIndex >= 0 ? <DayDetail /> : <FlowReport />}
      </IonContent>
    </IonPage>
  );
};

function Loading() {
  return (
    <div className='loading-screen-content'>
      <IonSpinner name='dots'></IonSpinner>
      <IonText color='primary'>Fetching River Data</IonText>
    </div>
  );
}

export default Home;
