import { IonContent, IonFooter, IonIcon, IonModal } from '@ionic/react';
import { arrowBackOutline, optionsOutline } from 'ionicons/icons';
import { useRef } from 'react';

import { logEvent } from '../../analytics';
import { useData } from '../../dataContext';
import Config from '../config/Config';
import SunIcon from './SunIcon';
import { DayReport, buildDayReport, isNow, isSun, valueRuns } from './dayReport';

import './flowTheme.css';
import './FlowReport.css';

// Marker slot under the hour axis: holds the "now" pill on the current hour
// and the sunrise/sunset glyph, all on one fixed line. A sun within an hour
// of "now" sits beside the pill in the now slot — in their own columns they
// collide on narrow screens.
function MarkerSlot({ report, hour, sun }: { report: DayReport; hour: number; sun: 'rise' | 'set' | null }) {
  // beside the pill, the sun goes on the side of "now" its hour falls on;
  // sharing the hour, sunrise leads and sunset trails
  const sunHour = sun === 'rise' ? report.sunriseHour : report.sunsetHour;
  const sunFirst = sunHour != null && (sunHour < hour || (sunHour === hour && sun === 'rise'));
  return (
    <div className="fr-markerslot">
      {sun && sunFirst && <SunIcon kind={sun} />}
      {isNow(report, hour) && <span className="fr-nowpill">now</span>}
      {sun && !sunFirst && <SunIcon kind={sun} />}
    </div>
  );
}

function DayCard({ report, onSelect }: { report: DayReport; onSelect: () => void }) {
  const runs = valueRuns(report);

  const sunKind = (hour: number): 'rise' | 'set' | null =>
    hour === report.sunriseHour ? 'rise' : hour === report.sunsetHour ? 'set' : null;

  const nearNow = (hour: number): boolean =>
    report.nowHour != null && Math.abs(report.nowHour - hour) <= 1;

  // The sun glyph for an hour's marker slot: its own, or a neighbor's when
  // this is the now slot and the sun moved in beside the pill.
  const markerSun = (hour: number): 'rise' | 'set' | null => {
    if (isNow(report, hour)) {
      const near = [report.sunriseHour, report.sunsetHour].find((sunHour) => sunHour != null && nearNow(sunHour));
      return near != null ? sunKind(near) : null;
    }
    return nearNow(hour) ? null : sunKind(hour); // moved into the now slot
  };

  return (
    <div className="fr-daycard" onClick={onSelect}>
      <div className="fr-daycard-head">
        <h3 className="fr-daydate">{report.label}</h3>
      </div>
      <div className="fr-strip">
        {/* Each run of identical consecutive values is one rail (blue when
            surfable, grey otherwise) with the value centered over it */}
        <div className="fr-grid24 fr-runs">
          {runs.map((run, index) => (
            <div
              key={index}
              className={`fr-run is-${run.state}${run.past ? ' is-past' : ''}${run.length === 1 ? ' is-single' : ''}`}
              style={{ gridRow: 1, gridColumn: `${run.start + 1} / span ${run.length}` }}
            >
              <span className="fr-runnum">{run.label}</span>
              <span className="fr-runrail" />
            </div>
          ))}
        </div>
        <div className="fr-grid24 fr-hours">
          {report.values.map((_, hour) => (
            <div key={hour} className="fr-cell">
              <span className={`fr-hr${isSun(report, hour) ? ' is-sun' : ''}${isNow(report, hour) ? ' is-now' : ''}`}>
                {hour}
              </span>
            </div>
          ))}
        </div>
        <div className="fr-grid24 fr-markers">
          {report.values.map((_, hour) => (
            <div key={hour} className="fr-cell">
              <MarkerSlot report={report} hour={hour} sun={markerSun(hour)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FlowReport() {
  const { flowData, historicalFlowData, setSelectedIndex } = useData();
  const modal = useRef<HTMLIonModalElement>(null);
  const reports = flowData.map((data) => buildDayReport(data, historicalFlowData));

  return (
    <div className="fr-scope fr-report">
      <div className="fr-page">
        <header className="fr-pagehead">
          <div className="fr-ph-top">
            <div className="fr-ph-brand">
              <span className="fr-ph-kicker">Mountain Wave Report</span>
            </div>
            <IonIcon
              id="open-config-modal"
              className="fr-config-btn"
              size="large"
              color="primary"
              icon={optionsOutline}
            />
            <IonModal ref={modal} trigger="open-config-modal">
              <IonContent>
                <Config />
              </IonContent>
              <IonFooter className="modal-footer">
                <IonIcon
                  color="primary"
                  size="large"
                  icon={arrowBackOutline}
                  onClick={() => modal.current?.dismiss()}
                />
              </IonFooter>
            </IonModal>
          </div>
        </header>

        <div className="fr-days">
          {reports.map((report, index) => (
            <DayCard
              key={report.label}
              report={report}
              onSelect={() => {
                setSelectedIndex(index);
                logEvent('select_day_card', 'flow_view', `index_${index}`);
              }}
            />
          ))}
        </div>

        <footer className="fr-pagefoot">
          In collaboration with the Alberta River Surfing Association
        </footer>
      </div>
    </div>
  );
}

export default FlowReport;
