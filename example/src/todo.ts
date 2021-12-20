import cuid from 'cuid'

interface Todo {
  id: string
  text: string
  isComplete: boolean
}

export interface TodoData {
  todos: Todo[]
  numTodos: number
  numCompleteTodos: number
  numIncompleteTodos: number
}

interface ITodoManager {
  getTodoData: () => TodoData
  addTodo: (text: string) => TodoData
  removeTodo: (id: string) => TodoData
  clearTodos: () => TodoData
  markTodoComplete: (id: string, isComplete: boolean) => TodoData
  markAllTodosComplete: (isComplete: boolean) => TodoData
}

export class TodoManager implements ITodoManager {
  todos: Todo[] = []

  getTodoData = () => formTodoData(this.todos)

  addTodo = (text: string) => {
    if (!text) {
      throw new Error('Must enter a todo')
    }

    this.todos = this.todos.concat({ id: cuid(), text, isComplete: false })
    return formTodoData(this.todos)
  }

  removeTodo = (id: string) => {
    this.todos = this.todos.filter((todo) => todo.id !== id)
    return formTodoData(this.todos)
  }

  clearTodos = () => {
    this.todos = []
    return formTodoData(this.todos)
  }

  markTodoComplete = (id: string, isComplete: boolean) => {
    const todo = this.findTodo(id)

    todo.isComplete = isComplete

    this.todos = [...this.todos]

    return formTodoData(this.todos)
  }

  markAllTodosComplete = (isComplete: boolean) => {
    this.todos = this.todos.map((todo) => ({ ...todo, isComplete }))
    return formTodoData(this.todos)
  }

  private findTodo = (id: string) => {
    const todo = this.todos.find((todo) => todo.id === id)

    if (!todo) {
      throw new Error('Failed to find todo')
    }

    return todo
  }
}

/**
 * @desc Build the form data shape given an array of Todos
 */
export function formTodoData(todos: Todo[]): TodoData {
  const numTodos = todos.length
  const numCompleteTodos = todos.filter((todo) => todo.isComplete).length

  return {
    todos,
    numTodos,
    numCompleteTodos,
    numIncompleteTodos: numTodos - numCompleteTodos,
  }
}
