import { IonText } from "@ionic/react";

import { FlowData } from "../../../pages/Home";

import './DailyFlowChart.css';

export function DailyFlowsChart({flowData}: { flowData: FlowData }) {
    return <IonText color='primary'>Daily Flows Chart</IonText>;
}

export default DailyFlowsChart;
