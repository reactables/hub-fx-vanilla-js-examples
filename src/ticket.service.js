import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

export class TicketService {
  static prices = {
    'Chili Cook Off': 20,
    'Itchy And Scratchy Movie': 40,
    'Grammar Rodeo': 50,
  };

  constructor() {}

  static getPrice({ event, qty }) {
    return of(TicketService.prices[event] * qty).pipe(delay(1000));
  }
}
