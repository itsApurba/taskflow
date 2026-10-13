import { Button, ButtonGroup, Center } from '@chakra-ui/react'
import { Link } from 'react-router-dom'

const HomePage = () => {
  return (
    <Center w={'full'} h={"70vh"}>
        <ButtonGroup>
            <Button asChild><Link to="/login">Login</Link></Button>
            <Button asChild><Link to="/signup">Signup</Link></Button>
        </ButtonGroup>
    </Center>
  )
}

export default HomePage
