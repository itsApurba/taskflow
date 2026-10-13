import { Box, Button, Flex, Grid, HStack, Heading, Icon, Skeleton, Stack, Text } from "@chakra-ui/react";
import { LuFlame, LuRefreshCw, LuSparkles, LuTriangleAlert } from "react-icons/lu";
import useAuth from "../hooks/useAuth";
import useMe from "../hooks/useMe";
import CreditAmount from "./ui/CreditAmount";
import LevelBadge from "./ui/LevelBadge";
import XpBar from "./ui/XpBar";

const HudStat = ({ label, children }) => (
  <Box bg='whiteAlpha.200' borderWidth='1px' borderColor='whiteAlpha.200' rounded='l2' px={3} py={2.5} minW={0}>
    <Text textStyle='eyebrow' fontSize='2xs' color='whiteAlpha.800'>
      {label}
    </Text>
    <Box mt={1}>{children}</Box>
  </Box>
);

// The player's HUD: level, XP, credits and streak from GET /me. Without the
// game backend it shows a locked card that explains what is coming; when /me
// fails for another reason it offers a retry instead.
const PlayerCard = (props) => {
  const { userName } = useAuth();
  const { profile, isFirstLoad, isLoadError, refetch, isFetching } = useMe();
  return (
    <Box position='relative' overflow='hidden' rounded='l3' bgGradient='hero' color='white' p={{ base: 4, md: 5 }} boxShadow='glow' {...props}>
      <Box position='absolute' top='-16' right='-12' boxSize='48' rounded='full' bg='whiteAlpha.200' filter='blur(40px)' aria-hidden />
      <Box position='absolute' bottom='-20' left='-10' boxSize='40' rounded='full' bg='xp.400' opacity={0.35} filter='blur(50px)' aria-hidden />
      <Stack position='relative' gap={4}>
        <HStack gap={3}>
          <LevelBadge level={profile?.level} size='lg' />
          <Box minW={0}>
            <Text textStyle='eyebrow' color='whiteAlpha.800'>
              {profile ? `Level ${profile.level}` : "Player card"}
            </Text>
            <Heading as='p' fontSize='xl' fontWeight='800' color='white' lineClamp={1}>
              {userName}
            </Heading>
          </Box>
        </HStack>
        {isFirstLoad ? (
          <Skeleton h='20' rounded='l2' variant='shine' css={{ "--start-color": "rgba(255,255,255,0.15)", "--end-color": "rgba(255,255,255,0.3)" }} />
        ) : profile ? (
          <>
            <XpBar inverted xp={profile.xp} level={profile.level} nextLevelXp={profile.nextLevelXp} />
            <Grid templateColumns='repeat(2, minmax(0, 1fr))' gap={2.5}>
              <HudStat label='Credits'>
                <CreditAmount value={profile.credits} size='lg' color='white' />
              </HudStat>
              <HudStat label='Streak'>
                <HStack gap={1.5}>
                  <Icon as={LuFlame} boxSize={5} color='coin.300' />
                  <Text textStyle='hud' fontSize='2xl' lineHeight='1'>
                    {profile.streak}
                  </Text>
                  <Text fontSize='xs' color='whiteAlpha.800' fontWeight='semibold'>
                    {profile.streak === 1 ? "day" : "days"}
                  </Text>
                </HStack>
              </HudStat>
            </Grid>
          </>
        ) : isLoadError ? (
          <Flex gap={3} bg='whiteAlpha.200' borderWidth='1px' borderColor='whiteAlpha.200' rounded='l2' p={3} align='center' wrap='wrap'>
            <Icon as={LuTriangleAlert} boxSize={5} flexShrink={0} />
            <Box flex='1' minW='40'>
              <Text fontWeight='bold'>Couldn't load your stats</Text>
              <Text fontSize='sm' color='whiteAlpha.800'>
                Check your connection and try again.
              </Text>
            </Box>
            <Button size='sm' variant='surface' colorPalette='gray' onClick={() => refetch()} loading={isFetching}>
              <LuRefreshCw /> Try again
            </Button>
          </Flex>
        ) : (
          <Flex gap={3} bg='whiteAlpha.200' borderWidth='1px' borderColor='whiteAlpha.200' rounded='l2' p={3}>
            <Icon as={LuSparkles} boxSize={5} flexShrink={0} mt={0.5} />
            <Box>
              <Text fontWeight='bold'>Credits, XP and streaks unlock soon</Text>
              <Text fontSize='sm' color='whiteAlpha.800'>
                Once rewards go live, every approved task pays out here.
              </Text>
            </Box>
          </Flex>
        )}
      </Stack>
    </Box>
  );
};

export default PlayerCard;
