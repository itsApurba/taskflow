import { Badge, Box, Button, Flex, HStack, Progress, Skeleton, Stack, Text } from "@chakra-ui/react";
import { LuCalendarRange, LuPlus, LuTrophy } from "react-icons/lu";
import { Link } from "react-router-dom";
import { useLeaderboard } from "../../hooks/useGameQueries";
import { formatSprintDates, sortSprints, sprintPhase } from "../../lib/sprints";
import CreditAmount from "../ui/CreditAmount";
import EmptyState from "../ui/EmptyState";
import RankBadge from "../ui/RankBadge";
import SectionHeader from "../ui/SectionHeader";
import TaskRow from "../TaskRow";
import UserAvatar from "../ui/UserAvatar";

// Side and main panels shared by the worker and manager home screens.

export const Lane = ({ title, tasks, to }) =>
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

export const SprintsPanel = ({ sprints, isLoading }) => {
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

const RankRow = ({ entry, isMe }) => (
  <Flex align='center' gap={2.5} px={2} py={1.5} minH={11} rounded='l2' bg={isMe ? "brand.subtle" : undefined}>
    <RankBadge rank={entry.rank} size='sm' />
    <UserAvatar name={entry.user?.name} size='xs' />
    <Text flex='1' minW={0} fontSize='sm' fontWeight={isMe ? "bold" : "medium"} lineClamp={1}>
      {isMe ? "You" : entry.user?.name}
    </Text>
    <CreditAmount value={entry.points} size='sm' flexShrink={0} />
  </Flex>
);

// This week's top three, plus your own row when you're further down.
export const MiniLeaderboard = ({ userId }) => {
  const { data, isLoading, isError } = useLeaderboard("week");
  const entries = data?.entries ?? [];
  const top = entries.slice(0, 3);
  const me = entries.find((entry) => entry.user?._id === userId);
  const showMe = me && me.rank > 3;
  return (
    <Box layerStyle='panel' p={{ base: 4, md: 5 }}>
      <SectionHeader title='This week' as='h3' to='/leaderboard' linkLabel='Ranks' />
      {isLoading ? (
        <Skeleton h='28' rounded='l2' />
      ) : isError || entries.length === 0 ? (
        <EmptyState size='sm' icon={LuTrophy} palette='orange' title='No rankings yet' description='Your team ranks here by credits earned.' py={3} />
      ) : !entries.some((entry) => entry.points > 0) ? (
        <HStack gap={3} bg='bg.subtle' rounded='l2' p={3}>
          <LuTrophy />
          <Text fontSize='sm' color='fg.muted'>
            No approvals yet this week. The podium is wide open.
          </Text>
        </HStack>
      ) : (
        <Stack gap={0.5}>
          {top.map((entry) => (
            <RankRow key={entry.user?._id ?? entry.rank} entry={entry} isMe={entry.user?._id === userId} />
          ))}
          {showMe && (
            <>
              <Text textAlign='center' color='fg.subtle' lineHeight='1' aria-hidden>
                ⋯
              </Text>
              <RankRow entry={me} isMe />
            </>
          )}
        </Stack>
      )}
    </Box>
  );
};
