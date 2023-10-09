import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

export class TodoService {
  constructor() {}

  static updateTodo(payload) {
    return of(payload).pipe(delay(2000));
  }
}
