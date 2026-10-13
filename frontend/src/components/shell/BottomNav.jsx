import { Box, Flex, Grid, Icon, Text } from "@chakra-ui/react";
import { NavLink, useLocation } from "react-router-dom";
import { TAB_BAR_ITEMS, isNavActive } from "./nav";

// Phone tab bar (hidden from md up). The featured item (Market) is a raised
// coin-like button in the middle.
const TabItem = ({ item, active }) => (
  <Flex
    asChild
    direction='column'
    align='center'
    justify='center'
    gap={1}
    minH='11'
    minW={0}
    color={active ? "brand.fg" : "fg.muted"}
    focusVisibleRing='inside'
    rounded='l2'
  >
    <NavLink to={item.to} aria-current={active ? "page" : undefined}>
      {item.featured ? (
        <Flex
          mt={-6}
          boxSize={14}
          rounded='full'
          bgGradient='hero'
          color='white'
          align='center'
          justify='center'
          boxShadow='glow'
          borderWidth='4px'
          borderColor='bg'
          transition='transform 0.2s ease'
          _active={{ transform: "scale(0.94)" }}
        >
          <Icon as={item.icon} boxSize={6} />
        </Flex>
      ) : (
        <Flex h={8} w={14} rounded='full' align='center' justify='center' bg={active ? "brand.subtle" : "transparent"} transition='background 0.2s ease'>
          <Icon as={item.icon} boxSize={5} />
        </Flex>
      )}
      <Text as='span' fontSize='11px' lineHeight='1' fontWeight={active ? "bold" : "semibold"} lineClamp={1}>
        {item.shortLabel ?? item.label}
      </Text>
    </NavLink>
  </Flex>
);

const BottomNav = () => {
  const { pathname } = useLocation();
  return (
    <Box
      as='nav'
      aria-label='Main'
      data-tab-bar=''
      display={{ base: "block", md: "none" }}
      position='fixed'
      bottom='0'
      insetX='0'
      zIndex='sticky'
      bg='bg.glass'
      backdropFilter='saturate(180%) blur(14px)'
      boxShadow='bar'
      pb='env(safe-area-inset-bottom)'
    >
      <Grid templateColumns='repeat(5, minmax(0, 1fr))' h={16} px={1} alignItems='center'>
        {TAB_BAR_ITEMS.map((item) => (
          <TabItem key={item.to} item={item} active={isNavActive(item, pathname)} />
        ))}
      </Grid>
    </Box>
  );
};

export default BottomNav;
