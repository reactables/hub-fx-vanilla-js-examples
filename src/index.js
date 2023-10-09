import { HubFactory } from '@hub-fx/core';
import { mergeMap, map, filter } from 'rxjs/operators';
import { TodoService } from './services/todoService';

// Actions
const SEND_TODO_STATUS_UPDATE = 'SEND_TODO_STATUS_UPDATE';
const sendTodoStatusUpdate = (
  payload // { todoId: number, status: 'done' | 'incomplete' | 'in progress' }
) => ({
  type: SEND_TODO_STATUS_UPDATE,
  payload,
});

const TODO_STATUS_UPDATE_SUCCESS = 'TODO_STATUS_UPDATE_SUCCESS';
const todoStatusUpdateSuccess = (payload) => ({
  type: TODO_STATUS_UPDATE_SUCCESS,
  payload, // { todoId: number, status: 'done' | 'incomplete' | 'in progress' }
});

// State
const initialState = {
  todos: [
    {
      id: 1,
      description: 'Pick Up Bart',
      status: 'incomplete',
      updating: false,
    },
    {
      id: 2,
      description: 'Moe the lawn',
      status: 'incomplete',
      updating: false,
    },
  ],
};

// Reducer for updating state
const reducer = (state = initialState, action) => {
  switch (action?.type) {
    case SEND_TODO_STATUS_UPDATE:
      return {
        // Find todo and setting updating flag to true

        todos: state.todos.reduce((acc, todo) => {
          const { todoId } = action.payload;

          const newTodo = todo.id === todoId ? { ...todo, updating: true } : todo;

          return acc.concat(newTodo);
        }, []),
      };
    case TODO_STATUS_UPDATE_SUCCESS:
      return {
        // Find todo and mark new status and set updating flag to false

        todos: state.todos.reduce((acc, todo) => {
          const { todoId, status } = action.payload;

          const newTodo = todo.id === todoId ? { ...todo, status, updating: false } : todo;

          return acc.concat(newTodo);
        }, []),
      };
  }
  return state;
};

// Effect to listen for update todo action and handling update todo API call
const updateTodoEffect =
  (
    // Provide the method from Todos API service for updating Todos
    updateTodo
  ) =>
  (actions$) => {
    return actions$.pipe(
      // Effect will only react for update todo action
      filter((action) => action.type === SEND_TODO_STATUS_UPDATE),

      // Call todo API Service
      mergeMap(({ payload }) => updateTodo(payload)),

      // Map success response to appropriate action
      map((payload) => todoStatusUpdateSuccess(payload))
    );
  };

// Initialize hub
const hub = HubFactory({ effects: [updateTodoEffect(TodoService.updateTodo)] });

// Initialize observable stream
const store$ = hub.store({ reducer });

// Render todos on state changes
store$.subscribe(renderTodos);

// Function for updating the DOM
function renderTodos(state) {
  // Cache the todos container and clear it.
  const todosContainer = document.querySelector('.todos');
  todosContainer.innerHTML = '';

  // Loop through update todos and update view
  const todos = state.todos.reduce((todoSelects, todo) => {
    // Create todo container and description text
    const todoContainer = document.createElement('div');
    todoContainer.className = 'todo';
    const todoInner = document.createElement('div');
    todoInner.className = 'todo__control';
    todoInner.appendChild(document.createTextNode(todo.description));
    todoContainer.appendChild(todoInner);

    if (todo.updating) {
      // If todo is updating just render the ...Updating message

      const span = document.createElement('span');
      span.className = 'todo__updating';
      span.appendChild(document.createTextNode('...Updating'));
      todoInner.appendChild(span);
    } else {
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
        hub.dispatch(sendTodoStatusUpdate({ todoId: todo.id, status: event.target.value }));

      todoInner.appendChild(select);
    }

    return todoSelects.concat(todoContainer);
  }, []);

  todos.forEach((todo) => {
    todosContainer.appendChild(todo);
  });
}
