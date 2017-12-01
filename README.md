# react-web-session

[![NPM version](https://badge.fury.io/js/react-web-session.svg)](https://www.npmjs.com/package/react-web-session)
[![build status](https://travis-ci.org/gilbarbara/react-web-session.svg)](https://travis-ci.org/gilbarbara/react-web-session)
[![Maintainability](https://api.codeclimate.com/v1/badges/d81d926e61fefdb7a9e3/maintainability)](https://codeclimate.com/github/gilbarbara/react-web-session/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/d81d926e61fefdb7a9e3/test_coverage)](https://codeclimate.com/github/gilbarbara/react-web-session/test_coverage)

How many sessions does it takes for an user to create an account? Or purchase something?  
Now you can track these metrics!

***What is a session anyway?***  
This is how a web session is defined by Google Analytics:  

```
a period of time (30 minutes by default) that is extended automatically upon user interaction.
```

***How does it ends?***    

- after 30 minutes of inactivity.
- at midnight (based on your GA settings, not client timezone).
- campaing query change (utm or gclid)

## Usage

```bash
npm install --save react-web-session
```

And require it in your component

```jsx
import WebSession from 'react-web-session';

const App = () => (
  <div>
    <WebSession
      callback={sessionCallback}
      history={yourOwnHistory}
      timezone="America/New_York"
    />
  </div>
);
```

## Props

**callback** {function}: A function to receive the session data.

**data** {object}: A custom object to be saved with in the session data.

**duration** {number}: The duration of the session in minutes. Defaults to `30`

**history** {object}: An instance of `createBrowserHistory` from [history](https://github.com/ReactTraining/history). Usually the same instance you passed to your router. Defaults to a new instance of `history/createBrowserHistory`

**name** {string}: The name of the session in localStorage. Defaults to `WebSessionData`

**timezone** {number}: The timezone used in GA. Defaults to `UTC`


[![Edit react-web-session demo](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/n40w8w88jl)

### Stored data
```js
{
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
  history: [
    {
      createdAt: '2000-01-01T00:15:00.000Z',
      href: '/cpc?utm_source=cpc',
      referrer: ''
    },
    ...
  ],
  visits: 1
}
```

### References
[Counting web sessions with JavaScript](https://swizec.com/blog/counting-web-sessions-javascript/swizec/7598) by @Swizec  
[How a web session is defined in Analytics](https://support.google.com/analytics/answer/2731565?hl=en)
