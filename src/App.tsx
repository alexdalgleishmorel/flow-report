import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

import { DataProvider } from './dataContext';

const WINDOW_HEIGHT_LIMIT = 300;
const WINDOW_WIDTH_LIMIT = 450;

export const PREFERS_DARK_COLOR_SCHEME = 'PREFERS_DARK_COLOR_SCHEME';
export const PREFERS_TWELVE_HOUR = 'PREFERS_TWELVE_HOUR';
export const PREFERRED_FLOW_RATE = 'PREFERRED_FLOW_RATE';

export function isNarrowLandscape(): boolean {
  return window.innerHeight < WINDOW_HEIGHT_LIMIT && window.matchMedia("(orientation: landscape)").matches;
}
export function isNarrowWidth(): boolean {
  return window.innerWidth < WINDOW_WIDTH_LIMIT;
}

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <DataProvider>
          <Home />
        </DataProvider>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
