import { Counter } from '@hub-fx/examples';

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
