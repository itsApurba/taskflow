import { Box, Flex, HStack, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import useMe from "../../hooks/useMe";
import LevelBadge from "../ui/LevelBadge";
import StreakBadge from "../ui/StreakBadge";
import XpBar from "../ui/XpBar";
import CreditPill from "./CreditPill";
import Logo from "./Logo";
import UserMenu from "./UserMenu";

// Sticky HUD bar. Phones: logo, credits, avatar. Tablet and up (the sidebar
// carries the logo there): level and XP on the left when the game backend is live.
const TopBar = () => {
  const { profile } = useMe();
  return (
    <Box
      as='header'
      position='sticky'
      top='0'
      zIndex='sticky'
      bg='bg.glass'
      backdropFilter='saturate(180%) blur(14px)'
      borderBottomWidth='1px'
      borderColor='border'
      pt='env(safe-area-inset-top)'
    >
      <Flex h={{ base: 14, md: 16 }} align='center' justify='space-between' gap={3} px={{ base: 4, md: 6, lg: 8 }} maxW='6xl' mx='auto'>
        <Box asChild display={{ base: "flex", md: "none" }} rounded='l2' focusVisibleRing='outside'>
          <Link to='/' aria-label='TaskFlow home'>
            <Logo size={8} />
          </Link>
        </Box>
        <Box flex='1' minW={0} display={{ base: "none", md: "block" }}>
          {profile && (
            <HStack gap={3} maxW='xs' asChild>
              <Link to='/profile' aria-label={`Level ${profile.level}, ${profile.xp} XP`}>
                <LevelBadge level={profile.level} size='sm' />
                <Box flex='1' minW={0}>
                  <Text fontSize='xs' fontWeight='bold' mb={1}>
                    Level {profile.level}
                  </Text>
                  <XpBar xp={profile.xp} level={profile.level} nextLevelXp={profile.nextLevelXp} size='sm' showLabels={false} />
                </Box>
              </Link>
            </HStack>
          )}
        </Box>
        <HStack gap={{ base: 1.5, md: 3 }} flexShrink={0}>
          {profile && <StreakBadge days={profile.streak} compact display={{ base: "none", sm: "inline-flex" }} />}
          <CreditPill />
          <UserMenu />
        </HStack>
      </Flex>
    </Box>
  );
};

export default TopBar;
