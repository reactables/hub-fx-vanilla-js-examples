export class TicketService {
  static prices = {
    'Chili Cookoff': 20,
    'Itchy And Scratchy Movie': 40,
    'Grammar Rodeo': 50,
  };

  constructor() {}

  static getPrice({ event, qty }) {
    return of(this.prices[event] * qty).pipe(delay(1000));
  }
}
