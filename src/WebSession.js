import {
  hasLocalStorage,
  parseQuery,
  shallowCompare,
  store,
} from './utils';

export default class WebSession {
  constructor(callback) {
    if (!hasLocalStorage()) {
      console.error('localStorage is not supported'); //eslint-disable-line no-console
    }

    this.init(callback);
  }

  init(callback = () => {}) {
    this.sessionData = store.get('WebSessionData') || {
      origin: this.getOrigin(),
      utm: this.getUTMs(),
      updatedAt: new Date().toUTCString(),
    };
    this.sessionCount = Number(store.get('WebSessionCount')) || 0;

    this.callback = callback;
  }

  getUTMs(search = window.location.search) {
    const { utm = {} } = this.data;

    if (!search) {
      return utm;
    }

    const nextUTM = parseQuery(search)
      .reduce((acc, [key, value]) => {
        /* istanbul ignore else */
        if (key.startsWith('utm_')) {
          acc[key.slice(4)] = value;
        }

        return acc;
      }, {});

    return {
      ...utm,
      ...nextUTM,
    };
  }

  getOrigin(location = window.location) {
    const { hash, pathname, search } = location;

    return {
      hash,
      pathname,
      search,
    };
  }

  isNewSession() {
    const { updatedAt, utm } = this.data;

    const lastActive = new Date(updatedAt);
    const now = new Date();
    /*
    if (
      [
        !shallowCompare(utm, this.getUTMs()),
        !this.hasData(),
        (now - lastActive) / 1000 / 60 > 30, // 30 minutes of inactivity
        now.toDateString() !== lastActive.toDateString(), // a new day
      ].some(d => d)
    ) {
      console.log({
        '!utm': !shallowCompare(utm, this.getUTMs()),
        '!hasData': !this.hasData(),
        '> 30 min': (now - lastActive) / 1000 / 60 > 30, // 30 minutes of inactivity
        'new day': now.toDateString() !== lastActive.toDateString(),
      });
    }
    */

    return [
      !this.hasData(),
      !shallowCompare(utm, this.getUTMs()), // utm has changed
      (now - lastActive) / 1000 / 60 > 30, // 30 minutes of inactivity
      now.toDateString() !== lastActive.toDateString(), // a new day
    ].some(d => d);
  }

  hasData() {
    return !!store.get('WebSessionData');
  }

  setData(data) {
    /* istanbul ignore else */
    const { origin, utm } = this.data;

    const nextData = {
      ...data,
      origin,
      utm,
      updatedAt: new Date().toUTCString(),
    };

    if (this.isNewSession()) {
      nextData.origin = this.getOrigin();
      nextData.utm = this.getUTMs();
      this.count += 1;
    }

    this.sessionData = nextData;
    this.callback(nextData);
    store.set('WebSessionData', nextData);
  }

  update = () => {
    this.setData({ ...this.data });
  };

  get data() {
    return this.sessionData || {};
  }

  set count(count) {
    this.sessionCount = count;
    store.set('WebSessionCount', count);
  }

  get count() {
    return this.sessionCount;
  }
}
