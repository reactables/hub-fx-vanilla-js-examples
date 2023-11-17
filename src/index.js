import { RxTodoUpdates } from '@hub-fx/examples';
import { TodoService } from './services/todoService';

// See for implementation and tests
// https://github.com/hub-fx/hub-fx/tree/main/packages/examples/src/TodoUpdates

const {
  state$,
  actions: { sendTodoStatusUpdate },
} = RxTodoUpdates(TodoService.updateTodo);

state$.subscribe(renderTodos);

// Function for updating the DOM
function renderTodos(state) {
  // Cache the todos container and clear it.
  const todosContainer = document.querySelector('.todos');
  todosContainer.innerHTML = '';

  // Loop through updated todos and update view
  const todos = state.todos.reduce((todoSelects, todo) => {
    // Create todo container and description text
    const todoContainer = document.createElement('div');
    todoContainer.className = 'todo';
    const todoInner = document.createElement('div');
    todoInner.className = 'todo__control';
    todoInner.appendChild(document.createTextNode(todo.description));
    todoContainer.appendChild(todoInner);

    if (todo.updating) {
      // If todo is updating render the ...Updating message
      const span = document.createElement('span');
      span.className = 'todo__updating';
      span.appendChild(document.createTextNode('...Updating'));
      todoInner.appendChild(span);
    }
    // Create select element for todo and bind values and event handlers

    const options = [
      { text: 'In Progress', value: 'in progress' },
      { text: 'Incomplete', value: 'incomplete' },
      { text: 'Done', value: 'done' },
    ];

    const select = document.createElement('select');

    // Append options to select
    options.forEach((option) => {
      const optionEl = document.createElement('option');
      optionEl.text = option.text;
      optionEl.value = option.value;
      select.appendChild(optionEl);
    });

    // Bind todo status to the select value
    select.value = todo.status;

    // Bind onchange handler to dispatch status change
    select.onchange = (event) =>
      sendTodoStatusUpdate({ todoId: todo.id, status: event.target.value });

    todoInner.appendChild(select);

    return todoSelects.concat(todoContainer);
  }, []);

  todos.forEach((todo) => {
    todosContainer.appendChild(todo);
  });
}
