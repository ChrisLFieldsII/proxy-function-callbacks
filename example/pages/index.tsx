import { FormEvent, useMemo, useState } from 'react'
import type { NextPage } from 'next'
import {
  Container,
  Heading,
  Text,
  List,
  ListItem,
  Input,
  HStack,
  Button,
  Box,
  Checkbox,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  IconButton,
  ButtonGroup,
  useToast,
} from '@chakra-ui/react'
import { getFnCbProxy } from 'proxy-function-callbacks'
import { DeleteIcon } from '@chakra-ui/icons'
import { TodoData, TodoManager, formTodoData } from '../src/todo'

const todoManager = new TodoManager()

const Home: NextPage = () => {
  const [text, setText] = useState<string>('')
  const [todoData, setTodoData] = useState<TodoData>(formTodoData([]))
  const toast = useToast()

  const proxy = useMemo(() => {
    return getFnCbProxy({
      target: todoManager,
      onSuccess(cmd) {
        console.log('success proxy:', { cmd })

        const todoData = cmd.data as TodoData
        setTodoData(todoData)
      },
      onBefore(cmd) {
        console.log('before proxy:', { cmd })
      },
      onAfter(cmd) {
        console.log('after proxy:', { cmd })
      },
      onError(cmd) {
        console.error('error proxy:', { cmd })

        const error = cmd.error as Error
        toast({
          status: 'error',
          description: error.message,
          title: error.name,
        })
      },
    })
  }, [toast])

  const clearText = () => setText('')

  const onSubmit = (e: FormEvent<HTMLDivElement>) => {
    e.preventDefault()

    console.log('adding todo: ', text)

    try {
      proxy.addTodo(text)
      clearText()
    } catch (error) {
      // delegate all error handling to `onError` callback
    }
  }

  return (
    <Container maxW='container.lg'>
      <Heading textAlign='center'>Todos - Proxy Function Callbacks</Heading>

      <Box my='12' />

      <StatGroup>
        <Stat>
          <StatLabel># Todos</StatLabel>
          <StatNumber>{todoData.numTodos}</StatNumber>
        </Stat>

        <Stat>
          <StatLabel># Complete Todos</StatLabel>
          <StatNumber>{todoData.numCompleteTodos}</StatNumber>
        </Stat>

        <Stat>
          <StatLabel># Incomplete Todos</StatLabel>
          <StatNumber>{todoData.numIncompleteTodos}</StatNumber>
        </Stat>
      </StatGroup>

      <Box my='6' />

      <HStack as='form' onSubmit={onSubmit}>
        <Input
          value={text}
          placeholder='Enter todo'
          onChange={(e) => setText(e.currentTarget.value)}
        />
        <Button type='submit'>Add</Button>
      </HStack>

      <Box my='3' />

      <ButtonGroup>
        <Button onClick={proxy.clearTodos}>Clear Todos</Button>

        <Button onClick={() => proxy.markAllTodosComplete(true)}>
          Mark All Todos Complete
        </Button>

        <Button onClick={() => proxy.markAllTodosComplete(false)}>
          Mark All Todos Incomplete
        </Button>
      </ButtonGroup>

      <Box my='12' />

      <List spacing={3}>
        {todoData.todos.map((todo) => {
          return (
            <ListItem
              key={todo.id}
              display={'flex'}
              flexDir={'row'}
              alignItems={'center'}
            >
              <Checkbox
                isChecked={todo.isComplete}
                onChange={(e) =>
                  proxy.markTodoComplete(todo.id, e.currentTarget.checked)
                }
              />
              <Box mx='1' />
              <IconButton
                size={'sm'}
                colorScheme={'red'}
                variant={'ghost'}
                icon={<DeleteIcon />}
                aria-label='delete todo'
                onClick={() => proxy.removeTodo(todo.id)}
              />
              <Box mx='3' />
              <Text>{todo.text}</Text>
            </ListItem>
          )
        })}
      </List>
    </Container>
  )
}

export default Home
