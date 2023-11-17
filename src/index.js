import { RxCounter } from '@hub-fx/examples';

// See for implementation and tests:
// https://github.com/hub-fx/hub-fx/tree/main/packages/examples/src/Counter

const {
  state$,
  actions: { increment, reset },
} = RxCounter();

state$.subscribe(({ count }) => {
  // Update the count when state changes.
  document.getElementById('count').innerHTML = count;
});

// Bind click handlers
document.getElementById('increment').addEventListener('click', increment);
document.getElementById('reset').addEventListener('click', reset);
