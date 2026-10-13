import { Badge, Box, Button, Flex, Grid, HStack, Icon, Skeleton, Stack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { LuCrown, LuFlame, LuRefreshCw, LuStore, LuTrophy, LuUsers } from "react-icons/lu";
import { Link } from "react-router-dom";
import CreditAmount from "../components/ui/CreditAmount";
import EmptyState from "../components/ui/EmptyState";
import FilterChips from "../components/ui/FilterChips";
import LevelBadge from "../components/ui/LevelBadge";
import PageHeader from "../components/ui/PageHeader";
import RankBadge from "../components/ui/RankBadge";
import SectionHeader from "../components/ui/SectionHeader";
import UserAvatar from "../components/ui/UserAvatar";
import { useLeaderboard } from "../hooks/useGameQueries";
import useAuth from "../hooks/useAuth";
import useMe from "../hooks/useMe";
import { firstName, formatNumber } from "../lib/game";
import { LEADERBOARD_PERIODS, RANK_MEDALS, findEntry, ordinal, periodPhrase, standingNote } from "../lib/leaderboard";

// Podium order: 2nd, 1st, 3rd, with the winner's step the tallest.
const PODIUM_ORDER = [2, 1, 3];
const STEP_HEIGHTS = { 1: { base: 24, md: 28 }, 2: { base: 16, md: 20 }, 3: { base: 12, md: 14 } };

const YouTag = (props) => (
  <Badge colorPalette='brand' variant='solid' size='xs' rounded='full' {...props}>
    You
  </Badge>
);

const PodiumPlace = ({ entry, isMe }) => {
  const { rank } = entry;
  const medal = RANK_MEDALS[rank];
  const winner = rank === 1;
  return (
    <Flex direction='column' align='center' justify='flex-end' minW={0} animation='fade-up' animationDelay={`${(3 - rank) * 70}ms`}>
      <Box position='relative' mb={2}>
        {winner && (
          <Icon
            as={LuCrown}
            position='absolute'
            top={{ base: -5, md: -6 }}
            left='50%'
            transform='translateX(-50%) rotate(-8deg)'
            boxSize={{ base: 6, md: 7 }}
            color='coin.solid'
            filter='drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
            aria-hidden
          />
        )}
        <Box rounded='full' p='3px' bg={isMe ? "brand.solid" : medal.solid} boxShadow={winner ? "glow-coin" : undefined}>
          <Box rounded='full' p='2px' bg='bg.panel'>
            <UserAvatar name={entry.user?.name} size={winner ? { base: "lg", md: "xl" } : { base: "md", md: "lg" }} />
          </Box>
        </Box>
        <LevelBadge level={entry.level} size='sm' position='absolute' bottom='-1' right='-2' />
      </Box>
      <HStack gap={1} maxW='full' minW={0} justify='center'>
        <Text fontWeight='bold' fontSize={{ base: "sm", md: "md" }} lineClamp={1} overflowWrap='anywhere'>
          {firstName(entry.user?.name)}
        </Text>
        {isMe && <YouTag flexShrink={0} />}
      </HStack>
      <CreditAmount value={entry.points} size='sm' mb={2} />
      <Flex
        colorPalette={medal.palette}
        w='full'
        h={STEP_HEIGHTS[rank]}
        roundedTop='l2'
        bg='colorPalette.subtle'
        borderWidth='1px'
        borderBottomWidth='0'
        borderColor='colorPalette.muted'
        align='flex-start'
        justify='center'
        pt={2}
      >
        <RankBadge rank={rank} size={winner ? "lg" : "md"} />
      </Flex>
    </Flex>
  );
};

const Podium = ({ entries, userId }) => {
  const places = PODIUM_ORDER.map((rank) => entries[rank - 1]).filter(Boolean);
  return (
    <Box layerStyle='panel' position='relative' overflow='hidden' px={{ base: 3, md: 6 }} pt={{ base: 10, md: 12 }}>
      <Box position='absolute' top='-20' left='50%' transform='translateX(-50%)' boxSize='64' rounded='full' bg='coin.solid' opacity={0.12} filter='blur(60px)' aria-hidden />
      <Grid position='relative' templateColumns={`repeat(${places.length}, minmax(0, 1fr))`} gap={{ base: 2, md: 4 }} alignItems='end' maxW='md' mx='auto'>
        {places.map((entry) => (
          <PodiumPlace key={entry.user?._id ?? entry.rank} entry={entry} isMe={entry.user?._id === userId} />
        ))}
      </Grid>
    </Box>
  );
};

const StandingRow = ({ entry, isMe }) => (
  <Flex
    align='center'
    gap={3}
    px={3}
    py={2.5}
    minH={16}
    rounded='l2'
    bg={isMe ? "brand.subtle" : undefined}
    borderWidth='1px'
    borderColor={isMe ? "brand.muted" : "transparent"}
    aria-current={isMe ? "true" : undefined}
  >
    <RankBadge rank={entry.rank} size='sm' />
    <UserAvatar name={entry.user?.name} size='sm' />
    <Box flex='1' minW={0}>
      <HStack gap={1.5} minW={0}>
        <Text fontWeight='semibold' lineClamp={1} overflowWrap='anywhere'>
          {entry.user?.name}
        </Text>
        {isMe && <YouTag flexShrink={0} />}
      </HStack>
      <HStack gap={2} fontSize='xs' color='fg.muted' mt={0.5} wrap='wrap' rowGap={0}>
        <Text as='span'>Lv {entry.level}</Text>
        <Text as='span' aria-hidden>
          ·
        </Text>
        <Text as='span'>{formatNumber(entry.xp)} XP</Text>
        <Text as='span' aria-hidden>
          ·
        </Text>
        <Text as='span'>
          {entry.tasksDone} {entry.tasksDone === 1 ? "task" : "tasks"}
        </Text>
      </HStack>
    </Box>
    <Stack gap={1} align='flex-end' flexShrink={0}>
      <CreditAmount value={entry.points} size='md' />
      <HStack gap={0.5} fontSize='xs' fontWeight='semibold' color={entry.streak > 0 ? "orange.fg" : "fg.subtle"} aria-label={`${entry.streak}-day streak`}>
        <Icon as={LuFlame} boxSize={3.5} />
        <span aria-hidden>{entry.streak}</span>
      </HStack>
    </Stack>
  </Flex>
);

const YourStanding = ({ entry, entries, period }) => {
  const palette = RANK_MEDALS[entry.rank]?.palette ?? "brand";
  return (
    <Flex colorPalette={palette} align='center' gap={4} layerStyle='panel' borderColor='colorPalette.muted' p={{ base: 4, md: 5 }} animation='fade-up'>
      <Flex direction='column' align='center' justify='center' boxSize={16} rounded='l3' bg='colorPalette.subtle' color='colorPalette.fg' flexShrink={0}>
        <Text textStyle='hud' fontSize='2xl' lineHeight='1'>
          {ordinal(entry.rank)}
        </Text>
        <Text fontSize='2xs' fontWeight='bold' textTransform='uppercase' letterSpacing='wider' mt={1}>
          Place
        </Text>
      </Flex>
      <Box minW={0}>
        <Text fontWeight='bold' fontSize={{ base: "md", md: "lg" }}>
          You're {ordinal(entry.rank)} {periodPhrase(period)}
        </Text>
        <Text fontSize='sm' color='fg.muted'>
          {standingNote(entries, entry)}
        </Text>
      </Box>
    </Flex>
  );
};

const LeaderboardSkeleton = () => (
  <Stack gap={{ base: 5, md: 6 }}>
    <Skeleton h='72' rounded='l3' />
    <Skeleton h='48' rounded='l3' />
  </Stack>
);

const LeaderboardPage = () => {
  const [period, setPeriod] = useState("week");
  const { userId } = useAuth();
  const { profile } = useMe();
  const { data, isLoading, isError, refetch, isFetching } = useLeaderboard(period);
  const entries = data?.entries ?? [];
  const me = findEntry(entries, userId);
  const isManager = profile?.role === "manager";
  const anyPoints = entries.some((entry) => entry.points > 0);

  let content;
  if (isLoading) {
    content = <LeaderboardSkeleton />;
  } else if (isError) {
    content = (
      <EmptyState icon={LuTrophy} palette='red' title="Couldn't load the leaderboard" description='Check your connection and try again.' layerStyle='panel'>
        <Button onClick={() => refetch()} loading={isFetching}>
          <LuRefreshCw /> Try again
        </Button>
      </EmptyState>
    );
  } else if (entries.length === 0) {
    content = (
      <EmptyState
        icon={LuUsers}
        palette='orange'
        title='No one to rank yet'
        description={
          isManager ? "Your team shows up here once people report to you." : "Once you join a manager's team, you'll compete with your teammates here."
        }
        layerStyle='panel'
      />
    );
  } else {
    content = (
      <Grid templateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 1fr) minmax(0, 1fr)" }} gap={{ base: 5, md: 6 }} alignItems='start'>
        <Stack gap={{ base: 5, md: 6 }} minW={0}>
          {me && <YourStanding entry={me} entries={entries} period={period} />}
          {anyPoints ? (
            <Podium entries={entries} userId={userId} />
          ) : (
            <EmptyState
              icon={LuTrophy}
              palette='coin'
              size='sm'
              title='The podium is wide open'
              description={
                isManager
                  ? `No approved tasks ${period === "week" ? "this week" : "yet"}. Approve finished work to put someone on top.`
                  : `No one has had a task approved ${period === "week" ? "this week" : "yet"}. Be the first.`
              }
              layerStyle='panel'
            >
              {!isManager && (
                <Button asChild size='sm'>
                  <Link to='/market'>
                    <LuStore /> Find a task
                  </Link>
                </Button>
              )}
            </EmptyState>
          )}
        </Stack>
        <Box layerStyle='panel' p={{ base: 2, md: 3 }} minW={0} animation='fade-up'>
          <SectionHeader title='Standings' count={entries.length} px={2} pt={1} mb={1} />
          <Stack gap={1} as='ol' listStyleType='none'>
            {entries.map((entry) => (
              <Box as='li' key={entry.user?._id ?? entry.rank}>
                <StandingRow entry={entry} isMe={entry.user?._id === userId} />
              </Box>
            ))}
          </Stack>
        </Box>
      </Grid>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={isManager ? "Your team" : "Team ranks"}
        title='Leaderboard'
        description='Ranked by credits earned from approved tasks. Ties go to whoever has more XP.'
      />
      <FilterChips label='Period' options={LEADERBOARD_PERIODS} value={period} onChange={setPeriod} mb={{ base: 5, md: 6 }} />
      {content}
    </>
  );
};

export default LeaderboardPage;
