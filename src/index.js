import { Counter } from '@hub-fx/examples';

// See for implementation
// https://github.com/hub-fx/hub-fx/tree/main/packages/examples/src/Counter

const {
  state$,
  actions: { increment, reset },
} = Counter();

state$.subscribe(({ count }) => {
  // Update the count when state changes.
  document.getElementById('count').innerHTML = count;
});

// Bind click handlers
document.getElementById('increment').addEventListener('click', increment);
document.getElementById('reset').addEventListener('click', reset);
