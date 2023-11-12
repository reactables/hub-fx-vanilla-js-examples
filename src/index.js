import { HubFactory } from '@hub-fx/core';

// Actions
const INCREMENT = 'INCREMENT';
const increment = () => ({ type: INCREMENT });

const RESET = 'RESET';
const reset = () => ({ type: RESET });

// Reducer function to handle state updates
const countReducer = (state = { count: 0 }, action) => {
  switch (action?.type) {
    case INCREMENT:
      return { count: state.count + 1 };
    case RESET:
      return { count: 0 };
    default:
      return state;
  }
};

// Initialize Hub
const hub = HubFactory();

// Initialize counter store
const counterStore$ = hub.store({ reducer: countReducer });

counterStore$.subscribe(({ count }) => {
  // Update the count when state changes.
  document.getElementById('count').innerHTML = count;
});

// Bind click handlers
document.getElementById('increment').addEventListener('click', () => hub.dispatch(increment()));
document.getElementById('reset').addEventListener('click', () => hub.dispatch(reset()));
