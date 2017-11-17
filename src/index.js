import React from 'react';
import PropTypes from 'prop-types';
import createHistory from 'history/createBrowserHistory';

function isLocalStorageSupported() {
  const testKey = 'test';
  const storage = window.localStorage;

  try {
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    return true;
  }
  catch (error) {
    return false;
  }
}

const canUseLocalStorage = isLocalStorageSupported();

class WebSession {
  get count() {
    if (canUseLocalStorage) {
      return Number(window.localStorage.getItem('WebSessionCount'));
    }

    return NaN;
  }

  set count(val) {
    window.localStorage.setItem('WebSessionCount', val);
  }

  get data() {
    const data = window.localStorage.getItem('WebSessionData');

    if (data) {
      return JSON.parse(data);
    }

    return {
      updatedAt: new Date().toUTCString(),
    };
  }

  set data(data) {
    if (canUseLocalStorage) {
      const nextData = JSON.stringify({
        ...data,
        updatedAt: new Date().toUTCString(),
      });

      window.localStorage.setItem('WebSessionData', nextData);

      if (this.isNewSession()) {
        this.count = this.count + 1;
      }
    }
  }

  get lastActive() {
    const { updatedAt } = this.data;

    if (updatedAt) {
      return new Date(updatedAt);
    }

    return new Date();
  }

  update() {
    if (canUseLocalStorage) {
      this.data = { ...this.data };

      if (this.isNewSession()) {
        this.count = this.count + 1;
      }
    }

    console.log('isNewSession', this.isNewSession());
  }

  isNewSession() {
    const time = this.lastActive;
    const now = new Date();

    return [
      (now - time) / 1000 / 60 > 30,
      now.toDateString() !== time.toDateString(),
    ].some(d => d);
  }
}

export const updateSession = new WebSession();

export default class ReactWebSession extends React.Component {
  constructor(props) {
    super(props);

    this.removeListener = () => {};
    this.session = new WebSession();

    console.log(this.session.data);
    this.state = {
      origin: {
        hash: '',
        pathname: '',
        search: '',
      },
      utm: {},
      ...this.session.data,
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

  componentDidUpdate(prevProps, prevState) {
    console.log('componentDidUpdate', this.state);
    if (JSON.stringify(this.state) !== JSON.stringify(prevState)) {
      console.log('componentDidUpdate', true);
      this.session.data = this.state;
    }
  }

  componentWillUnmount() {
    this.removeListener();
  }

  setChanges = (location, initial = false) => {
    const { data } = this.props;
    const { hash, pathname, search } = location;
    let utm = { ...this.state.utm };
    let origin = { ...this.state.origin };

    if (initial) {
      origin = {
        hash,
        pathname,
        search,
      };

      utm = this.getUTMs(search);
    }

    this.setState({
      origin,
      utm,
      ...data,
    });
  };

  getUTMs = search => {
    const { utm } = this.state;
    console.log('getUTMs', !search, !this.session.isNewSession());
    if (!search && !this.session.isNewSession()) {
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
      this.session.count = this.session.count + 1;
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
