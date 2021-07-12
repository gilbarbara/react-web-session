import { ReactNode, useCallback, useEffect, useState } from 'react';
import { createBrowserHistory, History } from 'history';
import WebSession, { AnyObject, Options, Session } from 'web-session';

import { useDeepCompareEffect } from './helpers';

interface Props extends Partial<Options> {
  children?: ReactNode | ((session: Session, history: History) => ReactNode);
  data?: AnyObject;
  history?: History;
}

const webSession = new WebSession();

export const updateSession = webSession.update;

function ReactWebSession(props: Props) {
  const {
    callback,
    children = null,
    data,
    duration = 30,
    history = createBrowserHistory(),
    name = 'WebSessionData',
    timezone = 'UTC',
  } = props;
  const [sessionData, setSessionData] = useState(data);

  const setData = useCallback(() => {
    updateSession(sessionData);
  }, [sessionData]);

  useEffect(() => {
    webSession.init({
      callback,
      duration,
      name,
      timezone,
    });
    setData();

    const removeListener = history.listen(() => {
      setData();
    });

    return () => {
      removeListener();
    };
  }, [callback, duration, history, name, setData, timezone]);

  useDeepCompareEffect(() => {
    setSessionData(data);
  }, [data]);

  if (typeof children === 'function') {
    return children(webSession.session, history);
  }

  return children;
}

export default ReactWebSession;
export { Session };
