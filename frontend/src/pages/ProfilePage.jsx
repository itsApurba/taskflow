import { Badge, Box, Button, Flex, Grid, HStack, Heading, Icon, SimpleGrid, Skeleton, Stack, Text, useDisclosure } from "@chakra-ui/react";
import moment from "moment";
import { useTheme } from "next-themes";
import {
  LuCircleCheckBig,
  LuClipboardList,
  LuFlame,
  LuHourglass,
  LuLogOut,
  LuMail,
  LuMonitor,
  LuMoon,
  LuStore,
  LuSun,
  LuTrophy,
  LuUserRound,
  LuUsers,
} from "react-icons/lu";
import { Link } from "react-router-dom";
import TeamMemberRow from "../components/TeamMemberRow";
import CoinIcon from "../components/ui/CoinIcon";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import CreditAmount from "../components/ui/CreditAmount";
import EmptyState from "../components/ui/EmptyState";
import FilterChips from "../components/ui/FilterChips";
import LevelBadge from "../components/ui/LevelBadge";
import PageHeader from "../components/ui/PageHeader";
import SectionHeader from "../components/ui/SectionHeader";
import StatTile from "../components/ui/StatTile";
import UserAvatar from "../components/ui/UserAvatar";
import XpBar from "../components/ui/XpBar";
import useAuth from "../hooks/useAuth";
import { useLeaderboard, useMyTasks, useReviewQueue, useTeam } from "../hooks/useGameQueries";
import useLogout from "../hooks/useLogout";
import useMe from "../hooks/useMe";
import { formatNumber, xpForLevel } from "../lib/game";
import { findEntry, ordinal } from "../lib/leaderboard";

const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];
const THEME_ICONS = { light: LuSun, dark: LuMoon, system: LuMonitor };

// Who you are and how far you've come, on the one surface allowed the hero gradient.
const ProfileHero = ({ profile, userName, userEmail, isManager, teamSize }) => (
  <Box position='relative' overflow='hidden' rounded='l3' bgGradient='hero' color='white' p={{ base: 5, md: 7 }} boxShadow='glow' animation='fade-up'>
    <Box position='absolute' top='-16' right='-12' boxSize='56' rounded='full' bg='whiteAlpha.200' filter='blur(40px)' aria-hidden />
    <Box position='absolute' bottom='-24' left='-10' boxSize='48' rounded='full' bg='xp.400' opacity={0.35} filter='blur(50px)' aria-hidden />
    <Stack position='relative' gap={5}>
      <Flex gap={4} align='center'>
        <Box position='relative' flexShrink={0}>
          <Box rounded='full' p='3px' bg='whiteAlpha.500'>
            <UserAvatar name={userName} size={{ base: "xl", md: "2xl" }} />
          </Box>
          {!isManager && <LevelBadge level={profile?.level} size='sm' position='absolute' bottom='-1.5' right='-2.5' />}
        </Box>
        <Box minW={0}>
          <Badge variant='solid' bg='whiteAlpha.300' color='white' size='sm' mb={1.5}>
            {isManager ? "Manager" : profile ? `Level ${profile.level} worker` : "Worker"}
          </Badge>
          <Heading as='h2' fontSize={{ base: "2xl", md: "3xl" }} fontWeight='800' color='white' lineHeight='1.1' overflowWrap='anywhere'>
            {userName}
          </Heading>
          <HStack gap={1.5} mt={1} color='whiteAlpha.800' fontSize='sm' minW={0}>
            <Icon as={LuMail} flexShrink={0} />
            <Text lineClamp={1} overflowWrap='anywhere'>
              {userEmail}
            </Text>
          </HStack>
        </Box>
      </Flex>
      {isManager ? (
        <Text color='whiteAlpha.900' fontWeight='medium'>
          {teamSize == null
            ? "Your team's numbers live below."
            : teamSize === 0
              ? "Nobody reports to you yet."
              : `You lead a team of ${teamSize}. Post tasks, approve the work and keep the store stocked.`}
        </Text>
      ) : profile ? (
        <XpBar inverted xp={profile.xp} level={profile.level} nextLevelXp={profile.nextLevelXp} />
      ) : null}
    </Stack>
  </Box>
);

// The next few levels as milestones, so the XP bar has somewhere to go.
const LevelRoad = ({ profile }) => {
  const levels = [profile.level, profile.level + 1, profile.level + 2, profile.level + 3];
  return (
    <Box layerStyle='panel' p={{ base: 4, md: 5 }} animation='fade-up'>
      <SectionHeader title='Level road' as='h3' />
      <Stack gap={0} as='ol' listStyleType='none'>
        {levels.map((level, i) => {
          const current = i === 0;
          const needed = xpForLevel(level);
          const toGo = Math.max(0, needed - profile.xp);
          return (
            <Flex as='li' key={level} gap={3} align='stretch'>
              <Flex direction='column' align='center' flexShrink={0}>
                <LevelBadge level={level} size='md' opacity={current ? 1 : 0.45} filter={current ? undefined : "grayscale(0.6)"} />
                {i < levels.length - 1 && <Box flex='1' w='2px' my={1} bg={current ? "brand.muted" : "border"} minH={3} />}
              </Flex>
              <Box pt={2} pb={4} minW={0}>
                <HStack gap={2}>
                  <Text fontWeight='bold'>Level {level}</Text>
                  {current && (
                    <Badge colorPalette='brand' variant='solid' size='xs' rounded='full'>
                      You're here
                    </Badge>
                  )}
                </HStack>
                <Text fontSize='sm' color='fg.muted'>
                  {current
                    ? `Reached at ${formatNumber(needed)} XP · you have ${formatNumber(profile.xp)}`
                    : `${formatNumber(needed)} XP · ${formatNumber(toGo)} to go`}
                </Text>
              </Box>
            </Flex>
          );
        })}
      </Stack>
      <Text fontSize='xs' color='fg.muted'>
        Every approved task adds its reward as XP. XP never goes down, even when you spend credits.
      </Text>
    </Box>
  );
};

const RecentWins = ({ tasks, isLoading }) => {
  const wins = tasks
    .filter((task) => task.status === "done")
    .sort((a, b) => new Date(b.approvedAt ?? b.updated_at) - new Date(a.approvedAt ?? a.updated_at))
    .slice(0, 5);
  return (
    <Box layerStyle='panel' p={{ base: 2, md: 3 }} animation='fade-up'>
      <SectionHeader title='Recent wins' as='h3' px={2} pt={1} mb={1} to={wins.length ? "/wallet" : undefined} linkLabel='Wallet' />
      {isLoading ? (
        <Skeleton h='24' rounded='l2' m={2} />
      ) : wins.length === 0 ? (
        <EmptyState size='sm' icon={LuTrophy} palette='coin' title='No wins yet' description='Claim a task from the market. When your manager approves it, it lands here.'>
          <Button asChild size='sm'>
            <Link to='/market'>
              <LuStore /> Open the market
            </Link>
          </Button>
        </EmptyState>
      ) : (
        <Stack gap={0.5} as='ul' listStyleType='none'>
          {wins.map((task) => (
            <Flex as='li' key={task._id} align='center' gap={3} px={3} py={2.5} minH={14}>
              <Flex colorPalette='green' boxSize={9} rounded='l2' bg='colorPalette.subtle' color='colorPalette.fg' align='center' justify='center' flexShrink={0}>
                <Icon as={LuCircleCheckBig} boxSize={4} />
              </Flex>
              <Box flex='1' minW={0}>
                <Text fontWeight='semibold' lineClamp={1} overflowWrap='anywhere'>
                  {task.title}
                </Text>
                <Text fontSize='xs' color='fg.muted'>
                  Approved {moment(task.approvedAt ?? task.updated_at).fromNow()}
                </Text>
              </Box>
              <CreditAmount value={task.reward} signed size='sm' flexShrink={0} />
            </Flex>
          ))}
        </Stack>
      )}
    </Box>
  );
};

const ManagerCard = ({ manager }) => (
  <Box layerStyle='panel' p={{ base: 4, md: 5 }} animation='fade-up'>
    <Text textStyle='eyebrow' color='fg.muted' mb={3}>
      Reports to
    </Text>
    {manager ? (
      <HStack gap={3}>
        <UserAvatar name={manager.name} size='md' />
        <Box minW={0}>
          <Text fontWeight='bold' lineClamp={1}>
            {manager.name}
          </Text>
          <Text fontSize='sm' color='fg.muted' lineClamp={1} overflowWrap='anywhere'>
            {manager.email}
          </Text>
        </Box>
      </HStack>
    ) : (
      <HStack gap={3} color='fg.muted'>
        <Flex boxSize={10} rounded='full' bg='bg.muted' align='center' justify='center' flexShrink={0}>
          <LuUserRound />
        </Flex>
        <Text fontSize='sm'>No manager yet. Your market, store and leaderboard come from the manager you report to.</Text>
      </HStack>
    )}
  </Box>
);

const SettingsCard = () => {
  const { theme, setTheme } = useTheme();
  const signOut = useLogout();
  const logout = useDisclosure();
  const ThemeIcon = THEME_ICONS[theme] ?? LuMonitor;
  return (
    <Box layerStyle='panel' p={{ base: 4, md: 5 }} animation='fade-up'>
      <SectionHeader title='Settings' as='h3' />
      <Stack gap={4}>
        <Box>
          <HStack gap={2} mb={2} color='fg.muted'>
            <Icon as={ThemeIcon} />
            <Text fontSize='sm' fontWeight='semibold'>
              Theme
            </Text>
          </HStack>
          <FilterChips label='Theme' options={THEME_OPTIONS} value={theme ?? "system"} onChange={setTheme} mx={0} px={0} />
        </Box>
        <Box borderTopWidth='1px' borderColor='border' pt={4}>
          <Button variant='outline' colorPalette='red' w={{ base: "full", sm: "auto" }} onClick={logout.onOpen}>
            <LuLogOut /> Log out
          </Button>
        </Box>
      </Stack>
      <ConfirmDialog
        open={logout.open}
        onClose={logout.onClose}
        onConfirm={() => {
          signOut();
          logout.onClose();
        }}
        title='Log out?'
        description="You'll need to sign in again to see your tasks."
        confirmLabel='Log out'
        cancelLabel='Stay'
        icon={LuLogOut}
      />
    </Box>
  );
};

const WorkerStats = ({ profile, tasksDone, rankEntry, teamCount, loadingTasks }) => (
  <SimpleGrid columns={{ base: 2, md: 4 }} gap={{ base: 3, md: 4 }}>
    <StatTile label='Credits' value={formatNumber(profile.credits)} icon={CoinIcon} palette='coin' hint='Open wallet' to='/wallet' />
    <StatTile
      label='Day streak'
      value={profile.streak}
      icon={LuFlame}
      palette='orange'
      hint={profile.streak > 0 ? "Keep it going" : "Get a task approved"}
    />
    <StatTile label='Tasks done' value={loadingTasks ? "–" : tasksDone} icon={LuCircleCheckBig} palette='green' hint='Approved' />
    <StatTile
      label='Team rank'
      value={rankEntry ? ordinal(rankEntry.rank) : "–"}
      icon={LuTrophy}
      palette='brand'
      hint={rankEntry ? `of ${teamCount}, all time` : "Not ranked yet"}
      to='/leaderboard'
    />
  </SimpleGrid>
);

const ProfilePage = () => {
  const { userName, userEmail, userId } = useAuth();
  const { profile, isFirstLoad } = useMe();
  const isManager = profile?.role === "manager";
  const isWorker = profile?.role === "worker";
  const myTasks = useMyTasks({ enabled: Boolean(profile) });
  const leaderboard = useLeaderboard("all", { enabled: isWorker });
  const team = useTeam({ enabled: isManager });
  const review = useReviewQueue({ enabled: isManager });
  const tasks = myTasks.data ?? [];
  const entries = leaderboard.data?.entries ?? [];

  if (isFirstLoad) {
    return (
      <>
        <PageHeader eyebrow='Your profile' title='Profile' />
        <Stack gap={5}>
          <Skeleton h='48' rounded='l3' />
          <Skeleton h='28' rounded='l3' />
        </Stack>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow='Your profile'
        title='Profile'
        description={isManager ? "You, your team and your settings." : "Your level, streak and record, all in one place."}
      />
      <Grid
        templateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 20rem", xl: "minmax(0, 1fr) 22rem" }}
        gap={{ base: 5, md: 6 }}
        alignItems='start'
      >
        <Stack gap={{ base: 5, md: 6 }} minW={0}>
          <ProfileHero profile={profile} userName={userName} userEmail={userEmail} isManager={isManager} teamSize={team.data?.length} />
          {isWorker && (
            <>
              <WorkerStats
                profile={profile}
                tasksDone={tasks.filter((task) => task.status === "done").length}
                loadingTasks={myTasks.isLoading}
                rankEntry={findEntry(entries, userId)}
                teamCount={entries.length}
              />
              <LevelRoad profile={profile} />
            </>
          )}
          {isManager && (
            <>
              <SimpleGrid columns={{ base: 2, md: 4 }} gap={{ base: 3, md: 4 }}>
                <StatTile label='Team members' value={team.data?.length ?? "–"} icon={LuUsers} palette='brand' to='/leaderboard' />
                <StatTile label='Tasks posted' value={myTasks.isLoading ? "–" : tasks.length} icon={LuClipboardList} palette='blue' />
                <StatTile label='Awaiting review' value={review.data?.length ?? "–"} icon={LuHourglass} palette='orange' to='/market' />
                <StatTile
                  label='Credits paid'
                  value={formatNumber(tasks.filter((task) => task.status === "done").reduce((sum, task) => sum + (task.reward || 0), 0))}
                  icon={CoinIcon}
                  palette='coin'
                  hint='From approved tasks'
                />
              </SimpleGrid>
              <Box layerStyle='panel' p={{ base: 2, md: 3 }} animation='fade-up'>
                <SectionHeader title='Your team' count={team.data?.length} as='h3' px={2} pt={1} mb={0} to='/leaderboard' linkLabel='Ranks' />
                {team.isLoading ? (
                  <Skeleton h='24' rounded='l2' m={2} />
                ) : team.data?.length ? (
                  <Stack gap={0} separator={<Box borderBottomWidth='1px' borderColor='border' mx={3} />}>
                    {team.data.map((member) => (
                      <TeamMemberRow key={member._id} member={member} />
                    ))}
                  </Stack>
                ) : (
                  <EmptyState size='sm' icon={LuUsers} title='No one on your team yet' description='Workers pick you as their manager when they sign up.' />
                )}
              </Box>
            </>
          )}
        </Stack>
        <Stack gap={{ base: 5, md: 6 }} minW={0}>
          {isWorker && <ManagerCard manager={profile.manager} />}
          {isWorker && <RecentWins tasks={tasks} isLoading={myTasks.isLoading} />}
          <SettingsCard />
        </Stack>
      </Grid>
    </>
  );
};

export default ProfilePage;
