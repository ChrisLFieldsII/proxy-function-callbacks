import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import {
  Container,
  Heading,
  Text,
  List,
  ListItem,
  ListIcon,
  OrderedList,
  UnorderedList,
} from '@chakra-ui/react'
import { TodoManager } from '../src/todo'

const todoManager = new TodoManager()

const Home: NextPage = () => {
  return (
    <Container maxW='container.lg'>
      <Heading textAlign='center'>Todos - Proxy Function Callbacks</Heading>
    </Container>
  )
}

export default Home
