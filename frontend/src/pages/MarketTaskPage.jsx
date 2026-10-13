import { Box, Button, Flex, Grid, HStack, Heading, Icon, Skeleton, Stack, Text } from "@chakra-ui/react";
import moment from "moment";
import {
  LuCircleCheckBig,
  LuFileQuestion,
  LuHand,
  LuHourglass,
  LuPartyPopper,
  LuRotateCcw,
  LuSend,
  LuSquarePen,
  LuStore,
  LuTimer,
  LuTrash2,
  LuUserRound,
} from "react-icons/lu";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { NoteQuote } from "../components/QuestCard";
import TaskLifecycle from "../components/TaskLifecycle";
import CreditAmount from "../components/ui/CreditAmount";
import EmptyState from "../components/ui/EmptyState";
import PageHeader from "../components/ui/PageHeader";
import RewardTierBadge from "../components/ui/RewardTierBadge";
import StatusBadge from "../components/ui/StatusBadge";
import TaskTypeBadge from "../components/ui/TaskTypeBadge";
import UserAvatar from "../components/ui/UserAvatar";
import useMe from "../hooks/useMe";
import { useMarketTask, usePersonName } from "../hooks/useMarket";
import useTaskFlows from "../hooks/useTaskFlows";
import { assigneeId, firstName, formatNumber, getRewardTier, isMarketTask } from "../lib/game";

const idOf = (person) => (person && typeof person === "object" ? person._id : person) || null;

// The "what happens next" panel: one sentence and the action for this viewer.
const NextStep = ({ icon, palette = "brand", title, children, actions }) => (
  <Box layerStyle='panel' p={{ base: 4, md: 5 }} animation='fade-up'>
    <HStack gap={3} align='flex-start'>
      <Flex colorPalette={palette} boxSize={10} rounded='l2' bg='colorPalette.subtle' color='colorPalette.fg' align='center' justify='center' flexShrink={0}>
        <Icon as={icon} boxSize={5} />
      </Flex>
      <Box minW={0}>
        <Heading as='h2' fontSize='lg' fontWeight='700'>
          {title}
        </Heading>
        <Box color='fg.muted' fontSize='sm' mt={0.5}>
          {children}
        </Box>
      </Box>
    </HStack>
    {actions && (
      <Stack gap={2} mt={4}>
        {actions}
      </Stack>
    )}
  </Box>
);

const Person = ({ label, name, fallback, hint }) => (
  <HStack gap={3} minW={0}>
    {name ? (
      <UserAvatar name={name} size='sm' />
    ) : (
      <Flex boxSize={8} rounded='full' borderWidth='1.5px' borderStyle='dashed' borderColor='border.emphasized' color='fg.subtle' align='center' justify='center' flexShrink={0}>
        <LuUserRound size={14} />
      </Flex>
    )}
    <Box minW={0} lineHeight='1.25'>
      <Text fontSize='xs' color='fg.subtle'>
        {label}
      </Text>
      <Text fontWeight='semibold' lineClamp={1} color={name ? "fg" : "fg.muted"}>
        {name ?? fallback}
      </Text>
      {hint && (
        <Text fontSize='xs' color='fg.muted' lineClamp={1}>
          {hint}
        </Text>
      )}
    </Box>
  </HStack>
);

const TaskActions = ({ task, profile, posterName, assigneeName, flows }) => {
  const reward = formatNumber(task.reward);
  const isManager = profile.role === "manager";
  const isCreator = idOf(task.createdBy) === profile._id;
  const isMine = assigneeId(task) === profile._id;
  const manager = posterName ? firstName(posterName) : "your manager";
  const worker = assigneeName ? firstName(assigneeName) : "A teammate";
  const big = { size: "lg", w: "full" };

  if (task.status === "done") {
    return (
      <NextStep icon={LuPartyPopper} palette='coin' title={isMine ? `You earned ${reward} credits` : isManager ? `Paid ${reward} credits to ${worker}` : "Done and paid"}>
        <Text>{task.approvedAt ? `Approved ${moment(task.approvedAt).format("D MMM YYYY")}.` : "Approved."}</Text>
        {isMine && (
          <Button asChild variant='outline' colorPalette='coin' size='sm' mt={3}>
            <Link to='/wallet'>See my wallet</Link>
          </Button>
        )}
      </NextStep>
    );
  }

  if (isManager) {
    if (!isCreator) {
      return (
        <NextStep icon={LuStore} palette='gray' title='Posted by another manager'>
          Only the manager who posted it can change it.
        </NextStep>
      );
    }
    if (task.status === "open") {
      return (
        <NextStep
          icon={LuStore}
          palette='blue'
          title='Waiting for a claim'
          actions={
            <>
              <Button asChild {...big}>
                <Link to={`/market/${task._id}/edit`}>
                  <LuSquarePen /> Edit task
                </Link>
              </Button>
              <Button variant='outline' colorPalette='red' {...big} onClick={() => flows.remove(task)}>
                <LuTrash2 /> Delete
              </Button>
            </>
          }
        >
          It's on your team's market. You can edit or delete it until someone claims it.
        </NextStep>
      );
    }
    if (task.status === "in review") {
      return (
        <NextStep
          icon={LuHourglass}
          palette='orange'
          title='Ready for your review'
          actions={
            <>
              <Button colorPalette='green' {...big} onClick={() => flows.approve(task, assigneeName)}>
                <LuCircleCheckBig /> Approve and pay {reward}
              </Button>
              <Button variant='outline' colorPalette='gray' {...big} onClick={() => flows.reject(task, assigneeName)}>
                <LuRotateCcw /> Send back with a note
              </Button>
            </>
          }
        >
          {worker} submitted it {task.submittedAt ? moment(task.submittedAt).fromNow() : "recently"}. Approving pays {reward} credits and XP.
        </NextStep>
      );
    }
    return (
      <NextStep icon={task.reviewNote ? LuRotateCcw : LuTimer} palette={task.reviewNote ? "orange" : "brand"} title={`${worker} is on it`}>
          {task.reviewNote ? (
          <>
            <Text mb={3}>It comes back to your review queue when it's resubmitted.</Text>
            <NoteQuote palette='orange' icon={LuRotateCcw} label='You asked for changes' note={task.reviewNote} color='fg' />
          </>
        ) : (
          "You'll review it when it's submitted."
        )}
      </NextStep>
    );
  }

  if (task.status === "open") {
    return (
      <NextStep
        icon={LuHand}
        palette='xp'
        title='Up for grabs'
        actions={
          <Button {...big} loading={flows.claimingId === task._id} onClick={() => flows.claim(task)}>
            <LuHand /> Claim for {reward} credits
          </Button>
        }
      >
        Claim it to make it yours. You earn {reward} credits and {reward} XP when {manager} approves your work.
      </NextStep>
    );
  }
  if (!isMine) {
    return (
      <NextStep icon={LuTimer} palette='gray' title={`${worker} claimed this`}>
        It's no longer on the market. Find another one to claim.
      </NextStep>
    );
  }
  if (task.status === "in review") {
    return (
      <NextStep icon={LuHourglass} palette='orange' title='Waiting for review'>
        {posterName ? firstName(posterName) : "Your manager"} is checking your work. You get {reward} credits when it's approved.
      </NextStep>
    );
  }
  const resubmit = Boolean(task.reviewNote);
  return (
    <NextStep
      icon={resubmit ? LuRotateCcw : LuTimer}
      palette={resubmit ? "orange" : "brand"}
      title={resubmit ? "Changes requested" : "You're on it"}
      actions={
        <Button colorPalette={resubmit ? "orange" : "brand"} {...big} onClick={() => flows.submit(task, posterName)}>
          {resubmit ? <LuRotateCcw /> : <LuSend />} {resubmit ? "Resubmit for review" : "Submit for review"}
        </Button>
      }
    >
      {resubmit ? (
        <>
          <Text mb={3}>Fix what the note asks for, then send it back.</Text>
          <NoteQuote palette='orange' icon={LuRotateCcw} label={`${posterName ? firstName(posterName) : "Your manager"} asked for changes`} note={task.reviewNote} color='fg' />
        </>
      ) : (
        `Done? Submit it and ${manager} will review it.`
      )}
    </NextStep>
  );
};

const MarketTaskPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, isLoading: profileLoading } = useMe();
  const { data: task, isLoading } = useMarketTask(id);
  const flows = useTaskFlows({ onDeleted: () => navigate("/market?tab=team", { replace: true }) });
  const posterName = usePersonName(task?.createdBy);
  const assigneeName = usePersonName(task?.assignee);

  if (isLoading || profileLoading) {
    return (
      <Stack gap={5}>
        <Skeleton h='16' w={{ base: "full", md: "lg" }} rounded='l2' />
        <Skeleton h='64' rounded='l3' />
      </Stack>
    );
  }
  if (!task || !profile) {
    return (
      <>
        <PageHeader back='/market' eyebrow='Market task' title='Task not found' />
        <EmptyState icon={LuFileQuestion} title="We couldn't find this task" description="It may have been deleted, or it isn't on your team's market." layerStyle='panel'>
          <Button asChild>
            <Link to='/market'>Back to the market</Link>
          </Button>
        </EmptyState>
      </>
    );
  }
  // Board tasks keep their own edit form.
  if (!isMarketTask(task)) return <Navigate to={`/task/${task._id}`} replace />;

  const tier = getRewardTier(task.reward);

  return (
    <>
      <PageHeader back='/market' eyebrow={`${tier.label} task`} title={task.title} />
      <Grid
        templateColumns={{ base: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 22rem" }}
        templateAreas={{ base: `"hero" "next" "details" "people"`, lg: `"hero next" "details people" "details ."` }}
        templateRows={{ lg: "auto auto 1fr" }}
        gap={{ base: 4, md: 5 }}
        alignItems='start'
      >
        <Box gridArea='hero' position='relative' overflow='hidden' layerStyle='panel' p={{ base: 4, md: 6 }} animation='fade-up'>
          <Box colorPalette={tier.palette} position='absolute' top='-20' right='-16' boxSize='56' rounded='full' bg='colorPalette.solid' opacity={0.14} filter='blur(48px)' aria-hidden />
          <Stack position='relative' gap={5}>
            <Flex justify='space-between' align='flex-start' gap={3} wrap='wrap'>
              <Box>
                <Text textStyle='eyebrow' color='fg.muted' mb={1}>
                  Reward
                </Text>
                <CreditAmount value={task.reward} size='xl' />
                <Text fontSize='sm' color='fg.muted' mt={1}>
                  + {formatNumber(task.reward)} XP when approved
                </Text>
              </Box>
              <Flex gap={1.5} wrap='wrap'>
                <StatusBadge status={task.status} />
                <TaskTypeBadge type={task.type} />
                <RewardTierBadge reward={task.reward} showAmount={false} />
              </Flex>
            </Flex>
            <TaskLifecycle task={task} />
          </Stack>
        </Box>

        <Box gridArea='next' minW={0}>
          <TaskActions task={task} profile={profile} posterName={posterName} assigneeName={assigneeName} flows={flows} />
        </Box>

        <Stack gridArea='details' gap={4} minW={0}>
          {task.submissionNote && task.status !== "open" && (
            <NoteQuote
              label={`${assigneeId(task) === profile._id ? "Your" : `${assigneeName ? firstName(assigneeName) : "Worker"}'s`} ${task.status === "in progress" ? "last note" : "note"}`}
              note={task.submissionNote}
            />
          )}
          <Box layerStyle='panel' p={{ base: 4, md: 6 }} animation='fade-up'>
            <Heading as='h2' fontSize='lg' fontWeight='700' mb={2}>
              Details
            </Heading>
            {task.description ? (
              <Text whiteSpace='pre-wrap' overflowWrap='anywhere'>
                {task.description}
              </Text>
            ) : (
              <Text color='fg.muted'>No description yet.</Text>
            )}
          </Box>
        </Stack>

        <Stack gridArea='people' layerStyle='panel' p={{ base: 4, md: 5 }} gap={4} animation='fade-up'>
          <Person label='Posted by' name={posterName} fallback='Your manager' hint={task.created_at ? moment(task.created_at).format("D MMM YYYY") : undefined} />
          <Person
            label='Claimed by'
            name={assigneeName ?? (assigneeId(task) ? "A teammate" : null)}
            fallback='Nobody yet'
            hint={task.claimedAt ? moment(task.claimedAt).fromNow() : undefined}
          />
        </Stack>
      </Grid>
      {flows.dialogs}
    </>
  );
};

export default MarketTaskPage;
