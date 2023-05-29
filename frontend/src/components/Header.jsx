import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  Stack,
  useColorMode,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { Link, NavLink } from "react-router-dom";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import useAuth from "../hooks/useAuth";
import { useRef } from "react";
const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("access_token");
    onClose();
  };

  return (
    <Box bg={useColorModeValue("gray.100", "gray.900")} px={4} w='full'>
      <Flex h={16} alignItems={"center"} justifyContent={"space-between"} maxW={"container.lg"} m={"auto"} w='full' position={"sticky"}>
        <Link to={"/"}>
          <Heading fontFamily={"cursive"} fontSize={"2xl"}>
            TaskFlow
          </Heading>
        </Link>
        <HStack gap={2}>
          <HStack gap={2}>
            {isLoggedIn ? (
              <>
                <NavLink to='/create-task'>Create Task</NavLink>
                <NavLink to='/create-sprint'>Create Sprint</NavLink>
                <NavLink to='/dashboard'>Dashboard</NavLink>
                <Link onClick={onOpen}>Logout</Link>
              </>
            ) : (
              <>
                <NavLink to='/login'>Login</NavLink>
                <NavLink to='/signup'>Signup</NavLink>
              </>
            )}
          </HStack>
          <Flex alignItems={"center"}>
            <Stack direction={"row"} spacing={5}>
              <Button onClick={toggleColorMode}>{colorMode === "light" ? <MoonIcon /> : <SunIcon />}</Button>
            </Stack>
          </Flex>
        </HStack>

        <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                Logout
              </AlertDialogHeader>

              <AlertDialogBody>Are you sure?</AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  Nevermind!
                </Button>
                <Button colorScheme='red' onClick={handleLogout} ml={3}>
                  Yup!
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Flex>
    </Box>
  );
};

export default Header;
