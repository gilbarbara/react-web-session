import lolex from 'lolex';
import WebSession from '../src/WebSession';

const mockCallback = jest.fn();

describe('WebSession', () => {
  let webSession;
  let clock;

  describe('using the default options', () => {
    beforeAll(() => {
      localStorage.clear();

      clock = lolex.install({
        now: new Date('1999-12-31 23:15:00'),
      });

      webSession = new WebSession({
        callback: mockCallback,
      });
    });

    afterAll(() => {
      lolex.uninstall();
    });

    it('should start a new session', () => {
      expect(webSession.data)
        .toEqual({
          current: {
            campaign: {},
            expiresAt: 'Fri, 31 Dec 1999 23:45:00 GMT',
            hash: '',
            pathname: '/',
            search: ''
          },
          origin: {
            createdAt: 'Fri, 31 Dec 1999 23:15:00 GMT',
            hash: '',
            pathname: '/',
            search: ''
          },
          visits: 1
        });
    });

    it('should have created the storage items', () => {
      expect(JSON.parse(localStorage.getItem('WebSessionData'))).toEqual(webSession.data);
    });

    it('should extend the session by 15 seconds', () => {
      const { current } = webSession.data;
      clock.tick('15');

      webSession.update();

      const { current: next } = webSession.data;

      expect(current.expiresAt !== next.expiresAt).toBe(true);
      expect(mockCallback).lastCalledWith(webSession.data);
      expect(webSession.data.visits).toBe(1);
    });

    it('should still be in the same session after 5 minutes', () => {
      clock.tick('05:00');
      window.location.pathname = '/b';

      webSession.update();

      expect(mockCallback).lastCalledWith(webSession.data);
      expect(webSession.data.visits).toBe(1);
    });

    it('should start a new session after 30 minutes', () => {
      clock.tick('31:00');
      window.location.pathname = '/c';

      webSession.update();

      expect(mockCallback).lastCalledWith(webSession.data);
      expect(webSession.data.visits).toBe(2);
    });

    it('should start a new session after midnight', () => {
      clock.tick('10:00');
      window.location.pathname = '/e';

      webSession.update();

      expect(mockCallback).lastCalledWith(webSession.data);
      expect(webSession.data.visits).toBe(3);
    });

    it('should still be in the same session after 10 minutes', () => {
      clock.tick('10:00');
      window.location.pathname = '/g';

      webSession.update();

      expect(mockCallback).lastCalledWith(webSession.data);
      expect(webSession.data.visits).toBe(3);
    });

    it('should have started a new session after 10 minutes because there\'s a campaign', () => {
      clock.tick('10:00');
      window.location.pathname = '/cpc';
      window.location.search = '?utm_source=cpc';

      webSession.update();

      expect(mockCallback).lastCalledWith(webSession.data);
      expect(webSession.data.visits).toBe(4);
    });

    it('should still be in the same session after 5 minutes with a new query but no campaign', () => {
      clock.tick('05:00');
      window.location.pathname = '/photos';
      window.location.search = '?color=red';

      webSession.update();

      expect(mockCallback).lastCalledWith(webSession.data);
      expect(webSession.data.visits).toBe(4);
    });

    it('should still be in the same session after 5 but no params', () => {
      clock.tick('05:00');
      window.location.pathname = '/about';
      window.location.search = '';

      webSession.update();

      expect(mockCallback).lastCalledWith(webSession.data);
      expect(webSession.data.visits).toBe(4);
    });

    it('should have started a new session after 10 minutes but with a new campaign', () => {
      clock.tick('10:00');
      window.location.pathname = '/affiliate';
      window.location.search = '?utm_source=affiliate';

      webSession.update();

      expect(mockCallback).lastCalledWith(webSession.data);
      expect(webSession.data.visits).toBe(5);
    });

    it('should have started a new session after 60 minutes', () => {
      clock.tick('01:00:00');
      window.location.pathname = '/';
      window.location.search = '';

      webSession.update();

      expect(mockCallback).lastCalledWith(webSession.data);
      expect(webSession.data.visits).toBe(6);
    });
  });

  describe('without localStorage', () => {
    beforeAll(() => {
      localStorage.clear();
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
          current: {
            campaign: {},
            expiresAt: 'Fri, 31 Dec 1999 23:45:00 GMT',
            hash: '',
            pathname: '/',
            search: ''
          },
          origin: {
            createdAt: 'Fri, 31 Dec 1999 23:15:00 GMT',
            hash: '',
            pathname: '/',
            search: ''
          },
          visits: 1
        });
    });
  });
});

