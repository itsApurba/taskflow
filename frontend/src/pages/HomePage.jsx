import { Button, ButtonGroup, Center } from '@chakra-ui/react'
import React from 'react'
import { Link } from 'react-router-dom'

const HomePage = () => {
  return (
    <Center w={'full'} h={"70vh"}>
        <ButtonGroup>
            <Button as={Link} to="/login">Login</Button>
            <Button as={Link} to="/signup">Signup</Button>
        </ButtonGroup>
    </Center>
  )
}

export default HomePage