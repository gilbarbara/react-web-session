import lolex from 'lolex';
import WebSession from '../src/WebSession';

const mockCallback = jest.fn();

describe('WebSession', () => {
  let webSession;
  let clock;

  describe('with localStorage', () => {
    beforeAll(() => {
      clock = lolex.install({
        now: new Date('1999-12-31 23:15:00'),
      });

      webSession = new WebSession(mockCallback);
    });

    afterAll(() => {
      lolex.uninstall();
    });

    it('should start a new session', () => {
      expect(webSession.data)
        .toEqual({
          origin: { hash: '', pathname: '/', search: '' },
          utm: {},
          updatedAt: 'Fri, 31 Dec 1999 23:15:00 GMT'
        });
    });

    it('should extend the session by 15 seconds', () => {
      const storage = webSession.data;
      clock.tick('15');

      webSession.update();

      const freshStorage = webSession.data;

      expect(mockCallback).lastCalledWith(freshStorage);
      expect(storage.updatedAt !== freshStorage.updatedAt).toBe(true);
    });

    it('should still be in the same session after 5 minutes', () => {
      clock.tick('05:00');
      window.location.pathname = '/b';

      webSession.update();

      const { count, data } = webSession;

      expect(count).toBe(1);
      expect(mockCallback).lastCalledWith(data);
    });

    it('should start a new session after 30 minutes', () => {
      clock.tick('31:00');
      window.location.pathname = '/c';

      webSession.update();

      const { count, data } = webSession;

      expect(count).toBe(2);
      expect(mockCallback).lastCalledWith(data);
    });

    it('should start a new session after midnight', () => {
      clock.tick('10:00');
      window.location.pathname = '/e';

      webSession.update();
      const { count, data } = webSession;

      expect(count).toBe(3);
      expect(mockCallback).lastCalledWith(data);
    });

    it('should still be in the same session after 10 minutes', () => {
      clock.tick('10:00');
      window.location.pathname = '/g';

      webSession.update();

      const { count, data } = webSession;

      expect(count).toBe(3);
      expect(mockCallback).lastCalledWith(data);
    });

    it('should have started a new session after 10 minutes but utm params', () => {
      clock.tick('10:00');
      window.location.pathname = '/cpc';
      window.location.search = '?utm_source=cpc';

      webSession.update();

      const { count, data } = webSession;

      expect(count).toBe(4);
      expect(mockCallback).lastCalledWith(data);
    });

    it('should still be in the same session after 5 minutes with a new query but no utm params', () => {
      clock.tick('05:00');
      window.location.pathname = '/photos';
      window.location.search = '?color=red';

      webSession.update();

      const { count, data } = webSession;

      expect(count).toBe(4);
      expect(mockCallback).lastCalledWith(data);
    });

    it('should still be in the same session after 5 but no params', () => {
      clock.tick('05:00');
      window.location.pathname = '/about';
      window.location.search = '';

      webSession.update();

      const { count, data } = webSession;

      expect(count).toBe(4);
      expect(mockCallback).lastCalledWith(data);
    });

    it('should have started a new session after 10 minutes but with a new campaign', () => {
      clock.tick('10:00');
      window.location.pathname = '/affiliate';
      window.location.search = '?utm_source=affiliate';

      webSession.update();

      const { count, data } = webSession;

      expect(count).toBe(5);
      expect(mockCallback).lastCalledWith(data);
    });

    it('should have started a new session after 60 minutes', () => {
      clock.tick('01:00:00');
      window.location.pathname = '/';
      window.location.search = '';

      webSession.update();

      const { count, data } = webSession;

      expect(count).toBe(6);
      expect(mockCallback).lastCalledWith(data);
    });
  });

  describe('without localStorage', () => {
    beforeAll(() => {
      window.isLocalStorageSupported = false;
      window.location.pathname = '/';
      window.location.search = '';

      clock = lolex.install({
        now: new Date('1999-12-31 23:15:00'),
      });

      webSession = new WebSession();
      webSession.init();
    });

    afterAll(() => {
      lolex.uninstall();
    });

    it('should start a new session', () => {
      expect(webSession.data)
        .toEqual({
          origin: { hash: '', pathname: '/', search: '' },
          utm: {},
          updatedAt: 'Fri, 31 Dec 1999 23:15:00 GMT'
        });
    });
  });
});

