import ReactGA from 'react-ga4';

export const initGA = () => {
  ReactGA.initialize('G-TRVR4EKP6X');
};

export const logPageView = (path: string) => {
  ReactGA.send({ hitType: 'pageview', page: path });
};

export const logEvent = (action: string, category = 'interaction', label = '') => {
  ReactGA.event({ category, action, label });
};
