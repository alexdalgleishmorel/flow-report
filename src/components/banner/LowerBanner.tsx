import { IonText, IonRange, IonToggle } from "@ionic/react";

import './LowerBanner.css';

function LowerBanner() {
    return (
        <div className='bannerContainer'>
            <div className='titleValueStacked'>
                <IonText color='medium' className='title'>ADJUST TARGET FLOW</IonText>
                <div className="rangeContainer">
                    <IonRange></IonRange>
                </div>
            </div>
        </div>
    );
}

export default LowerBanner;
