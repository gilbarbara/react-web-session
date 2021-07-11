# react-web-session

[![NPM version](https://badge.fury.io/js/react-web-session.svg)](https://www.npmjs.com/package/react-web-session) [![build status](https://travis-ci.org/gilbarbara/react-web-session.svg)](https://travis-ci.org/gilbarbara/react-web-session) [![Maintainability](https://api.codeclimate.com/v1/badges/d81d926e61fefdb7a9e3/maintainability)](https://codeclimate.com/github/gilbarbara/react-web-session/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/d81d926e61fefdb7a9e3/test_coverage)](https://codeclimate.com/github/gilbarbara/react-web-session/test_coverage)

> A React wrapper for [web-session](https://github.com/gilbarbara/web-session).

How many sessions does it take for a user to create an account or purchase something?  
Now you can track these metrics!

***What is a session anyway?***  
This is how a web session is defined by Google Analytics:  

```
a period of time (30 minutes by default) that is extended automatically upon user interaction.
```

***How does it end?***    

- after 30 minutes of inactivity.
- at midnight (based on your GA settings, not client timezone).
- campaign query change (utm or gclid)

## Usage

```bash
npm install --save react-web-session
```

And require it in your root component

```typescript jsx
import WebSession from 'react-web-session';

const App = () => (
  <div>
    <WebSession />
    ...
  </div>
);
```

[![Edit react-web-session demo](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/n40w8w88jl)

## Props

<details>
  <summary>Type Definition</summary>

  ```typescript
type AnyObject<T = any> = Record<string, T>;
type NarrowPlainObject<T> = Exclude<T, any[] | ((...items: any[]) => any)>;

interface Origin {
  createdAt: string;
  href: string;
  referrer: string;
}

interface Session {
  current: CurrentSession;
  data?: AnyObject;
  history: Origin[];
  origin: Origin;
  visits: number;
}
  ```
</details>

```typescript
interface Props {
  /*
   * A function called on every update with the session data.
   * @default noop
   */
  callback?: (session: Session) => void;
  /**
   * A render props function or component
   */
  children?: ReactNode | ((session: Session, history: History) => ReactNode);
  /*
   * The session data
   */
  data?: AnyObject;
  /*
   * The session duration in minutes
   * @default 30
   */
  duration?: number;
  /**
   * An instance of `createBrowserHistory` from the history module.
   * @default an instance of createBrowserHistory
   */
  history?: History;
  /*
   * The max history size
   * @default 50
   */
  historySize?: number;
  /*
   * The session name
   * @default 'WebSessionData'
   */
  name?: string;
  /*
   * The session timezone used in GA
   * @default 'UTC'
   */
  timezone?: string;
}
```

### Session data
```typescript
({
  origin: {
    createdAt: '2000-01-01T00:15:00.000Z',
    href: '/',
    referrer: ''
  },
  current: {
    campaign: {},
    expiresAt: '2000-01-01T00:15:00.000Z',
    href: '/',
    referrer: ''
  },
  data: { // if using the optional data parameter with update
    something: true
  },
  history: [ // the different campaigns the user has entered in your site
    {
      createdAt: '2000-01-01T00:15:00.000Z',
      href: '/cpc?utm_source=cpc',
      referrer: ''
    }
  ],
  visits: 1
})
```

### References
[Counting web sessions with JavaScript](https://swizec.com/blog/counting-web-sessions-javascript/swizec/7598) by @Swizec  
[How a web session is defined in Analytics](https://support.google.com/analytics/answer/2731565?hl=en)
