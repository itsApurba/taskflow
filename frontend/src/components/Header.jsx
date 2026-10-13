import { Box, Button, Dialog, Flex, HStack, Heading, Portal, Stack, useDisclosure } from "@chakra-ui/react";
import { Link, NavLink } from "react-router-dom";
import { LuMoon, LuSun } from "react-icons/lu";
import useAuth from "../hooks/useAuth";
import { useColorMode, useColorModeValue } from "../hooks/useColorMode";
import { useRef } from "react";
const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const { open, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("access_token");
    onClose();
  };

  return (
    <Box bg={useColorModeValue("gray.100", "gray.900")} px={4} w='full'>
      <Flex h={16} alignItems={"center"} justifyContent={"space-between"} maxW={"5xl"} m={"auto"} w='full' position={"sticky"}>
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
                <Link
                  onClick={(e) => {
                    // This link only opens the confirm dialog; react-router v7 throws when a Link without `to` navigates.
                    e.preventDefault();
                    onOpen();
                  }}
                >
                  Logout
                </Link>
              </>
            ) : (
              <>
                <NavLink to='/login'>Login</NavLink>
                <NavLink to='/signup'>Signup</NavLink>
              </>
            )}
          </HStack>
          <Flex alignItems={"center"}>
            <Stack direction={"row"} gap={5}>
              <Button onClick={toggleColorMode}>{colorMode === "light" ? <LuMoon /> : <LuSun />}</Button>
            </Stack>
          </Flex>
        </HStack>

        <Dialog.Root role='alertdialog' open={open} onOpenChange={(e) => !e.open && onClose()} initialFocusEl={() => cancelRef.current}>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title fontSize='lg' fontWeight='bold'>
                    Logout
                  </Dialog.Title>
                </Dialog.Header>

                <Dialog.Body>Are you sure?</Dialog.Body>

                <Dialog.Footer>
                  <Button ref={cancelRef} onClick={onClose}>
                    Nevermind!
                  </Button>
                  <Button variant='solid' colorPalette='red' onClick={handleLogout}>
                    Yup!
                  </Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </Flex>
    </Box>
  );
};

export default Header;
