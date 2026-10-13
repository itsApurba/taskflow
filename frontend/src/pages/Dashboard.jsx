import { Badge, Box, Button, Flex, Grid, HStack, Heading, Icon, Progress, SimpleGrid, Skeleton, Stack, Text } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import moment from "moment";
import { LuCalendarRange, LuCheck, LuGift, LuHand, LuHourglass, LuListTodo, LuPartyPopper, LuPlay, LuPlus, LuTarget, LuTimer } from "react-icons/lu";
import { Link } from "react-router-dom";
import api from "../api/api";
import PlayerCard from "../components/PlayerCard";
import TaskRow from "../components/TaskRow";
import CoinIcon from "../components/ui/CoinIcon";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";
import RewardTierBadge from "../components/ui/RewardTierBadge";
import SectionHeader from "../components/ui/SectionHeader";
import StatTile from "../components/ui/StatTile";
import StatusBadge from "../components/ui/StatusBadge";
import TaskTypeBadge from "../components/ui/TaskTypeBadge";
import { toaster } from "../components/ui/toaster";
import useAuth from "../hooks/useAuth";
import useMe from "../hooks/useMe";
import useRewards from "../hooks/useRewards";
import useSprints from "../hooks/useSprints";
import useTasks from "../hooks/useTasks";
import { SAMPLE_REWARDS, assigneeId, firstName, formatNumber, getTaskStatus, isMarketTask, taskPath } from "../lib/game";
import { formatSprintDates, sortSprints, sprintPhase } from "../lib/sprints";

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

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
          <Button asChild variant='outline' colorPalette='gray'>
            <Link to={taskPath(task)} state={{ task }}>
              Open task
            </Link>
          </Button>
        </Flex>
      </Stack>
    </Box>
  );
};

const Lane = ({ title, tasks, to }) =>
  tasks.length > 0 && (
    <Box layerStyle='panel' p={{ base: 2, md: 3 }} animation='fade-up'>
      <SectionHeader title={title} to={to} px={2} pt={1} mb={1} as='h3' />
      <Stack gap={0.5}>
        {tasks.slice(0, 4).map((task) => (
          <TaskRow key={task._id} task={task} />
        ))}
      </Stack>
    </Box>
  );

const SprintsPanel = ({ sprints, isLoading }) => {
  const current = sortSprints(sprints)
    .filter((sprint) => sprintPhase(sprint).id !== "ended")
    .slice(0, 2);
  return (
    <Box layerStyle='panel' p={{ base: 4, md: 5 }}>
      <SectionHeader title='Sprints' to='/sprints' as='h3' />
      {isLoading ? (
        <Skeleton h='16' rounded='l2' />
      ) : current.length === 0 ? (
        <EmptyState size='sm' icon={LuCalendarRange} title='No active sprint' description='Give the team a finish line.' py={3}>
          <Button asChild size='sm' variant='outline' colorPalette='gray'>
            <Link to='/create-sprint'>
              <LuPlus /> New sprint
            </Link>
          </Button>
        </EmptyState>
      ) : (
        <Stack gap={4}>
          {current.map((sprint) => {
            const phase = sprintPhase(sprint);
            return (
              <Box key={sprint._id} asChild display='block' rounded='l2' focusVisibleRing='outside'>
                <Link to={`/sprint/${sprint._id}`} state={{ sprint }}>
                  <Flex justify='space-between' align='center' gap={2} mb={1}>
                    <Text fontWeight='semibold' lineClamp={1}>
                      {sprint.name}
                    </Text>
                    <Badge colorPalette={phase.palette} variant='subtle' size='sm' flexShrink={0}>
                      {phase.label}
                    </Badge>
                  </Flex>
                  <Text fontSize='xs' color='fg.muted' mb={2}>
                    {formatSprintDates(sprint)} · {phase.note} · {sprint.tasks.length} {sprint.tasks.length === 1 ? "task" : "tasks"}
                  </Text>
                  <Progress.Root value={Math.round(phase.progress * 100)} size='xs' colorPalette={phase.palette} aria-label={`${sprint.name} time elapsed`}>
                    <Progress.Track bg='bg.muted'>
                      <Progress.Range />
                    </Progress.Track>
                  </Progress.Root>
                </Link>
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
};

// Live rewards once the game backend is on; examples (marked "Soon") before that.
const StoreTeaser = () => {
  const { profile } = useMe();
  const rewards = useRewards({ enabled: Boolean(profile) });
  const live = profile ? (rewards.data ?? []).filter((reward) => reward.active).slice(0, 3) : SAMPLE_REWARDS;
  return (
    <Box layerStyle='panel' p={{ base: 4, md: 5 }}>
      <Flex justify='space-between' align='center' mb={3} gap={2}>
        <HStack gap={2}>
          <Flex colorPalette='coin' boxSize={8} rounded='l2' bg='colorPalette.subtle' color='colorPalette.fg' align='center' justify='center'>
            <LuGift />
          </Flex>
          <Heading as='h3' fontSize='lg' fontWeight='700'>
            Rewards store
          </Heading>
        </HStack>
        {profile ? (
          <Button asChild variant='ghost' size='sm' colorPalette='brand' mr={-2} minH={{ base: 11, md: 9 }}>
            <Link to='/store'>Visit store</Link>
          </Button>
        ) : (
          <Badge variant='outline' colorPalette='gray' size='sm'>
            Soon
          </Badge>
        )}
      </Flex>
      {profile && rewards.isLoading ? (
        <Skeleton h='28' rounded='l2' />
      ) : live.length === 0 ? (
        <Text fontSize='sm' color='fg.muted'>
          {profile?.role === "manager" ? "Your store is empty. Stock a reward for the team." : "No rewards in the store yet."}
        </Text>
      ) : (
        <Stack gap={2}>
          {live.map((reward) => (
            <Flex key={reward.title} justify='space-between' align='center' gap={3} bg='bg.subtle' rounded='l2' px={3} py={2.5}>
              <Text fontSize='sm' fontWeight='medium' lineClamp={1}>
                {reward.title}
              </Text>
              <HStack gap={1} color='coin.fg' fontWeight='bold' fontSize='sm' flexShrink={0} fontVariantNumeric='tabular-nums'>
                <CoinIcon boxSize={4} /> {formatNumber(reward.cost)}
              </HStack>
            </Flex>
          ))}
        </Stack>
      )}
      {!profile && (
        <Text fontSize='xs' color='fg.muted' mt={3}>
          Examples. Your manager stocks the real rewards.
        </Text>
      )}
    </Box>
  );
};

const Dashboard = () => {
  const { userName, userId } = useAuth();
  const { profile } = useMe();
  const canPost = profile?.role !== "worker";
  const { data: tasks = [], isLoading, refetch } = useTasks();
  const sprints = useSprints();

  const mine = tasks.filter((task) => assigneeId(task) === userId);
  const inLane = (lane) => mine.filter((task) => getTaskStatus(task.status).lane === lane);
  const active = inLane("active");
  const todo = inLane("todo");
  const review = inLane("review");
  const upForGrabs = tasks.filter((task) => !assigneeId(task) && getTaskStatus(task.status).lane === "todo");
  const nextUp = active[0] ?? todo[0];

  const summary = isLoading
    ? "Loading your board…"
    : active.length
      ? `You have ${active.length} in progress and ${review.length} waiting for review.`
      : todo.length
        ? `${todo.length} ${todo.length === 1 ? "task is" : "tasks are"} ready for you to start.`
        : "Your plate is clear. Grab something from the board.";

  return (
    <>
      <PageHeader
        eyebrow={moment().format("dddd, D MMMM")}
        title={`${greeting()}, ${firstName(userName)}`}
        description={summary}
        // Phones create tasks from the Board tab; here the next-up card leads.
        actionsProps={{ display: { base: "none", sm: "flex" } }}
        actions={
          canPost && (
            <Button asChild>
              <Link to='/create-task'>
                <LuPlus /> New task
              </Link>
            </Button>
          )
        }
      />
      <Grid
        templateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 20rem", xl: "minmax(0, 1fr) 22rem" }}
        templateAreas={{ base: `"player" "main" "side"`, lg: `"main player" "main side"` }}
        templateRows={{ lg: "auto 1fr" }}
        gap={{ base: 5, md: 6 }}
        alignItems='start'
      >
        <PlayerCard gridArea='player' />
        <Stack gridArea='main' gap={{ base: 5, md: 6 }} minW={0}>
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
                  ? `${upForGrabs.length} unassigned ${upForGrabs.length === 1 ? "task is" : "tasks are"} up for grabs on the board.`
                  : "Nothing is assigned to you right now."
              }
              layerStyle='panel'
            >
              <Button asChild>
                <Link to={upForGrabs.length ? "/tasks?scope=open&lane=todo" : "/tasks"}>Browse the board</Link>
              </Button>
            </EmptyState>
          )}
          <SimpleGrid columns={{ base: 2, md: 4 }} gap={{ base: 3, md: 4 }}>
            <StatTile label='In progress' value={active.length} icon={LuTimer} palette='brand' to='/tasks?scope=mine&lane=active' />
            <StatTile label='To do' value={todo.length} icon={LuListTodo} palette='gray' to='/tasks?scope=mine&lane=todo' />
            <StatTile label='In review' value={review.length} icon={LuHourglass} palette='orange' to='/tasks?scope=mine&lane=review' />
            <StatTile label='Up for grabs' value={upForGrabs.length} icon={LuHand} palette='xp' to='/tasks?scope=open&lane=todo' />
          </SimpleGrid>
          <Lane title='Also in progress' tasks={active.filter((task) => task !== nextUp)} to='/tasks?scope=mine&lane=active' />
          <Lane title='Waiting for review' tasks={review} to='/tasks?scope=mine&lane=review' />
          <Lane title='Up next' tasks={todo.filter((task) => task !== nextUp)} to='/tasks?scope=mine&lane=todo' />
        </Stack>
        <Stack gridArea='side' gap={{ base: 5, md: 6 }} minW={0}>
          <SprintsPanel sprints={sprints.data} isLoading={sprints.isLoading} />
          <StoreTeaser />
        </Stack>
      </Grid>
    </>
  );
};

export default Dashboard;
