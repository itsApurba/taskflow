import { Box, Flex, Grid, Heading, HStack, Icon, IconButton, Stack, Text } from "@chakra-ui/react";
import { LuMoon, LuSun, LuTrophy, LuWallet, LuZap } from "react-icons/lu";
import { Link, Outlet } from "react-router-dom";
import { useColorMode } from "../../hooks/useColorMode";
import CoinIcon from "../ui/CoinIcon";
import LevelBadge from "../ui/LevelBadge";
import RewardTierBadge from "../ui/RewardTierBadge";
import Logo from "./Logo";

const perks = [
  { icon: LuZap, title: "Claim tasks", text: "Pick work from the market, like loot." },
  { icon: LuWallet, title: "Earn credits", text: "Paid out when your manager approves." },
  { icon: LuTrophy, title: "Level up", text: "XP, streaks and a team leaderboard." },
];

// Decorative HUD pieces floating on the brand panel.
const FloatingCard = ({ children, delay = "0s", ...rest }) => (
  <Box
    position='absolute'
    bg='whiteAlpha.200'
    borderWidth='1px'
    borderColor='whiteAlpha.300'
    backdropFilter='blur(10px)'
    rounded='l3'
    p={3}
    color='white'
    boxShadow='0 20px 40px -20px rgba(0,0,0,0.5)'
    animation='float'
    style={{ animationDelay: delay }}
    {...rest}
  >
    {children}
  </Box>
);

const ThemeToggle = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <IconButton
      aria-label={colorMode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      variant='ghost'
      rounded='full'
      color='white'
      _hover={{ bg: "whiteAlpha.200" }}
      onClick={toggleColorMode}
    >
      {colorMode === "dark" ? <LuSun /> : <LuMoon />}
    </IconButton>
  );
};

const BrandPanel = () => (
  <Box position='relative' overflow='hidden' bgGradient='hero' color='white' px={{ base: 5, lg: 12 }} pt={{ base: 6, lg: 12 }} pb={{ base: 16, lg: 12 }}>
    {/* soft light blobs */}
    <Box position='absolute' top='-20%' right='-10%' boxSize={{ base: "60", lg: "96" }} rounded='full' bg='whiteAlpha.200' filter='blur(60px)' />
    <Box position='absolute' bottom='-25%' left='-15%' boxSize={{ base: "48", lg: "80" }} rounded='full' bg='xp.400' opacity={0.3} filter='blur(70px)' />

    <Flex direction='column' position='relative' h='full' gap={{ base: 4, lg: 10 }}>
      <Flex align='center' justify='space-between' gap={3}>
        <Box asChild rounded='l2' focusVisibleRing='outside' focusRingColor='white'>
          <Link to='/' aria-label='TaskFlow home'>
            <Logo size={9} color='white' />
          </Link>
        </Box>
        <ThemeToggle />
      </Flex>

      <Stack gap={{ base: 2, lg: 4 }} maxW='lg' mt={{ lg: "auto" }}>
        <Heading as='p' fontSize={{ base: "2xl", lg: "5xl" }} lineHeight='1.05' fontWeight='800' letterSpacing='-0.03em'>
          Turn your backlog into a quest board.
        </Heading>
        <Text fontSize={{ base: "sm", lg: "lg" }} color='whiteAlpha.800' maxW='md'>
          Claim tasks, ship great work and earn credits when it's approved. Spend them on rewards that actually matter.
        </Text>
      </Stack>

      <Box position='relative' h='56' display={{ base: "none", lg: "block" }} aria-hidden>
        <FloatingCard top='0' left='0' w='64'>
          <Text fontSize='xs' color='whiteAlpha.700' fontWeight='semibold'>
            Market · Feature
          </Text>
          <Text fontWeight='bold' mt={0.5}>
            Dark mode for the dashboard
          </Text>
          <RewardTierBadge reward={120} mt={2} />
        </FloatingCard>
        <FloatingCard top='20' left='45%' w='56' delay='-2s'>
          <HStack gap={3}>
            <LevelBadge level={4} size='md' />
            <Box flex='1'>
              <Text fontWeight='bold'>Level 4</Text>
              <Box h='2' rounded='full' bg='whiteAlpha.300' mt={1.5} overflow='hidden'>
                <Box h='full' w='70%' rounded='full' bgGradient='xp' />
              </Box>
            </Box>
          </HStack>
        </FloatingCard>
        <FloatingCard top='40' left='8%' w='60' delay='-4s'>
          <HStack justify='space-between'>
            <Text fontWeight='bold' fontSize='sm'>
              Skip a boring festival
            </Text>
            <HStack gap={1} fontWeight='bold'>
              <CoinIcon boxSize={4} /> 300
            </HStack>
          </HStack>
        </FloatingCard>
      </Box>

      <Grid templateColumns='repeat(3, 1fr)' gap={4} display={{ base: "none", lg: "grid" }}>
        {perks.map((perk) => (
          <Stack key={perk.title} gap={1.5}>
            <Flex boxSize={9} rounded='l2' bg='whiteAlpha.200' align='center' justify='center'>
              <Icon as={perk.icon} boxSize={4.5} />
            </Flex>
            <Text fontWeight='bold' fontSize='sm'>
              {perk.title}
            </Text>
            <Text fontSize='xs' color='whiteAlpha.800'>
              {perk.text}
            </Text>
          </Stack>
        ))}
      </Grid>
    </Flex>
  </Box>
);

// Signed-out layout for login, signup and the landing page: brand panel on the
// left (top band on phones) and the page content in a card.
const AuthLayout = () => (
  <Grid
    minH='100dvh'
    templateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 1.1fr) minmax(0, 1fr)" }}
    templateRows={{ base: "auto 1fr", lg: "1fr" }}
    bg='bg'
  >
    <BrandPanel />
    <Flex direction='column' align='center' justify={{ lg: "center" }} px={4} pb={{ base: 10, lg: 12 }} pt={{ lg: 12 }}>
      <Box
        w='full'
        maxW='md'
        mt={{ base: -10, lg: 0 }}
        position='relative'
        layerStyle='panel'
        boxShadow='card-hover'
        p={{ base: 5, md: 8 }}
        animation='fade-up'
      >
        <Outlet />
      </Box>
    </Flex>
  </Grid>
);

export default AuthLayout;
