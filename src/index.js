import { HubFactory } from '@hub-fx/core';
import { TodoService } from './services/todoService';
import { switchMap, map } from 'rxjs/operators';

// Actions
const SEND_TODO_STATUS_UPDATE = 'SEND_TODO_STATUS_UPDATE';
const sendTodoStatusUpdate = (
  payload, // { todoId: number, status: 'done' | 'incomplete' | 'in progress' }
  // Provide the method from Todos API service for updating Todos
  updateTodo
) => ({
  type: SEND_TODO_STATUS_UPDATE,
  payload,
  scopedEffects: {
    // Provide key so effect stream is dynamically created for SEND_TODO_STATUS_UPDATE on todo.id
    key: payload.todoId,

    // Scoped Effects to listen for update todo action and handling update todo API call
    effects: [
      (actions$) => {
        return actions$.pipe(
          // Call todo API Service - switchMap operator cancels previous pending call if a new one is initiated
          switchMap(({ payload }) => updateTodo(payload)),

          // Map success response to appropriate action
          map((payload) => todoStatusUpdateSuccess(payload))
        );
      },
    ],
  },
});

const TODO_STATUS_UPDATE_SUCCESS = 'TODO_STATUS_UPDATE_SUCCESS';
const todoStatusUpdateSuccess = (payload) => ({
  type: TODO_STATUS_UPDATE_SUCCESS,
  payload,
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
      // Find todo and setting updating flag to true

      return {
        todos: state.todos.reduce((acc, todo) => {
          const { todoId } = action.payload;

          const newTodo = todo.id === todoId ? { ...todo, updating: true } : todo;

          return acc.concat(newTodo);
        }, []),
      };
    case TODO_STATUS_UPDATE_SUCCESS:
      // Find todo and mark new status and set updating flag to false

      return {
        todos: state.todos.reduce((acc, todo) => {
          const { todoId, status } = action.payload;

          const newTodo = todo.id === todoId ? { ...todo, status, updating: false } : todo;

          return acc.concat(newTodo);
        }, []),
      };
  }
  return state;
};

// Initialize hub
const hub = HubFactory();

// Initialize observable stream
const store$ = hub.store({ reducer });

// Render todos on state changes
store$.subscribe(renderTodos);

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
      hub.dispatch(
        sendTodoStatusUpdate(
          { todoId: todo.id, status: event.target.value },
          TodoService.updateTodo
        )
      );

    todoInner.appendChild(select);

    return todoSelects.concat(todoContainer);
  }, []);

  todos.forEach((todo) => {
    todosContainer.appendChild(todo);
  });
}
