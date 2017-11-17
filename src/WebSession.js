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

export default class WebSession {
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
  }

  isNewSession() {
    const time = this.lastActive;
    const now = new Date();

    return [
      (now - time) / 1000 / 60 > 30,
      now.toUTCString() !== time.toUTCString(),
    ].some(d => d);
  }
}
