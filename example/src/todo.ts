import cuid from 'cuid'

interface Todo {
  id: string
  text: string
  isComplete: boolean
}

interface TodoData {
  todos: Todo[]
  numTodos: number
  numCompleteTodos: number
  numIncompleteTodos: number
}

interface ITodoManager {
  getTodoData: () => TodoData
  addTodo: (input: Omit<Todo, 'id'>) => TodoData
  removeTodo: (id: string) => TodoData
  clearTodos: () => TodoData
}

export class TodoManager implements ITodoManager {
  todos: Todo[] = []

  getTodoData = () => _getTodoData(this.todos)

  addTodo = (input: Omit<Todo, 'id'>) => {
    this.todos = this.todos.concat({ ...input, id: cuid() })
    return _getTodoData(this.todos)
  }

  removeTodo = (id: string) => {
    this.todos = this.todos.filter((todo) => todo.id !== id)
    return _getTodoData(this.todos)
  }

  clearTodos = () => {
    this.todos = []
    return _getTodoData(this.todos)
  }
}

function _getTodoData(todos: Todo[]): TodoData {
  const numTodos = todos.length
  const numCompleteTodos = todos.filter((todo) => todo.isComplete).length

  return {
    todos,
    numTodos,
    numCompleteTodos,
    numIncompleteTodos: numTodos - numCompleteTodos,
  }
}
