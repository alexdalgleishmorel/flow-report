import { IonContent, IonPage } from '@ionic/react';

import Countdown from '../components/countdown/Countdown';
import './Home.css';
import DailyFlowsContainer from '../components/dailyFlowsContainer/DailyFlowsContainer';

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen>
        <Countdown />
        <DailyFlowsContainer />
      </IonContent>
    </IonPage>
  );
};

export default Home;
