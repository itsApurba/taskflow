import { Box, Button, Flex, Grid, HStack, Heading, Icon, SimpleGrid, Skeleton, Stack, Text } from "@chakra-ui/react";
import moment from "moment";
import { LuCircleCheckBig, LuGift, LuHourglass, LuPartyPopper, LuPlus, LuStore, LuTimer, LuUsers, LuZap } from "react-icons/lu";
import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { usePenalties, useRedemptions } from "../../hooks/useGameQueries";
import { useReviewQueue, useTeam } from "../../hooks/useMarket";
import useSprints from "../../hooks/useSprints";
import useTasks from "../../hooks/useTasks";
import { firstName, formatNumber } from "../../lib/game";
import TeamMemberRow from "../TeamMemberRow";
import CreditAmount from "../ui/CreditAmount";
import EmptyState from "../ui/EmptyState";
import RewardTierBadge from "../ui/RewardTierBadge";
import SectionHeader from "../ui/SectionHeader";
import StatTile from "../ui/StatTile";
import UserAvatar from "../ui/UserAvatar";
import { MiniLeaderboard, SprintsPanel } from "./HomePanels";

const HudStat = ({ label, value, to }) => {
  const body = (
    <>
      <Text textStyle='hud' fontSize='2xl' lineHeight='1'>
        {value}
      </Text>
      <Text fontSize='xs' color='whiteAlpha.800' fontWeight='semibold' mt={1} lineClamp={1}>
        {label}
      </Text>
    </>
  );
  return (
    <Box
      asChild={Boolean(to)}
      display='block'
      bg='whiteAlpha.200'
      borderWidth='1px'
      borderColor='whiteAlpha.200'
      rounded='l2'
      px={3}
      py={2.5}
      minW={0}
      transition='background 0.15s ease'
      _hover={to ? { bg: "whiteAlpha.300" } : undefined}
      focusVisibleRing='outside'
    >
      {to ? <Link to={to}>{body}</Link> : body}
    </Box>
  );
};

// The manager's HUD: who's on the team and what is waiting on them.
const TeamCard = ({ team, reviewCount, pendingCount, penaltyCount, isLoading }) => (
  <Box position='relative' overflow='hidden' rounded='l3' bgGradient='hero' color='white' p={{ base: 4, md: 5 }} boxShadow='glow' gridArea='player'>
    <Box position='absolute' top='-16' right='-12' boxSize='48' rounded='full' bg='whiteAlpha.200' filter='blur(40px)' aria-hidden />
    <Stack position='relative' gap={4}>
      <Flex justify='space-between' align='center' gap={3}>
        <Box minW={0}>
          <Text textStyle='eyebrow' color='whiteAlpha.800'>
            Your team
          </Text>
          <Heading as='p' fontSize='xl' fontWeight='800' color='white'>
            {isLoading ? "…" : `${team.length} ${team.length === 1 ? "person" : "people"}`}
          </Heading>
        </Box>
        <HStack gap={0} flexShrink={0}>
          {team.slice(0, 4).map((member, i) => (
            <UserAvatar key={member._id} name={member.name} size='sm' ms={i ? -2 : 0} borderWidth='2px' borderColor='whiteAlpha.700' />
          ))}
        </HStack>
      </Flex>
      <Grid templateColumns='repeat(3, minmax(0, 1fr))' gap={2}>
        <HudStat label='To review' value={reviewCount} to='/market' />
        <HudStat label='Rewards' value={pendingCount} to='/store' />
        <HudStat label='Penalties' value={penaltyCount} />
      </Grid>
    </Stack>
  </Box>
);

const ReviewQueue = ({ tasks }) => (
  <Box layerStyle='panel' borderColor='orange.muted' p={{ base: 2, md: 3 }} animation='fade-up'>
    <Flex align='center' gap={2} px={2} pt={1} color='orange.fg'>
      <Icon as={LuHourglass} />
      <Text textStyle='eyebrow'>Next up</Text>
    </Flex>
    <SectionHeader title='Waiting for review' count={tasks.length} as='h2' px={2} pt={1} mb={1} to='/market' linkLabel='Review' />
    <Stack gap={0.5}>
      {tasks.slice(0, 4).map((task) => (
        <Flex key={task._id} asChild align='center' gap={3} px={3} py={2.5} minH={14} rounded='l2' _hover={{ bg: "bg.muted" }} focusVisibleRing='inside'>
          <Link to={`/market/${task._id}`} state={{ task }}>
            <UserAvatar name={task.assignee?.name} size='sm' />
            <Box flex='1' minW={0}>
              <Text fontWeight='semibold' lineClamp={1} overflowWrap='anywhere'>
                {task.title}
              </Text>
              <Text fontSize='xs' color='fg.muted' lineClamp={1}>
                {firstName(task.assignee?.name) || "Someone"} submitted {moment(task.submittedAt ?? task.updated_at).fromNow()}
                {task.submissionNote ? ` · “${task.submissionNote}”` : ""}
              </Text>
            </Box>
            <RewardTierBadge reward={task.reward} showTier={false} size='sm' />
          </Link>
        </Flex>
      ))}
    </Stack>
  </Box>
);

const PendingRedemptions = ({ redemptions }) => (
  <Box layerStyle='panel' p={{ base: 2, md: 3 }} animation='fade-up'>
    <SectionHeader title='Rewards to hand out' count={redemptions.length} as='h3' px={2} pt={1} mb={1} to='/store' linkLabel='Store' />
    <Stack gap={0.5}>
      {redemptions.slice(0, 4).map((redemption) => (
        <Flex key={redemption._id} align='center' gap={3} px={3} py={2.5} minH={14}>
          <Flex colorPalette='coin' boxSize={9} rounded='l2' bg='colorPalette.subtle' color='colorPalette.fg' align='center' justify='center' flexShrink={0}>
            <LuGift />
          </Flex>
          <Box flex='1' minW={0}>
            <Text fontWeight='semibold' lineClamp={1} overflowWrap='anywhere'>
              {redemption.rewardTitle ?? redemption.reward?.title}
            </Text>
            <Text fontSize='xs' color='fg.muted' lineClamp={1}>
              {redemption.worker?.name ?? "Someone"} · {moment(redemption.createdAt).fromNow()}
            </Text>
          </Box>
          <CreditAmount value={redemption.cost} size='sm' flexShrink={0} />
        </Flex>
      ))}
    </Stack>
  </Box>
);

const summaryFor = ({ isLoading, reviewCount, pendingCount }) => {
  if (isLoading) return "Loading your team…";
  const parts = [];
  if (reviewCount) parts.push(`${reviewCount} ${reviewCount === 1 ? "task" : "tasks"} to review`);
  if (pendingCount) parts.push(`${pendingCount} ${pendingCount === 1 ? "reward" : "rewards"} to hand out`);
  return parts.length ? `You have ${parts.join(" and ")}.` : "Your team is all caught up. Post a task to keep the market busy.";
};

// What a manager should do next: review submitted work, hand out redeemed
// rewards, and keep an eye on how each report is doing.
const ManagerHome = ({ header }) => {
  const { userId } = useAuth();
  const sprints = useSprints();
  const tasks = useTasks();
  const team = useTeam();
  const review = useReviewQueue();
  const redemptions = useRedemptions();
  const penalties = usePenalties();
  const members = team.data ?? [];
  const toReview = review.data ?? [];
  const pending = (redemptions.data ?? []).filter((redemption) => redemption.status === "pending");
  const activePenalties = (penalties.data ?? []).filter((penalty) => penalty.status === "active");
  const isLoading = team.isLoading || review.isLoading || redemptions.isLoading;
  const sumOf = (field) => members.reduce((sum, member) => sum + (member[field] || 0), 0);
  const openTasks = (tasks.data ?? []).filter((task) => task.status === "open").length;

  return (
    <>
      {header(summaryFor({ isLoading, reviewCount: toReview.length, pendingCount: pending.length }))}
      <Grid
        templateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 20rem", xl: "minmax(0, 1fr) 22rem" }}
        templateAreas={{ base: `"player" "main" "side"`, lg: `"main player" "main side"` }}
        templateRows={{ lg: "auto 1fr" }}
        gap={{ base: 5, md: 6 }}
        alignItems='start'
      >
        <TeamCard team={members} reviewCount={toReview.length} pendingCount={pending.length} penaltyCount={activePenalties.length} isLoading={team.isLoading} />
        <Stack gridArea='main' gap={{ base: 5, md: 6 }} minW={0}>
          {isLoading ? (
            <Skeleton h='52' rounded='l3' />
          ) : toReview.length > 0 ? (
            <ReviewQueue tasks={toReview} />
          ) : pending.length === 0 ? (
            <EmptyState
              icon={LuPartyPopper}
              title='Nothing waiting on you'
              description='No submissions to review and no rewards to hand out. Post a task to keep the team busy.'
              layerStyle='panel'
            >
              <Button asChild>
                <Link to='/market/new'>
                  <LuPlus /> Post a task
                </Link>
              </Button>
            </EmptyState>
          ) : null}
          {pending.length > 0 && <PendingRedemptions redemptions={pending} />}
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={{ base: 3, md: 4 }}>
            <StatTile label='Open tasks' value={openTasks} icon={LuStore} palette='blue' hint='In your market' to='/market' />
            <StatTile label='In progress' value={sumOf("tasksInProgress")} icon={LuTimer} palette='brand' hint='Across the team' />
            <StatTile label='Done' value={sumOf("tasksDone")} icon={LuCircleCheckBig} palette='green' hint='Approved tasks' />
            <StatTile label='Team XP' value={formatNumber(sumOf("xp"))} icon={LuZap} palette='xp' hint='Earned so far' />
          </SimpleGrid>
          <Box layerStyle='panel' p={{ base: 2, md: 3 }} animation='fade-up'>
            <SectionHeader title='Team overview' count={members.length} as='h3' px={2} pt={1} mb={0} to='/leaderboard' linkLabel='Ranks' />
            {team.isLoading ? (
              <Skeleton h='32' rounded='l2' m={2} />
            ) : team.isError ? (
              <EmptyState size='sm' icon={LuUsers} palette='red' title="Couldn't load your team" description='Refresh the page to try again.' />
            ) : members.length ? (
              <Stack gap={0} separator={<Box borderBottomWidth='1px' borderColor='border' mx={3} />}>
                {members.map((member) => (
                  <TeamMemberRow key={member._id} member={member} />
                ))}
              </Stack>
            ) : (
              <EmptyState size='sm' icon={LuUsers} title='No one on your team yet' description='Workers pick you as their manager when they sign up.' />
            )}
          </Box>
        </Stack>
        <Stack gridArea='side' gap={{ base: 5, md: 6 }} minW={0}>
          {members.length > 0 && <MiniLeaderboard userId={userId} />}
          <SprintsPanel sprints={sprints.data} isLoading={sprints.isLoading} />
        </Stack>
      </Grid>
    </>
  );
};

export default ManagerHome;
