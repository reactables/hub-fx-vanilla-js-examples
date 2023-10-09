import { switchMap, map } from 'rxjs/operators';
import { HubFactory } from '@hub-fx/core';
import { TicketService } from './ticket.service';

const EventTypes = {
  ChiliCookOff: 'Chili Cook Off',
  GrammarRodeo: 'Grammar Rodeo',
  ItchyAndScratchyMovie: 'Itchy And Scratchy Movie',
};

// Actions
export const SELECT_EVENT = 'SELECT_EVENT';
export const selectEvent = (event) => ({
  type: SELECT_EVENT,
  payload: event,
});

export const SET_QTY = 'SET_QTY';
export const setQty = (qty) => ({
  type: SET_QTY,
  payload: qty,
});

export const FETCH_PRICE_SUCCESS = 'FETCH_PRICE_SUCCESS';
export const fetchPriceSuccess = (price) => ({
  type: FETCH_PRICE_SUCCESS,
  payload: price,
});

export const FETCH_PRICE = 'FETCH_PRICE';
export const fetchPrice = (
  payload,
  // Provide method for calling get price API service
  getPrice
) => ({
  type: FETCH_PRICE,
  payload,
  scopedEffects: {
    // Scoped Effects to listen for FETCH_PRICE action and handling get price API call
    effects: [
      (actions$) =>
        actions$.pipe(
          // Call get price API Service - switchMap operator cancels previous pending call if a new one is initiated
          switchMap(({ payload }) => getPrice(payload)),

          // Map success response to appropriate action
          map((price) => fetchPriceSuccess(price))
        ),
    ],
  },
});

// Control State
const initialControlState = {
  selectedEvent: EventTypes.ChiliCookOff,
  qty: 0,
};

// Reducer to handle control state updates
const controlReducer = (state = initialControlState, action) => {
  switch (action?.type) {
    case SELECT_EVENT:
      return {
        ...state,
        selectedEvent: action.payload,
      };
    case SET_QTY:
      return {
        ...state,
        qty: action.payload,
      };
    default:
      return state;
  }
};

// Price Info State
const initialPriceState = {
  calculating: false,
  price: null,
};

// Reducer to handle price info updates
const priceReducer = (state = initialPriceState, action) => {
  switch (action?.type) {
    case FETCH_PRICE:
      return {
        ...state,
        calculating: true,
      };
    case FETCH_PRICE_SUCCESS:
      return {
        ...state,
        calculating: false,
        price: action.payload,
      };
    default:
      return state;
  }
};

const buildObservables = (
  hub,
  // Provide method for calling get price API service
  getPrice
) => {
  // Initialize observable stream for the control state
  const control$ = hub.store({ reducer: controlReducer });

  // Initialize observable stream for the price info state
  const priceInfo$ = HubFactory({
    // Declare control$ stream as a source for priceInfo$.
    sources: [
      control$.pipe(
        // Map state changes from control$ to trigger FETCH_PRICE action for the priceInfo$ stream
        map(({ qty, selectedEvent: event }) => fetchPrice({ qty, event }, getPrice))
      ),
    ],
  }).store({ reducer: priceReducer });

  return { control$, priceInfo$ };
};

const hub = HubFactory();

const { control$, priceInfo$ } = buildObservables(hub, TicketService.getPrice);

// Bind Select Control Handler
const select = document.getElementById('event-selection');
select.onchange = (e) => hub.dispatch(selectEvent(e.target.value));

// Bind Quantity Control Handler
const qtyInput = document.getElementById('qty');
qtyInput.onchange = (e) => hub.dispatch(setQty(+e.target.value));

// Bind state values to control
control$.subscribe(({ selectedEvent, qty }) => {
  select.value = selectedEvent;
  qtyInput.value = qty;
});

// Bind price state to view.
priceInfo$.subscribe(({ price, calculating }) => {
  document.getElementById('calculating').style.display = calculating ? 'block' : 'none';
  document.getElementById('price-total-wrapper').style.display = calculating ? 'none' : 'block';
  document.getElementById('price-total').innerHTML = price;
});
