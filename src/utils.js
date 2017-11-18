export function hasLocalStorage() {
  if (typeof window.isLocalStorageSupported === 'undefined') {
    const testKey = 'test';
    const storage = window.localStorage;

    try {
      storage.setItem(testKey, '1');
      storage.removeItem(testKey);
      window.isLocalStorageSupported = true;
    }
    catch (error) {
      window.isLocalStorageSupported = false;
    }
  }

  return window.isLocalStorageSupported;
}

export function shallowCompare(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function parseQuery(query) {
  return query.slice(1)
    .split('&')
    .map(d => {
      const [key, value] = d.split('=');

      return [key, value];
    });
}

export const store = {
  get(name) {
    /* istanbul ignore else */
    if (hasLocalStorage()) {
      return JSON.parse(window.localStorage.getItem(name));
    }

    return null;
  },
  set(name, data) {
    /* istanbul ignore else */
    if (hasLocalStorage()) {
      window.localStorage.setItem(name, JSON.stringify(data));
    }
  },
  remove(name) {
    /* istanbul ignore else */
    if (hasLocalStorage()) {
      window.localStorage.removeItem(name);
    }
  },
};
