import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

export class TicketService {
  static prices = {
    'Chili Cook Off': 20,
    'Itchy And Scratchy Movie': 40,
    'Grammar Rodeo': 50,
  };

  static getPrice({ event, qty }) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(TicketService.prices[event] * qty);
      }, 1000);
    });
  }
}
