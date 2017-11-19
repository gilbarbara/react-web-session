import React from 'react';
import { mount } from 'enzyme';
import lolex from 'lolex';

import ReactWebSession, { updateSession } from '../src/index';

jest.mock('history/createBrowserHistory', () => {
  const history = require.requireActual('history');

  return history.createMemoryHistory;
});

const setLocation = location => {
  window.location.hash = location.hash;
  window.location.pathname = location.pathname;
  window.location.search = location.search;
};

const getSession = () => ({
  data: JSON.parse(localStorage.getItem('WebSessionData')),
  count: JSON.parse(localStorage.getItem('WebSessionCount')),
});

const mockCallback = jest.fn();

const props = {
  callback: mockCallback,
};

const setup = (ownProps = props) =>
  mount(
    <ReactWebSession {...ownProps} />,
    { attachTo: document.getElementById('react') }
  );

describe('ReactWebSession', () => {
  let wrapper;
  let clock;

  beforeAll(() => {
    clock = lolex.install({
      now: new Date('1999-12-31 23:15:00'),
    });
  });

  afterAll(() => {
    lolex.uninstall();
    wrapper.unmount();
  });

  describe('a brand new session', () => {
    beforeAll(() => {
      wrapper = setup();
      wrapper.instance().props.history.listen(setLocation);
    });

    it('should start a new session', () => {
      const { count, data } = getSession();
      expect(count).toBe(1);

      expect(mockCallback).lastCalledWith(data);
      expect(data.origin.pathname).toBe('/');
    });

    it('should handle history changes', () => {
      const storage = getSession().data;
      clock.tick('15');

      wrapper.instance().props.history.push('/a');
      const freshStorage = getSession().data;

      expect(mockCallback).lastCalledWith(freshStorage);
      expect(storage.updatedAt !== freshStorage.updatedAt).toBe(true);
    });

    it('should call webSession.update() and extend the session', () => {
      const storage = getSession().data;
      clock.tick('15');

      updateSession();
      const freshStorage = getSession().data;
      expect(mockCallback).lastCalledWith(freshStorage);
      expect(storage.updatedAt !== freshStorage.updatedAt).toBe(true);
    });
  });

  describe('a new visit after 05 minutes', () => {
    beforeAll(() => {
      clock.tick('05:00');
      window.location.pathname = '/b';

      wrapper = setup();
      wrapper.instance().props.history.listen(setLocation);
    });

    it('should still be in the same session', () => {
      const { count, data } = getSession();

      expect(count).toBe(1);
      expect(data.origin.pathname).toBe('/');
      expect(mockCallback).lastCalledWith(data);
    });
  });

  describe('another visit after 30 minutes', () => {
    beforeAll(() => {
      clock.tick('31:00');
      window.location.pathname = '/c';

      wrapper = setup();
      wrapper.instance().props.history.listen(setLocation);
    });

    it('should have started a new session', () => {
      const { count, data } = getSession();

      expect(count).toBe(2);
      expect(data.origin.pathname).toBe('/c');
      expect(mockCallback).lastCalledWith(data);
    });
  });

  describe('a new visit after 10 minutes but it\'s a new day', () => {
    beforeAll(() => {
      clock.tick('10:00');
      window.location.pathname = '/e';

      wrapper = setup();
      wrapper.instance().props.history.listen(setLocation);
    });

    it('should have started a new session', () => {
      const { count, data } = getSession();

      expect(count).toBe(3);
      expect(data.origin.pathname).toBe('/e');
      expect(mockCallback).lastCalledWith(data);
    });
  });

  describe('10 minutes after the last visit', () => {
    beforeAll(() => {
      clock.tick('10:00');
      window.location.pathname = '/g';

      wrapper = setup();
      wrapper.instance().props.history.listen(setLocation);
    });

    it('should still be in the same session', () => {
      const { count, data } = getSession();

      expect(count).toBe(3);
      expect(data.origin.pathname).toBe('/e');
      expect(mockCallback).lastCalledWith(data);
    });
  });

  describe('another visit after 10 minutes but with utm params', () => {
    beforeAll(() => {
      clock.tick('10:00');
      window.location.pathname = '/cpc';
      window.location.search = '?utm_source=cpc';

      wrapper = setup();
      wrapper.instance().props.history.listen(setLocation);
    });

    it('should have started a new session', () => {
      const { count, data } = getSession();

      expect(count).toBe(4);
      expect(data.origin.pathname).toBe('/cpc');
      expect(mockCallback).lastCalledWith(data);
    });
  });

  describe('just 5 minutes after the last but no params', () => {
    beforeAll(() => {
      clock.tick('05:00');
      window.location.pathname = '/about';
      window.location.search = '';

      wrapper = setup();
      wrapper.instance().props.history.listen(setLocation);
    });

    it('should still be in the same session', () => {
      const { count, data } = getSession();

      expect(count).toBe(4);
      expect(data.origin.pathname).toBe('/cpc');
      expect(mockCallback).lastCalledWith(data);
    });
  });

  describe('another 10 minutes but a new campaign', () => {
    beforeAll(() => {
      clock.tick('10:00');
      window.location.pathname = '/affiliate';
      window.location.search = '?utm_source=affiliate';

      wrapper = setup();
      wrapper.instance().props.history.listen(setLocation);
    });

    it('should have started a new session', () => {
      const { count, data } = getSession();

      expect(count).toBe(5);
      expect(data.origin.pathname).toBe('/affiliate');
      expect(mockCallback).lastCalledWith(data);
    });
  });
});
