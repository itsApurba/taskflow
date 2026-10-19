import { Box, IconButton, Menu, Portal, Text, useDisclosure } from "@chakra-ui/react";
import { LuLogOut, LuMoon, LuRotateCcw, LuSun, LuUser, LuWallet } from "react-icons/lu";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useColorMode } from "../../hooks/useColorMode";
import useLogout from "../../hooks/useLogout";
import ConfirmDialog from "../ui/ConfirmDialog";
import UserAvatar from "../ui/UserAvatar";

// Avatar button in the top bar: profile, wallet, theme and log out.
const UserMenu = () => {
  const { userName, userEmail } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const logout = useDisclosure();
  const signOut = useLogout();

  const handleLogout = () => {
    signOut();
    logout.onClose();
  };

  return (
    <>
      <Menu.Root positioning={{ placement: "bottom-end" }}>
        <Menu.Trigger asChild>
          <IconButton aria-label='Account menu' variant='ghost' colorPalette='gray' rounded='full' p={0}>
            <UserAvatar name={userName} size='sm' />
          </IconButton>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content minW='60'>
              <Box px={2.5} py={2}>
                <Text fontWeight='bold' lineClamp={1}>
                  {userName}
                </Text>
                <Text fontSize='sm' color='fg.muted' lineClamp={1}>
                  {userEmail}
                </Text>
              </Box>
              <Menu.Separator />
              <Menu.Item value='profile' asChild>
                <Link to='/profile'>
                  <LuUser /> Profile
                </Link>
              </Menu.Item>
              <Menu.Item value='wallet' asChild>
                <Link to='/wallet'>
                  <LuWallet /> Wallet
                </Link>
              </Menu.Item>
              <Menu.Item value='restore' asChild>
                <Link to='/restore'>
                  <LuRotateCcw /> Restore demo
                </Link>
              </Menu.Item>
              <Menu.Item value='theme' onClick={toggleColorMode} closeOnSelect={false}>
                {colorMode === "dark" ? <LuSun /> : <LuMoon />}
                {colorMode === "dark" ? "Light mode" : "Dark mode"}
              </Menu.Item>
              <Menu.Separator />
              <Menu.Item value='logout' color='fg.error' _highlighted={{ bg: "bg.error" }} onClick={logout.onOpen}>
                <LuLogOut /> Log out
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
      <ConfirmDialog
        open={logout.open}
        onClose={logout.onClose}
        onConfirm={handleLogout}
        title='Log out?'
        description="You'll need to sign in again to see your tasks."
        confirmLabel='Log out'
        cancelLabel='Stay'
        icon={LuLogOut}
      />
    </>
  );
};

export default UserMenu;
