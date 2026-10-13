import { Box, Button, Flex, Grid, HStack, Heading, Icon, Progress, SimpleGrid, Skeleton, Stack, Text } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import moment from "moment";
import {
  LuCheck,
  LuGift,
  LuHand,
  LuHourglass,
  LuListTodo,
  LuMessageSquareWarning,
  LuPartyPopper,
  LuPlay,
  LuShieldAlert,
  LuStore,
  LuTarget,
  LuTimer,
} from "react-icons/lu";
import { Link } from "react-router-dom";
import api from "../../api/api";
import useAuth from "../../hooks/useAuth";
import { usePenalties, useRewards } from "../../hooks/useGameQueries";
import useSprints from "../../hooks/useSprints";
import { assigneeId, formatNumber, getTaskStatus, isMarketTask, taskPath } from "../../lib/game";
import PlayerCard from "../PlayerCard";
import CreditAmount from "../ui/CreditAmount";
import EmptyState from "../ui/EmptyState";
import RewardTierBadge from "../ui/RewardTierBadge";
import SectionHeader from "../ui/SectionHeader";
import StatTile from "../ui/StatTile";
import StatusBadge from "../ui/StatusBadge";
import TaskTypeBadge from "../ui/TaskTypeBadge";
import { toaster } from "../ui/toaster";
import { Lane, MiniLeaderboard, SprintsPanel } from "./HomePanels";

// One-tap next step for board tasks. Market tasks move
// through their own claim/submit flow instead.
const NEXT_STEP = {
  "not started": { status: "in progress", label: "Start task", icon: LuPlay, done: "Task started. Go get it!" },
  "in progress": { status: "completed", label: "Mark completed", icon: LuCheck, done: "Nice work! Task completed." },
};

const NextUpCard = ({ task, refetch }) => {
  const step = !isMarketTask(task) ? NEXT_STEP[task.status] : undefined;
  const advance = useMutation({
    mutationFn: () => api.post(`/tasks/status/${task._id}`, { status: step.status }),
    onSuccess: async () => {
      await refetch();
      toaster.create({ title: step.done, type: "success" });
    },
    onError: () => toaster.create({ title: "Couldn't update the task", type: "error" }),
  });
  const marketAction = isMarketTask(task) && task.status === "in progress";
  return (
    <Box position='relative' overflow='hidden' layerStyle='panel' borderColor='brand.muted' p={{ base: 4, md: 6 }} animation='fade-up'>
      <Box position='absolute' top='-24' right='-16' boxSize='56' rounded='full' bgGradient='hero' opacity={0.14} filter='blur(40px)' aria-hidden />
      <Stack position='relative' gap={3}>
        <Flex justify='space-between' align='center' gap={2}>
          <HStack gap={1.5} color='brand.fg'>
            <Icon as={LuTarget} />
            <Text textStyle='eyebrow'>Next up</Text>
          </HStack>
          <StatusBadge status={task.status} />
        </Flex>
        <Box>
          <Heading as='h2' fontSize={{ base: "xl", md: "2xl" }} fontWeight='800' lineHeight='1.2' overflowWrap='anywhere'>
            {task.title}
          </Heading>
          {task.description && (
            <Text color='fg.muted' mt={1.5} lineClamp={2} overflowWrap='anywhere'>
              {task.description}
            </Text>
          )}
        </Box>
        {task.reviewNote && task.status === "in progress" && (
          <Flex colorPalette='orange' gap={2.5} bg='colorPalette.subtle' borderWidth='1px' borderColor='colorPalette.muted' rounded='l2' p={3}>
            <Icon as={LuMessageSquareWarning} color='colorPalette.fg' boxSize={4.5} flexShrink={0} mt={0.5} />
            <Box minW={0}>
              <Text fontSize='sm' fontWeight='bold' color='colorPalette.fg'>
                Changes requested
              </Text>
              <Text fontSize='sm' overflowWrap='anywhere'>
                {task.reviewNote}
              </Text>
            </Box>
          </Flex>
        )}
        <HStack gap={2} wrap='wrap'>
          <TaskTypeBadge type={task.type} />
          {task.reward != null && <RewardTierBadge reward={task.reward} />}
          {task.updated_at && (
            <Text fontSize='xs' color='fg.subtle'>
              Updated {moment(task.updated_at).fromNow()}
            </Text>
          )}
        </HStack>
        <Flex direction={{ base: "column", sm: "row" }} gap={2} mt={2}>
          {step && (
            <Button onClick={() => advance.mutate()} loading={advance.isPending}>
              <step.icon /> {step.label}
            </Button>
          )}
          {marketAction ? (
            <Button asChild>
              <Link to={taskPath(task)} state={{ task }}>
                <LuCheck /> {task.reviewNote ? "Fix and resubmit" : "Submit for review"}
              </Link>
            </Button>
          ) : (
            <Button asChild variant='outline' colorPalette='gray'>
              <Link to={taskPath(task)} state={{ task }}>
                Open task
              </Link>
            </Button>
          )}
        </Flex>
      </Stack>
    </Box>
  );
};

// Active penalties come first: clearing one is the most urgent thing to spend on.
const PenaltyAlert = ({ penalties, credits }) => {
  const total = penalties.reduce((sum, penalty) => sum + penalty.cost, 0);
  const canClear = credits != null && credits >= penalties[0].cost;
  return (
    <Flex
      colorPalette='red'
      direction={{ base: "column", sm: "row" }}
      align={{ base: "stretch", sm: "center" }}
      gap={{ base: 3, sm: 4 }}
      layerStyle='panel'
      borderColor='colorPalette.muted'
      bg='colorPalette.subtle'
      p={{ base: 4, md: 5 }}
      animation='fade-up'
    >
      <HStack gap={3} flex='1' minW={0} align='flex-start'>
        <Flex boxSize={10} rounded='l2' bg='colorPalette.solid' color='colorPalette.contrast' align='center' justify='center' flexShrink={0}>
          <LuShieldAlert />
        </Flex>
        <Box minW={0}>
          <Text fontWeight='bold' color='colorPalette.fg'>
            {penalties.length === 1 ? "You have an active penalty" : `You have ${penalties.length} active penalties`}
          </Text>
          <Text fontSize='sm' color='fg.muted' lineClamp={2} overflowWrap='anywhere'>
            {penalties.length === 1 ? `${penalties[0].reason} · ` : ""}
            {formatNumber(total)} credits clears {penalties.length === 1 ? "it" : "them all"}.
            {canClear ? "" : " Earn a few more first."}
          </Text>
        </Box>
      </HStack>
      <Button asChild colorPalette='red' variant={canClear ? "solid" : "outline"} flexShrink={0}>
        <Link to='/wallet'>{canClear ? "Clear it now" : "View in wallet"}</Link>
      </Button>
    </Flex>
  );
};

// The cheapest few rewards as goals: how close your balance gets you to each.
const RewardGoals = ({ credits, hasManager }) => {
  const { data: rewards = [], isLoading, isError } = useRewards();
  const goals = rewards.filter((reward) => reward.stock !== 0).slice(0, 3);
  return (
    <Box layerStyle='panel' p={{ base: 4, md: 5 }}>
      <SectionHeader title='Reward goals' as='h3' to='/store' linkLabel='Store' />
      {isLoading ? (
        <Skeleton h='28' rounded='l2' />
      ) : isError || goals.length === 0 ? (
        <EmptyState
          size='sm'
          icon={LuGift}
          palette='coin'
          title={hasManager ? "The store is empty" : "No store yet"}
          description={hasManager ? "Your manager hasn't stocked any rewards yet." : "Join a manager's team to unlock their rewards store."}
          py={3}
        />
      ) : (
        <Stack gap={3}>
          {goals.map((reward) => {
            const ready = credits != null && credits >= reward.cost;
            const pct = credits == null ? 0 : Math.min(100, Math.round((credits / reward.cost) * 100));
            return (
              <Box key={reward._id} bg='bg.subtle' rounded='l2' px={3} py={2.5}>
                <Flex justify='space-between' align='center' gap={3} mb={2}>
                  <Text fontSize='sm' fontWeight='semibold' lineClamp={1} overflowWrap='anywhere'>
                    {reward.title}
                  </Text>
                  <CreditAmount value={reward.cost} size='sm' flexShrink={0} />
                </Flex>
                <Progress.Root value={pct} size='xs' colorPalette={ready ? "green" : "coin"} aria-label={`${pct}% of the way to ${reward.title}`}>
                  <Progress.Track bg='bg.muted'>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
                <Text fontSize='xs' mt={1.5} color={ready ? "green.fg" : "fg.muted"} fontWeight={ready ? "semibold" : "normal"}>
                  {ready ? "You can redeem this now" : `${formatNumber(reward.cost - (credits ?? 0))} credits to go`}
                </Text>
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
};

const summaryFor = ({ isLoading, active, todo, review }) => {
  if (isLoading) return "Loading your board…";
  if (active.length) return `You have ${active.length} in progress and ${review.length} waiting for review.`;
  if (todo.length) return `${todo.length} ${todo.length === 1 ? "task is" : "tasks are"} ready for you to start.`;
  if (review.length) return `${review.length} ${review.length === 1 ? "task is" : "tasks are"} with your manager for review.`;
  return "Your plate is clear. Grab something from the market.";
};

// What a worker should do next: the task in hand, penalties to clear, tasks up
// for grabs and how close they are to a reward.
const WorkerHome = ({ profile, tasks, isLoading, refetch, header }) => {
  const { userId } = useAuth();
  const sprints = useSprints();
  const hasGame = Boolean(profile);
  const penalties = usePenalties({ enabled: hasGame });
  const activePenalties = (penalties.data ?? []).filter((penalty) => penalty.status === "active");

  const mine = tasks.filter((task) => assigneeId(task) === userId);
  const inLane = (lane) => mine.filter((task) => getTaskStatus(task.status).lane === lane);
  const active = inLane("active");
  const todo = inLane("todo");
  const review = inLane("review");
  const upForGrabs = tasks.filter((task) => !assigneeId(task) && getTaskStatus(task.status).lane === "todo");
  const marketOpen = upForGrabs.filter(isMarketTask);
  const grabPath = marketOpen.length ? "/market" : "/tasks?scope=open&lane=todo";
  // A task sent back with changes requested comes first.
  const nextUp = active.find((task) => task.reviewNote) ?? active[0] ?? todo[0];

  return (
    <>
      {header(summaryFor({ isLoading, active, todo, review }))}
      <Grid
        templateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 20rem", xl: "minmax(0, 1fr) 22rem" }}
        templateAreas={{ base: `"player" "main" "side"`, lg: `"main player" "main side"` }}
        templateRows={{ lg: "auto 1fr" }}
        gap={{ base: 5, md: 6 }}
        alignItems='start'
      >
        <PlayerCard gridArea='player' />
        <Stack gridArea='main' gap={{ base: 5, md: 6 }} minW={0}>
          {activePenalties.length > 0 && <PenaltyAlert penalties={activePenalties} credits={profile?.credits} />}
          {isLoading ? (
            <Skeleton h='52' rounded='l3' />
          ) : nextUp ? (
            <NextUpCard task={nextUp} refetch={refetch} />
          ) : (
            <EmptyState
              icon={LuPartyPopper}
              title="You're all caught up"
              description={
                upForGrabs.length
                  ? `${upForGrabs.length} ${upForGrabs.length === 1 ? "task is" : "tasks are"} up for grabs. Claim one and start earning.`
                  : "Nothing is assigned to you right now. Check back when your manager posts new tasks."
              }
              layerStyle='panel'
            >
              <Button asChild>
                <Link to={grabPath}>
                  <LuStore /> {marketOpen.length ? "Open the market" : "Browse the board"}
                </Link>
              </Button>
            </EmptyState>
          )}
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={{ base: 3, md: 4 }}>
            <StatTile label='In progress' value={active.length} icon={LuTimer} palette='brand' to='/tasks?scope=mine&lane=active' />
            <StatTile label='In review' value={review.length} icon={LuHourglass} palette='orange' to='/tasks?scope=mine&lane=review' />
            <StatTile label='Up for grabs' value={upForGrabs.length} icon={LuHand} palette='xp' to={grabPath} />
            <StatTile label='To do' value={todo.length} icon={LuListTodo} palette='gray' to='/tasks?scope=mine&lane=todo' />
          </SimpleGrid>
          <Lane title='Also in progress' tasks={active.filter((task) => task !== nextUp)} to='/tasks?scope=mine&lane=active' />
          <Lane title='Waiting for review' tasks={review} to='/tasks?scope=mine&lane=review' />
          <Lane title='Up next' tasks={todo.filter((task) => task !== nextUp)} to='/tasks?scope=mine&lane=todo' />
        </Stack>
        <Stack gridArea='side' gap={{ base: 5, md: 6 }} minW={0}>
          {hasGame && <RewardGoals credits={profile.credits} hasManager={Boolean(profile.manager)} />}
          {hasGame && profile.manager && <MiniLeaderboard userId={userId} />}
          <SprintsPanel sprints={sprints.data} isLoading={sprints.isLoading} />
        </Stack>
      </Grid>
    </>
  );
};

export default WorkerHome;
