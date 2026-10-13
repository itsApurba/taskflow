import { Badge, Box, Button, Flex, Icon, IconButton, Stack, Text } from "@chakra-ui/react";
import { LuPlus } from "react-icons/lu";
import { Link, NavLink, useLocation } from "react-router-dom";
import Logo from "./Logo";
import { SIDEBAR_GROUPS, isNavActive } from "./nav";

// Tablet: an icon rail with small labels. Desktop: a full sidebar with groups.
const SidebarItem = ({ item, active }) => (
  <Box
    asChild
    position='relative'
    display='flex'
    flexDirection={{ md: "column", lg: "row" }}
    alignItems='center'
    gap={{ md: 1, lg: 3 }}
    px={{ md: 1, lg: 3 }}
    py={{ md: 2.5, lg: 2.5 }}
    minH='11'
    rounded='l2'
    fontWeight='semibold'
    fontSize={{ md: "2xs", lg: "sm" }}
    textAlign='center'
    color={active ? "brand.fg" : "fg.muted"}
    bg={active ? "brand.subtle" : "transparent"}
    transition='background 0.15s ease, color 0.15s ease'
    _hover={{ bg: active ? "brand.subtle" : "bg.muted", color: active ? "brand.fg" : "fg" }}
    focusVisibleRing='inside'
    _before={
      active
        ? { content: '""', position: "absolute", insetStart: { md: "-2", lg: "-4" }, top: "2", bottom: "2", w: "1", roundedEnd: "full", bg: "brand.solid" }
        : undefined
    }
  >
    <NavLink to={item.to} aria-current={active ? "page" : undefined}>
      <Icon as={item.icon} boxSize={5} flexShrink={0} />
      <Text as='span' flex={{ lg: "1" }} textAlign={{ md: "center", lg: "start" }} lineClamp={1}>
        <Box as='span' display={{ md: "inline", lg: "none" }}>
          {item.shortLabel ?? item.label}
        </Box>
        <Box as='span' display={{ md: "none", lg: "inline" }}>
          {item.label}
        </Box>
      </Text>
      {item.soon && (
        <Badge size='xs' variant='subtle' colorPalette='gray' display={{ md: "none", lg: "inline-flex" }}>
          Soon
        </Badge>
      )}
    </NavLink>
  </Box>
);

const Sidebar = () => {
  const { pathname } = useLocation();
  return (
    <Flex
      as='nav'
      aria-label='Main'
      display={{ base: "none", md: "flex" }}
      direction='column'
      position='sticky'
      top='0'
      h='100dvh'
      w={{ md: "24", lg: "64" }}
      flexShrink={0}
      bg='bg.panel'
      borderRightWidth='1px'
      borderColor='border'
      px={{ md: 2, lg: 4 }}
      py={4}
      gap={6}
      overflowY='auto'
    >
      <Box asChild alignSelf={{ md: "center", lg: "flex-start" }} px={{ lg: 2 }} rounded='l2' focusVisibleRing='outside'>
        <Link to='/' aria-label='TaskFlow home'>
          <Logo size={9} showWordmark={false} display={{ md: "flex", lg: "none" }} />
          <Logo size={9} display={{ md: "none", lg: "flex" }} />
        </Link>
      </Box>
      {SIDEBAR_GROUPS.map((group) => (
        <Stack key={group.label} gap={1}>
          <Text textStyle='eyebrow' color='fg.subtle' px={3} mb={1} display={{ md: "none", lg: "block" }}>
            {group.label}
          </Text>
          {group.items.map((item) => (
            <SidebarItem key={item.to} item={item} active={isNavActive(item, pathname)} />
          ))}
        </Stack>
      ))}
      <Box flex='1' />
      <Button asChild size='lg' rounded='l2' display={{ md: "none", lg: "inline-flex" }}>
        <Link to='/create-task'>
          <LuPlus /> New task
        </Link>
      </Button>
      <IconButton asChild aria-label='New task' size='lg' rounded='l2' alignSelf='center' display={{ md: "inline-flex", lg: "none" }}>
        <Link to='/create-task'>
          <LuPlus />
        </Link>
      </IconButton>
    </Flex>
  );
};

export default Sidebar;
