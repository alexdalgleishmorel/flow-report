import { IonToggle } from "@ionic/react";

import { useData } from "../../dataContext";
import './Config.css';

function Config() {
    const { darkMode, twelveHour, setDarkMode, setTwelveHour } = useData();

    return (
        <div className="fr-scope config-page">
            <h2 className="config-title">Configurations</h2>
            <div className="config-item">
                <span className="config-item-label">Dark Mode</span>
                <IonToggle checked={darkMode} onIonChange={event => setDarkMode(event.detail.checked)}></IonToggle>
            </div>
            <div className="config-item">
                <span className="config-item-label">12 Hour</span>
                <IonToggle checked={twelveHour} onIonChange={event => setTwelveHour(event.detail.checked)}></IonToggle>
            </div>
        </div>
    );
}

export default Config;
