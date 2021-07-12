import { ReactNode, useEffect, useRef } from 'react';
import { createBrowserHistory, History } from 'history';
import WebSession, { AnyObject, Options, Session } from 'web-session';

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

  const setData = useRef(() => {
    webSession.update(data);
  });

  useEffect(() => {
    webSession.init({
      callback,
      duration,
      name,
      timezone,
    });
    setData.current();

    const removeListener = history.listen(() => {
      setData.current();
    });

    return () => {
      removeListener();
    };
  }, [callback, duration, history, name, timezone]);

  if (typeof children === 'function') {
    return children(webSession.session, history);
  }

  return children;
}

export default ReactWebSession;
export { Session };
