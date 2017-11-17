import React from 'react';
import PropTypes from 'prop-types';
import createHistory from 'history/createBrowserHistory';
import WebSession from './WebSession';

export const webSession = new WebSession();

export default class ReactWebSession extends React.Component {
  constructor(props) {
    super(props);

    this.removeListener = () => {};
    this.defaultData = {
      origin: {
        hash: '',
        pathname: '',
        search: '',
      },
      utm: {},
      ...webSession.data,
    };
  }

  static propTypes = {
    data: PropTypes.object,
    history: PropTypes.object,
  };

  static defaultProps = {
    history: createHistory(),
  };

  componentDidMount() {
    const { history } = this.props;

    this.setChanges(history.location, true);
    this.removeListener = history.listen(location => {
      this.setChanges(location);
    });
  }

  componentWillUnmount() {
    this.removeListener();
  }

  setChanges = (location, initial = false) => {
    const { data } = this.props;
    const { hash, pathname, search } = location;
    let utm = { ...this.defaultData.utm };
    let origin = { ...this.defaultData.origin };

    if (initial) {
      origin = {
        hash,
        pathname,
        search,
      };

      utm = this.getUTMs(search);
    }

    webSession.data = {
      origin,
      utm,
      ...data,
    };
  };

  getUTMs = search => {
    const { utm } = webSession.data;
    console.log('getUTMs', !!search, webSession.isNewSession());

    if (!search && !webSession.isNewSession()) {
      console.log('getUTMs', 'storage');
      return utm;
    }

    const currentUTMs = search.slice(1)
      .split('&')
      .map(d => {
        const [key, value] = d.split('=');

        return [key, value];
      })
      .reduce((acc, [key, value]) => {
        if (key.startsWith('utm_')) {
          acc[key.slice(4)] = value;
        }

        return acc;
      }, {});

    if (JSON.stringify(utm) !== JSON.stringify(currentUTMs)) {
      console.log('addCount');
      webSession.count += 1;
    }

    return currentUTMs;
  };

  render() {
    return (
      <div key="ReactWebSession">
        ReactWebSession V1
      </div>
    );
  }
}
