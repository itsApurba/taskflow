import { Box, Button, CloseButton, Dialog, Drawer, Flex, HStack, Heading, IconButton, Portal, Stack, VStack, useDisclosure } from "@chakra-ui/react";
import { Link, NavLink } from "react-router-dom";
import { LuMenu, LuMoon, LuSun } from "react-icons/lu";
import useAuth from "../hooks/useAuth";
import { useColorMode, useColorModeValue } from "../hooks/useColorMode";
import { useRef } from "react";

// Logged-in and logged-out navigation, shared by the inline desktop nav and the mobile drawer.
const loggedInLinks = [
  { to: "/create-task", label: "Create Task" },
  { to: "/create-sprint", label: "Create Sprint" },
  { to: "/dashboard", label: "Dashboard" },
];
const loggedOutLinks = [
  { to: "/login", label: "Login" },
  { to: "/signup", label: "Signup" },
];

// Pads header links out to a 44px-tall hit area for touch screens.
const navItemProps = { display: "inline-flex", alignItems: "center", minH: "11", px: 1 };

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const { open, onOpen, onClose } = useDisclosure();
  const menu = useDisclosure();
  const cancelRef = useRef(null);
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("access_token");
    onClose();
  };
  const links = isLoggedIn ? loggedInLinks : loggedOutLinks;

  return (
    <Box bg={useColorModeValue("gray.100", "gray.900")} px={4} w='full'>
      <Flex h={16} alignItems={"center"} justifyContent={"space-between"} maxW={"5xl"} m={"auto"} w='full' position={"sticky"}>
        <Box asChild {...navItemProps}>
          <Link to={"/"}>
            <Heading fontFamily={"cursive"} fontSize={"2xl"}>
              TaskFlow
            </Heading>
          </Link>
        </Box>
        <HStack gap={2}>
          <HStack gap={2} hideBelow='md'>
            {links.map(({ to, label }) => (
              <Box key={to} asChild {...navItemProps}>
                <NavLink to={to}>{label}</NavLink>
              </Box>
            ))}
            {isLoggedIn && (
              <Box asChild {...navItemProps}>
                <Link
                  onClick={(e) => {
                    // This link only opens the confirm dialog; react-router v7 throws when a Link without `to` navigates.
                    e.preventDefault();
                    onOpen();
                  }}
                >
                  Logout
                </Link>
              </Box>
            )}
          </HStack>
          <Flex alignItems={"center"}>
            <Stack direction={"row"} gap={5}>
              <Button aria-label='Toggle color mode' onClick={toggleColorMode}>
                {colorMode === "light" ? <LuMoon /> : <LuSun />}
              </Button>
            </Stack>
          </Flex>
          <IconButton aria-label='Open menu' hideFrom='md' onClick={menu.onOpen}>
            <LuMenu />
          </IconButton>
        </HStack>

        <Drawer.Root placement='end' open={menu.open} onOpenChange={(e) => !e.open && menu.onClose()}>
          <Portal>
            <Drawer.Backdrop />
            <Drawer.Positioner>
              <Drawer.Content maxW='xs'>
                <Drawer.Header>
                  <Drawer.Title fontFamily={"cursive"} fontSize={"2xl"}>
                    TaskFlow
                  </Drawer.Title>
                </Drawer.Header>
                <Drawer.Body>
                  <VStack align='stretch' gap={1}>
                    {links.map(({ to, label }) => (
                      <Button key={to} asChild variant='ghost' size='lg' justifyContent='flex-start' onClick={menu.onClose}>
                        <NavLink to={to}>{label}</NavLink>
                      </Button>
                    ))}
                    {isLoggedIn && (
                      <Button
                        variant='ghost'
                        size='lg'
                        justifyContent='flex-start'
                        onClick={() => {
                          menu.onClose();
                          onOpen();
                        }}
                      >
                        Logout
                      </Button>
                    )}
                  </VStack>
                </Drawer.Body>
                <Drawer.CloseTrigger asChild>
                  <CloseButton size='lg' />
                </Drawer.CloseTrigger>
              </Drawer.Content>
            </Drawer.Positioner>
          </Portal>
        </Drawer.Root>

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
