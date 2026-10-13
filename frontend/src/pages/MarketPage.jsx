import { Box, Button, Flex, HStack, NativeSelect, SimpleGrid, Skeleton, Stack, Text, useBreakpointValue } from "@chakra-ui/react";
import {
  LuCircleCheckBig,
  LuCloudOff,
  LuCoins,
  LuHand,
  LuHourglass,
  LuInbox,
  LuPlus,
  LuRotateCcw,
  LuSearchX,
  LuSend,
  LuSquarePen,
  LuStore,
  LuTimer,
  LuTrash2,
  LuUserRoundX,
} from "react-icons/lu";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import MarketTaskCard from "../components/MarketTaskCard";
import QuestCard from "../components/QuestCard";
import Celebration from "../components/ui/Celebration";
import CoinIcon from "../components/ui/CoinIcon";
import EmptyState from "../components/ui/EmptyState";
import FilterChips from "../components/ui/FilterChips";
import PageHeader from "../components/ui/PageHeader";
import SectionHeader from "../components/ui/SectionHeader";
import SegmentedControl from "../components/ui/SegmentedControl";
import StatTile from "../components/ui/StatTile";
import useMe from "../hooks/useMe";
import { useMarket, useMyTasks, useReviewQueue, useTeam } from "../hooks/useMarket";
import usePayoutCelebration from "../hooks/usePayoutCelebration";
import useTaskFlows from "../hooks/useTaskFlows";
import { TASK_TYPES, firstName, formatNumber, getTaskStatus } from "../lib/game";

const SORTS = {
  newest: { label: "Newest", compare: () => 0 },
  high: { label: "Highest reward", compare: (a, b) => b.reward - a.reward },
  low: { label: "Lowest reward", compare: (a, b) => a.reward - b.reward },
};

const sum = (tasks) => tasks.reduce((total, task) => total + (task.reward || 0), 0);

const CardGrid = (props) => <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={{ base: 3, md: 4 }} {...props} />;

const LoadingGrid = ({ count = 3, h = "56" }) => (
  <CardGrid>
    {Array.from({ length: count }, (_, i) => (
      <Skeleton key={i} h={h} rounded='l3' />
    ))}
  </CardGrid>
);

const LoadError = ({ onRetry, what = "the market" }) => (
  <EmptyState icon={LuCloudOff} palette='red' title={`Couldn't load ${what}`} description='Check your connection and try again.' layerStyle='panel'>
    <Button variant='outline' colorPalette='gray' onClick={onRetry}>
      Try again
    </Button>
  </EmptyState>
);

// Query-string tab so links and the back button keep the view.
const useTab = (fallback) => {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab");
  const setTab = (value) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value === fallback) next.delete("tab");
        else next.set("tab", value);
        return next;
      },
      { replace: true },
    );
  return [tab ?? fallback, setTab, tab !== null];
};

// ---- Worker ----

const ShopTab = ({ market, managerName, flows }) => {
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("newest");
  const tasks = market.data ?? [];

  if (market.isLoading) return <LoadingGrid />;
  if (market.isError) return <LoadError onRetry={market.refetch} />;
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={LuStore}
        palette='xp'
        title='The market is empty'
        description={`${managerName ? firstName(managerName) : "Your manager"} hasn't posted anything new. Check back soon.`}
        layerStyle='panel'
      />
    );
  }

  const typeOptions = [
    { value: "all", label: "All", count: tasks.length },
    ...Object.entries(TASK_TYPES).map(([value, meta]) => ({ value, label: meta.label, count: tasks.filter((task) => task.type === value).length })),
  ];
  const visible = (type === "all" ? tasks : tasks.filter((task) => task.type === type)).slice().sort(SORTS[sort].compare);

  return (
    <Stack gap={4}>
      <Flex align='center' justify='space-between' gap={3}>
        <HStack gap={1.5} fontSize='sm' color='fg.muted' minW={0}>
          <CoinIcon boxSize={5} />
          <Text lineClamp={2}>
            <Text as='span' fontWeight='bold' color='fg' textStyle='hud'>
              {formatNumber(sum(tasks))}
            </Text>{" "}
            credits up for grabs
          </Text>
        </HStack>
        <NativeSelect.Root w={{ base: "40", md: "48" }} flexShrink={0}>
          <NativeSelect.Field aria-label='Sort tasks' value={sort} onChange={(e) => setSort(e.target.value)}>
            {Object.entries(SORTS).map(([value, s]) => (
              <option key={value} value={value}>
                {s.label}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Flex>
      <FilterChips label='Task type' options={typeOptions} value={type} onChange={setType} />
      {visible.length === 0 ? (
        <EmptyState icon={LuSearchX} title={`No ${TASK_TYPES[type]?.label.toLowerCase()} tasks right now`} description='Try another type.' layerStyle='panel'>
          <Button variant='outline' colorPalette='gray' onClick={() => setType("all")}>
            Show all
          </Button>
        </EmptyState>
      ) : (
        <CardGrid>
          {visible.map((task) => (
            <MarketTaskCard
              key={task._id}
              task={task}
              posterName={task.createdBy?.name ?? managerName}
              action={
                <Button size='sm' minH={{ base: 11, md: 9 }} px={4} loading={flows.claimingId === task._id} onClick={() => flows.claim(task)}>
                  <LuHand /> Claim
                </Button>
              }
            />
          ))}
        </CardGrid>
      )}
    </Stack>
  );
};

const MyTasksTab = ({ mine, managerName, flows, onBrowse }) => {
  if (mine.isLoading) return <LoadingGrid count={2} h='40' />;
  if (mine.isError) return <LoadError onRetry={mine.refetch} what='your tasks' />;
  const tasks = mine.data ?? [];
  const sentBack = tasks.filter((task) => task.status === "in progress" && task.reviewNote);
  const working = tasks.filter((task) => task.status === "in progress" && !task.reviewNote);
  const review = tasks.filter((task) => task.status === "in review");
  const done = tasks.filter((task) => task.status === "done");

  if (tasks.length === 0) {
    return (
      <EmptyState icon={LuHand} palette='xp' title='No tasks yet' description='Claim one from the market to start earning credits.' layerStyle='panel'>
        <Button onClick={onBrowse}>
          <LuStore /> Browse the market
        </Button>
      </EmptyState>
    );
  }

  const submitButton = (task, resubmit) => (
    <Button size='sm' minH={{ base: 11, md: 9 }} px={4} colorPalette={resubmit ? "orange" : "brand"} onClick={() => flows.submit(task, managerName)}>
      {resubmit ? <LuRotateCcw /> : <LuSend />} {resubmit ? "Resubmit" : "Submit for review"}
    </Button>
  );

  const section = (title, list, render, extra) =>
    list.length > 0 && (
      <Box as='section'>
        <SectionHeader title={title} count={list.length} {...extra} />
        <CardGrid>{list.map(render)}</CardGrid>
      </Box>
    );

  return (
    <Stack gap={{ base: 6, md: 8 }}>
      <SimpleGrid columns={3} gap={{ base: 2, md: 4 }}>
        <StatTile label='In progress' value={sentBack.length + working.length} icon={LuTimer} palette='brand' />
        <StatTile label='In review' value={review.length} icon={LuHourglass} palette='orange' />
        <StatTile label='Earned' value={<CreditAmountInline value={sum(done)} />} icon={LuCoins} palette='coin' />
      </SimpleGrid>
      {section("Needs changes", sentBack, (task) => (
        <QuestCard key={task._id} task={task} reviewerName={managerName}>
          {submitButton(task, true)}
        </QuestCard>
      ))}
      {section("In progress", working, (task) => (
        <QuestCard key={task._id} task={task}>
          {submitButton(task, false)}
        </QuestCard>
      ))}
      {section("Waiting for review", review, (task) => (
        <QuestCard key={task._id} task={task} />
      ))}
      {section("Done", done, (task) => (
        <QuestCard key={task._id} task={task} />
      ))}
    </Stack>
  );
};

// Stat tiles take plain values; this keeps the coin next to the earned total.
const CreditAmountInline = ({ value }) => (
  <HStack as='span' display='inline-flex' gap={1.5} color='coin.fg'>
    <CoinIcon boxSize='0.85em' />
    {formatNumber(value)}
  </HStack>
);

const WorkerMarket = ({ profile }) => {
  const [tab, setTab] = useTab("shop");
  const market = useMarket();
  const mine = useMyTasks();
  const flows = useTaskFlows();
  const { payouts, dismiss } = usePayoutCelebration(profile._id, mine.data);
  const managerName = profile.manager?.name;

  const active = (mine.data ?? []).filter((task) => getTaskStatus(task.status).lane === "active");
  const needsChanges = active.filter((task) => task.reviewNote).length;
  const total = sum(payouts);

  return (
    <>
      <PageHeader
        eyebrow='Task market'
        title={tab === "mine" ? "My tasks" : "Up for grabs"}
        description={
          managerName
            ? `${firstName(managerName)} posts tasks here. Claim one, finish it, and get paid when it's approved.`
            : "Claim a task, finish it, and get paid when it's approved."
        }
      />
      {!profile.manager ? (
        <EmptyState
          icon={LuUserRoundX}
          title="You're not on a team yet"
          description='The market shows tasks from the manager you report to. Ask your manager to add you to their team.'
          layerStyle='panel'
        />
      ) : (
        <>
          <SegmentedControl
            label='Market view'
            mb={5}
            value={tab}
            onChange={setTab}
            options={[
              { value: "shop", label: "Market", count: market.data?.length },
              { value: "mine", label: "My tasks", count: active.length, palette: needsChanges ? "orange" : "brand" },
            ]}
          />
          {tab === "mine" ? (
            <MyTasksTab mine={mine} managerName={managerName} flows={flows} onBrowse={() => setTab("shop")} />
          ) : (
            <ShopTab market={market} managerName={managerName} flows={flows} />
          )}
        </>
      )}
      {flows.dialogs}
      <Celebration
        open={payouts.length > 0}
        onClose={dismiss}
        eyebrow="You've been paid"
        amount={total}
        title={payouts.length === 1 ? `"${payouts[0].title}" was approved` : `${payouts.length} tasks were approved`}
        description={`${formatNumber(total)} credits are in your wallet, plus ${formatNumber(total)} XP.`}
        actionLabel='Sweet!'
      >
        <Button asChild variant='ghost' size='sm' colorPalette='coin' onClick={dismiss}>
          <Link to='/wallet'>See my wallet</Link>
        </Button>
      </Celebration>
    </>
  );
};

// ---- Manager ----

const ReviewTab = ({ review, flows, onSeeTeam }) => {
  if (review.isLoading) return <LoadingGrid count={2} h='48' />;
  if (review.isError) return <LoadError onRetry={review.refetch} what='the review queue' />;
  const tasks = review.data ?? [];
  if (tasks.length === 0) {
    return (
      <EmptyState icon={LuInbox} palette='green' title="You're all caught up" description='Nothing is waiting for your review. Submitted work shows up here.' layerStyle='panel'>
        <Button variant='outline' colorPalette='gray' onClick={onSeeTeam}>
          See team tasks
        </Button>
      </EmptyState>
    );
  }
  return (
    <CardGrid>
      {tasks.map((task) => {
        const name = task.assignee?.name;
        return (
          <QuestCard key={task._id} task={task} person={name} showPerson>
            <Button variant='outline' colorPalette='gray' size='sm' minH={{ base: 11, md: 9 }} onClick={() => flows.reject(task, name)}>
              <LuRotateCcw /> Send back
            </Button>
            <Button colorPalette='green' size='sm' minH={{ base: 11, md: 9 }} onClick={() => flows.approve(task, name)}>
              <LuCircleCheckBig /> Approve · <CoinIcon /> {formatNumber(task.reward)}
            </Button>
          </QuestCard>
        );
      })}
    </CardGrid>
  );
};

const TEAM_FILTERS = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "in progress", label: "In progress" },
  { value: "in review", label: "In review" },
  { value: "done", label: "Done" },
];

const TeamTab = ({ mine, flows }) => {
  const [filter, setFilter] = useState("all");
  if (mine.isLoading) return <LoadingGrid />;
  if (mine.isError) return <LoadError onRetry={mine.refetch} what='your tasks' />;
  const tasks = mine.data ?? [];
  if (tasks.length === 0) {
    return (
      <EmptyState icon={LuStore} title='Post your first task' description='Give it a credit reward and your team can claim it from the market.' layerStyle='panel'>
        <Button asChild>
          <Link to='/market/new'>
            <LuPlus /> Post a task
          </Link>
        </Button>
      </EmptyState>
    );
  }
  const options = TEAM_FILTERS.map((f) => ({ ...f, count: f.value === "all" ? tasks.length : tasks.filter((task) => task.status === f.value).length }));
  const visible = filter === "all" ? tasks : tasks.filter((task) => task.status === filter);
  return (
    <Stack gap={4}>
      <FilterChips label='Task status' options={options} value={filter} onChange={setFilter} />
      {visible.length === 0 ? (
        <EmptyState size='sm' icon={LuSearchX} title='Nothing here' description='No tasks with this status right now.' layerStyle='panel' />
      ) : (
        <CardGrid>
          {visible.map((task) => {
            const name = task.assignee?.name;
            return (
              <QuestCard key={task._id} task={task} person={name} showPerson reviewerName='You'>
                {task.status === "open" && (
                  <>
                    <Button variant='ghost' colorPalette='red' size='sm' minH={{ base: 11, md: 9 }} onClick={() => flows.remove(task)}>
                      <LuTrash2 /> Delete
                    </Button>
                    <Button asChild variant='outline' colorPalette='gray' size='sm' minH={{ base: 11, md: 9 }}>
                      <Link to={`/market/${task._id}/edit`}>
                        <LuSquarePen /> Edit
                      </Link>
                    </Button>
                  </>
                )}
                {task.status === "in review" && (
                  <Button asChild colorPalette='orange' size='sm' minH={{ base: 11, md: 9 }}>
                    <Link to={`/market/${task._id}`}>
                      <LuHourglass /> Review
                    </Link>
                  </Button>
                )}
              </QuestCard>
            );
          })}
        </CardGrid>
      )}
    </Stack>
  );
};

const ManagerMarket = () => {
  const [chosenTab, setTab, picked] = useTab("review");
  const mine = useMyTasks();
  const review = useReviewQueue();
  const team = useTeam();
  const flows = useTaskFlows();
  const showIcons = useBreakpointValue({ base: false, md: true });
  const tasks = mine.data ?? [];
  const count = (status) => tasks.filter((task) => task.status === status).length;
  const loading = mine.isLoading;
  // A manager with nothing posted yet starts on "Post your first task".
  const tab = !picked && !loading && tasks.length === 0 ? "team" : chosenTab;
  // Phones skip the tile icons so the review queue starts higher up.
  const icon = (value) => (showIcons ? value : undefined);

  return (
    <>
      <PageHeader
        eyebrow='Task market'
        title='Your market'
        description={`Post tasks with a credit reward. ${team.data?.length ? `Your ${team.data.length} reports claim them` : "Your team claims them"}, you approve the work, they get paid.`}
        actions={
          <Button asChild>
            <Link to='/market/new'>
              <LuPlus /> Post a task
            </Link>
          </Button>
        }
      />
      <SimpleGrid columns={{ base: 2, md: 4 }} gap={{ base: 3, md: 4 }} mb={{ base: 5, md: 6 }}>
        <StatTile label='Open' value={loading ? "–" : count("open")} icon={icon(LuStore)} palette='blue' />
        <StatTile label='In progress' value={loading ? "–" : count("in progress")} icon={icon(LuTimer)} palette='brand' />
        <StatTile label='To review' value={loading ? "–" : count("in review")} icon={icon(LuHourglass)} palette='orange' />
        <StatTile
          label='Paid out'
          value={loading ? "–" : <CreditAmountInline value={sum(tasks.filter((task) => task.status === "done"))} />}
          icon={icon(LuCoins)}
          palette='coin'
        />
      </SimpleGrid>
      <SegmentedControl
        label='Market view'
        mb={5}
        value={tab}
        onChange={setTab}
        options={[
          { value: "review", label: "Review", count: review.data?.length, palette: "orange" },
          { value: "team", label: "Team tasks", count: tasks.length },
        ]}
      />
      {tab === "team" ? <TeamTab mine={mine} flows={flows} /> : <ReviewTab review={review} flows={flows} onSeeTeam={() => setTab("team")} />}
      {flows.dialogs}
    </>
  );
};

// The task market: workers shop for tasks and track their own; managers post
// tasks, review submitted work and see their team's tasks.
const MarketPage = () => {
  const { profile, isLoading, error, refetch } = useMe();
  if (isLoading) {
    return (
      <Stack gap={5}>
        <Skeleton h='16' w={{ base: "full", md: "md" }} rounded='l2' />
        <LoadingGrid />
      </Stack>
    );
  }
  if (!profile) {
    return (
      <>
        <PageHeader eyebrow='Task market' title='Market' />
        {error?.response?.status !== 404 ? <LoadError onRetry={refetch} /> : <EmptyState icon={LuStore} title='The market is closed' description="This server doesn't run the task market yet." layerStyle='panel' />}
      </>
    );
  }
  return profile.role === "manager" ? <ManagerMarket /> : <WorkerMarket profile={profile} />;
};

export default MarketPage;
