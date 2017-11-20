import {
  hasLocalStorage,
  parseQuery,
  shallowCompare,
  store,
} from './utils';

export default class WebSession {
  constructor(options) {
    if (!hasLocalStorage()) {
      console.error('localStorage is not supported'); //eslint-disable-line no-console
    }

    this.defaultOptions = {
      callback: () => {},
      duration: 30,
      name: 'WebSessionData',
      timezone: '',
    };

    this.init(options);
  }

  init(options = {}) {
    this.options = {
      ...this.defaultOptions,
      ...options,
    };

    this.sessionData = store.get(this.options.name) || {
      origin: {
        ...this.getLocation(),
        createdAt: new Date().toUTCString(),
      },
      current: {
        ...this.getLocation(),
        campaign: this.getCampaign(),
        expiresAt: this.getExpirationDate(),
      },
      visits: 0,
    };

    this.update();
  }

  getLocation(location = window.location) {
    const { hash, pathname, search } = location;

    return {
      hash,
      pathname,
      search,
    };
  }

  getCampaign(search = window.location.search) {
    const { current } = this.data;
    const campaign = current ? current.campaign : {};

    if (!search) {
      return campaign;
    }

    const nextCampaign = parseQuery(search)
      .reduce((acc, [key, value]) => {
        /* istanbul ignore else */
        if (key.startsWith('utm_')) {
          acc[key.slice(4)] = value;
        }

        if (key.startsWith('gclid')) {
          acc[key] = value;
        }

        return acc;
      }, {});

    if (Object.keys(nextCampaign).length) {
      return nextCampaign;
    }

    return campaign;
  }

  getExpirationDate() {
    return new Date(Date.now() + (this.options.duration * 60000)).toUTCString();
  }

  isExpired(expiration) {
    const now = new Date();
    const expiresAt = new Date(expiration);
    const issuedAt = new Date(expiresAt.getTime() - (this.options.duration * 60000));

    return (now.toDateString() !== issuedAt.toDateString()) || (expiresAt < now);
  }

  isNewSession() {
    const { current: { campaign, expiresAt } } = this.data;

    /*
    if (
      [
        !shallowCompare(campaign, this.getCampaign()),
        !this.hasData(),
        this.isExpired(expiresAt), // a new day
      ].some(d => d)
    ) {
      console.log({
        '!hasData': !this.hasData(),
        '!campaign': !shallowCompare(campaign, this.getCampaign()),
        'is expired': this.isExpired(expiresAt),
      });
    }
    */

    return [
      !this.hasData(),
      !shallowCompare(campaign, this.getCampaign()), // campaign has changed
      this.isExpired(expiresAt), // session expired
    ].some(d => d);
  }

  hasData() {
    return !!store.get(this.options.name);
  }

  setData(data) {
    /* istanbul ignore else */
    const { current, origin, visits } = this.data;

    const nextData = {
      ...data,
      origin,
      visits,
      current: {
        ...current,
        expiresAt: this.getExpirationDate(),
      },
    };

    if (this.isNewSession()) {
      nextData.current = {
        ...this.getLocation(),
        campaign: this.getCampaign(),
        expiresAt: this.getExpirationDate(),
      };
      nextData.visits += 1;
    }

    this.sessionData = nextData;
    this.options.callback(nextData);
    store.set(this.options.name, nextData);
  }

  update = () => {
    this.setData(this.sessionData);
  };

  get data() {
    return this.sessionData || {};
  }
}
