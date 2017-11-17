import React from 'react';
import { mount } from 'enzyme';

import ReactWebSession from '../src/index';

jest.mock('history/createBrowserHistory', () => {
  const history = require.requireActual('history');

  return history.createMemoryHistory;
});

const props = {};

const setup = (ownProps = props) =>
  mount(
    <ReactWebSession {...ownProps} />,
    { attachTo: document.getElementById('react') }
  );

describe('ReactWebSession', () => {
  let wrapper;
  let storage;

  beforeAll(() => {
    // TODO: clean data
    localStorage.removeItem('WebSessionData');
    localStorage.removeItem('WebSessionCount');

    wrapper = setup();
  });

  it('should be a component', () => {
    expect(wrapper.instance() instanceof React.Component).toBe(true);
  });

  it('should render properly', () => {
    storage = JSON.parse(localStorage.getItem('WebSessionData'));
    expect(wrapper.find('ReactWebSession').length).toBe(1);
  });

  it('should handle pathname changes', done => {
    setTimeout(() => {
      wrapper.instance().props.history.replace('/a');
      const freshStorage = JSON.parse(localStorage.getItem('WebSessionData'));

      const updatedAt = new Date(storage.updatedAt);
      const freshUpdatedAt = new Date(freshStorage.updatedAt);

      expect(updatedAt < freshUpdatedAt).toBe(true);

      done();
    }, 1000);
  });
});
