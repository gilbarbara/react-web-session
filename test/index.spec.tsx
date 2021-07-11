import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { advanceBy, advanceTo, clear } from 'jest-date-mock';
import { Session } from 'web-session';

import ReactWebSession, { updateSession } from '../src';

type Props = React.ComponentProps<typeof ReactWebSession>;

function getSession() {
  return JSON.parse(localStorage.getItem('WebSessionData') || '');
}

function tick(input: number, inMinutes?: boolean) {
  let value = input;

  if (inMinutes) {
    value = input * 60;
  }

  advanceBy(value * 1000);
}

const mockCallback = jest.fn();

const history = createMemoryHistory();

const props = {
  callback: (session: Session) => mockCallback(session),
  history,
};

const setup = (ownProps: Props = props) => render(<ReactWebSession {...ownProps} />);

describe('ReactWebSession', () => {
  beforeAll(() => {
    localStorage.clear();

    advanceTo(new Date('1999-12-31 23:15:00'));
  });

  afterAll(() => {
    clear();
  });

  afterEach(() => {
    mockCallback.mockClear();
  });

  describe('a brand new session', () => {
    it('should start a new session', () => {
      setup();

      const session = getSession();

      expect(mockCallback).toHaveBeenLastCalledWith(session);
      expect(session.current.href).toBe('/');
      expect(session.current.campaign).toEqual({});
      expect(session.visits).toBe(1);
    });

    it('should handle history changes', () => {
      setup();
      const initialSession = getSession();

      tick(15);
      history.push('/a');

      const session = getSession();

      expect(mockCallback).toHaveBeenLastCalledWith(session);
      expect(session.current.href).toBe('/');
      expect(session.current.campaign).toEqual({});
      expect(session.visits).toBe(1);
      expect(initialSession.current.expiresAt !== session.current.expiresAt).toBe(true);
    });

    it('should call updateSession() and extend the session', () => {
      setup();
      const initialSession = getSession();

      tick(15);
      updateSession();

      const session = getSession();

      expect(mockCallback).toHaveBeenLastCalledWith(session);
      expect(session.current.href).toBe('/');
      expect(session.current.campaign).toEqual({});
      expect(session.visits).toBe(1);
      expect(initialSession.current.expiresAt !== session.current.expiresAt).toBe(true);
    });
  });

  describe('a new visit after 05 minutes', () => {
    beforeAll(() => {
      tick(5, true);
      window.location.assign('/b');

      setup();
    });

    it('should still be in the same session', () => {
      const session = getSession();

      expect(mockCallback).toHaveBeenLastCalledWith(session);
      expect(session.current.href).toBe('/');
      expect(session.current.campaign).toEqual({});
      expect(session.visits).toBe(1);
    });
  });

  describe('another visit after 30 minutes', () => {
    beforeAll(() => {
      tick(31, true);
      window.location.assign('/c');

      setup();
    });

    it('should have started a new session', () => {
      const session = getSession();

      expect(mockCallback).toHaveBeenLastCalledWith(session);
      expect(session.current.href).toBe('/c');
      expect(session.current.campaign).toEqual({});
      expect(session.history).toHaveLength(0);
      expect(session.visits).toBe(2);
    });
  });

  describe("a new visit after 10 minutes but it's a new day", () => {
    beforeAll(() => {
      tick(10, true);
      window.location.assign('/e');

      setup();
    });

    it('should have started a new session', () => {
      const session = getSession();

      expect(mockCallback).toHaveBeenLastCalledWith(session);
      expect(session.current.href).toBe('/e');
      expect(session.current.campaign).toEqual({});
      expect(session.history).toHaveLength(0);
      expect(session.visits).toBe(3);
    });
  });

  describe('10 minutes after the last visit', () => {
    beforeAll(() => {
      tick(10, true);
      window.location.assign('/g');

      setup();
    });

    it('should still be in the same session', () => {
      const session = getSession();

      expect(mockCallback).toHaveBeenLastCalledWith(session);
      expect(session.current.href).toBe('/e');
      expect(session.current.campaign).toEqual({});
      expect(session.history).toHaveLength(0);
      expect(session.visits).toBe(3);
    });
  });

  describe('another visit after 10 minutes but it has a new campaign', () => {
    beforeAll(() => {
      tick(10, true);
      window.location.assign('/cpc?utm_source=cpc');

      setup();
    });

    it('should have started a new session', () => {
      const session = getSession();

      expect(mockCallback).toHaveBeenLastCalledWith(session);
      expect(session.current.href).toBe('/cpc?utm_source=cpc');
      expect(session.current.campaign).toEqual({ source: 'cpc' });
      expect(session.history).toHaveLength(1);
      expect(session.visits).toBe(4);
    });
  });

  describe('just 5 minutes after the last but no campaign', () => {
    beforeAll(() => {
      tick(5, true);
      window.location.assign('/about');

      setup();
    });

    it('should still be in the same session', () => {
      const session = getSession();

      expect(mockCallback).toHaveBeenLastCalledWith(session);
      expect(session.current.href).toBe('/cpc?utm_source=cpc');
      expect(session.current.campaign).toEqual({ source: 'cpc' });
      expect(session.history).toHaveLength(1);
      expect(session.visits).toBe(4);
    });
  });

  describe('another 10 minutes but a new campaign', () => {
    beforeAll(() => {
      tick(10, true);
      window.location.assign('/affiliate?utm_source=affiliate');

      setup();
    });

    it('should have started a new session', () => {
      const session = getSession();

      expect(mockCallback).toHaveBeenLastCalledWith(session);
      expect(session.current.href).toBe('/affiliate?utm_source=affiliate');
      expect(session.current.campaign).toEqual({ source: 'affiliate' });
      expect(session.history).toHaveLength(2);
      expect(session.visits).toBe(5);
    });
  });

  describe('another 60 minutes', () => {
    beforeAll(() => {
      tick(60, true);
      window.location.assign('/');

      setup();
    });

    it('should have started a new session', () => {
      const session = getSession();

      expect(mockCallback).toHaveBeenLastCalledWith(session);
      expect(session.current.href).toBe('/');
      expect(session.current.campaign).toEqual({ source: 'affiliate' });
      expect(session.history).toHaveLength(2);
      expect(session.visits).toBe(6);
    });
  });

  describe('with AdWords query', () => {
    beforeAll(() => {
      tick(10, true);
      window.location.assign('/products/1234?gclid=3097hds92ghsd775sg72sg256rs2s35d3');

      setup();
    });

    it('should have started a new session', () => {
      const session = getSession();

      expect(mockCallback).toHaveBeenLastCalledWith(session);
      expect(session.current.href).toBe('/products/1234?gclid=3097hds92ghsd775sg72sg256rs2s35d3');
      expect(session.current.campaign).toEqual({ gclid: '3097hds92ghsd775sg72sg256rs2s35d3' });
      expect(session.history).toHaveLength(3);
      expect(session.visits).toBe(7);
    });
  });

  describe('with children and custom props', () => {
    it('should render the visits', () => {
      setup({
        ...props,
        children: ({ visits }) => <div>{JSON.stringify(visits, null, 2)}</div>,
        duration: 60,
        history: undefined,
        name: 'WebSession',
        timezone: 'America/New_York',
      });

      expect(screen.getByText('7')).toMatchSnapshot();
    });
  });
});
