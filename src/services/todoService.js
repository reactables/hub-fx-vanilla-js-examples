export class TodoService {
  constructor() {}

  static updateTodo(payload) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(payload), 2000);
    });
  }
}
