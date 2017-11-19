import React from 'react';
import PropTypes from 'prop-types';
import createHistory from 'history/createBrowserHistory';
import WebSession from './WebSession';

const webSession = new WebSession();

export const updateSession = webSession.update;

export default class ReactWebSession extends React.Component {
  static propTypes = {
    callback: PropTypes.func,
    data: PropTypes.object,
    history: PropTypes.object,
  };

  static defaultProps = {
    history: createHistory(),
  };

  componentDidMount() {
    const { callback, history } = this.props;

    webSession.init(callback);
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

    webSession.setData(data);
  };

  render() {
    return (<div key="ReactWebSession" />);
  }
}
