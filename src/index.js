import React from 'react';
import PropTypes from 'prop-types';
import createHistory from 'history/createBrowserHistory';
import WebSession from 'web-session';

const webSession = new WebSession();

export const updateSession = webSession.update;

export default class ReactWebSession extends React.Component {
  static propTypes = {
    callback: PropTypes.func,
    data: PropTypes.object,
    duration: PropTypes.number,
    history: PropTypes.object,
    name: PropTypes.string,
    timezone: PropTypes.string,
  };

  static defaultProps = {
    duration: 30,
    history: createHistory(),
    name: 'WebSessionData',
    timezone: 'UTC',
  };

  componentDidMount() {
    const { callback, duration, history, name, timezone } = this.props;

    webSession.init({
      callback,
      duration,
      name,
      timezone,
    });
    this.setData();

    this.removeListener = history.listen(() => {
      this.setData();
    });
  }

  componentWillUnmount() {
    /* istanbul ignore else */
    if (this.removeListener) {
      this.removeListener();
    }
  }

  setData = () => {
    const { data } = this.props;

    webSession.update(data);
  };

  render() {
    return (<div key="ReactWebSession" />);
  }
}
