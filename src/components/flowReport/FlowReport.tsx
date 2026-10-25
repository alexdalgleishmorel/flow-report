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

function DayCard({ report, onSelect }: { report: DayReport; onSelect: () => void }) {
  const runs = valueRuns(report);

  const sunKind = (hour: number): 'rise' | 'set' | null =>
    hour === report.sunriseHour ? 'rise' : hour === report.sunsetHour ? 'set' : null;

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
        {/* Markers under the axis, each centered on its own hour column. Suns
            and "now" get separate fixed lines: on narrow screens the pill is
            wider than a column, so on a shared line a sun in a neighboring
            hour would collide with it. */}
        <div className="fr-grid24 fr-markers fr-sunrow">
          {report.values.map((_, hour) => {
            const sun = sunKind(hour);
            return sun && (
              <div key={hour} className="fr-cell" style={{ gridRow: 1, gridColumn: hour + 1 }}>
                <SunIcon kind={sun} />
              </div>
            );
          })}
        </div>
        {/* reserved on every card so all strips share one layout */}
        <div className="fr-grid24 fr-markers fr-nowrow">
          {report.nowHour != null && (
            <div className="fr-cell" style={{ gridRow: 1, gridColumn: report.nowHour + 1 }}>
              <span className="fr-nowpill">now</span>
            </div>
          )}
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
