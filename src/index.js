import { RxEventTickets } from '@hub-fx/examples';
import { TicketService } from './ticket.service';

// See for implementation and Tests
// https://github.com/hub-fx/hub-fx/tree/main/packages/examples/src/EventTickets

const {
  state$,
  actions: { selectEvent, setQty },
} = RxEventTickets(TicketService.getPrice);

// Bind Select Control Handler
const select = document.getElementById('event-selection');
select.onchange = (e) => selectEvent(e.target.value);

// Bind Quantity Control Handler
const qtyInput = document.getElementById('qty');
qtyInput.onchange = (e) => setQty(+e.target.value);

// Bind state values to control
state$.subscribe(({ controls: { selectedEvent, qty }, calculating, price }) => {
  select.value = selectedEvent;
  qtyInput.value = qty;

  document.getElementById('calculating').style.display = calculating ? 'block' : 'none';
  document.getElementById('price-total-wrapper').style.display = calculating ? 'none' : 'block';
  document.getElementById('price-total').innerHTML = price;
});
