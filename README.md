# react-web-session

[![NPM version](https://badge.fury.io/js/react-web-session.svg)](https://www.npmjs.com/package/react-web-session)
[![build status](https://travis-ci.org/gilbarbara/react-web-session.svg)](https://travis-ci.org/gilbarbara/react-web-session)
[![Maintainability](https://api.codeclimate.com/v1/badges/d81d926e61fefdb7a9e3/maintainability)](https://codeclimate.com/github/gilbarbara/react-web-session/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/d81d926e61fefdb7a9e3/test_coverage)](https://codeclimate.com/github/gilbarbara/react-web-session/test_coverage)

**Keep user session history**

How many sessions does it takes for an user to create an account? Or purchase something?  
Now you can know!

***What is a session anyway?***  
This is how a web session is defined by Google Analytics:  

```
a period of time (30 minutes by default) that is extended automatically upon user interaction.
```

***How does it ends?***    

- after 30 minutes of inactivity.
- at midnight (based on your GA settings, not client timezone).
- campaing query change (utm or gclid)

--

[![Edit react-web-session demo](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/n40w8w88jl)

### Stored data
```js
{
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
}
```

### References
[Counting web sessions with JavaScript](https://swizec.com/blog/counting-web-sessions-javascript/swizec/7598) by @Swizec  
[How a web session is defined in Analytics](https://support.google.com/analytics/answer/2731565?hl=en)
