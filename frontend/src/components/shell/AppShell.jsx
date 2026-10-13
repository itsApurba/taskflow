import { Box, Flex } from "@chakra-ui/react";
import { useLayoutEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

// Each screen starts at the top, as a new page would.
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Signed-in layout: sidebar (tablet and up), sticky top bar, page content and
// the phone tab bar. Pages render into <Outlet /> and only lay out their own content.
const AppShell = () => (
  <Flex minH='100dvh' bg='bg'>
    <ScrollToTop />
    <Sidebar />
    <Flex direction='column' flex='1' minW={0}>
      <TopBar />
      <Box
        as='main'
        id='main'
        flex='1'
        w='full'
        maxW='6xl'
        mx='auto'
        px={{ base: 4, md: 6, lg: 8 }}
        pt={{ base: 5, md: 8 }}
        pb={{ base: "calc(6.5rem + env(safe-area-inset-bottom))", md: 12 }}
      >
        <Outlet />
      </Box>
    </Flex>
    <BottomNav />
  </Flex>
);

export default AppShell;
