import { Badge, Box, Card, Flex, HStack, Heading, Icon, Text } from "@chakra-ui/react";
import moment from "moment";
import { LuMessageSquareQuote, LuRotateCcw, LuUserRound } from "react-icons/lu";
import { Link } from "react-router-dom";
import CreditAmount from "./ui/CreditAmount";
import RewardTierBadge from "./ui/RewardTierBadge";
import StatusBadge from "./ui/StatusBadge";
import UserAvatar from "./ui/UserAvatar";
import { taskPath } from "../lib/game";

// Keeps the action buttons clickable above the card-wide title link.
const raised = { position: "relative", zIndex: 1 };

// What happened last, in words: "Claimed 2 hours ago".
const lastEvent = (task) => {
  if (task.status === "done" && task.approvedAt) return `Paid ${moment(task.approvedAt).fromNow()}`;
  if (task.status === "in review" && task.submittedAt) return `Submitted ${moment(task.submittedAt).fromNow()}`;
  if (task.status === "in progress" && task.claimedAt) return `Claimed ${moment(task.claimedAt).fromNow()}`;
  return task.created_at ? `Posted ${moment(task.created_at).fromNow()}` : null;
};

// A quote from the worker or the manager, shown on the card and task page.
export const NoteQuote = ({ label, note, palette = "gray", icon = LuMessageSquareQuote, ...rest }) => (
  <Box colorPalette={palette} bg='colorPalette.subtle' borderStartWidth='3px' borderColor='colorPalette.solid' rounded='l2' px={3} py={2.5} minW={0} {...rest}>
    <HStack gap={1.5} color='colorPalette.fg' mb={0.5}>
      <Icon as={icon} boxSize={3.5} />
      <Text textStyle='eyebrow' fontSize='2xs'>
        {label}
      </Text>
    </HStack>
    <Text fontSize='sm' whiteSpace='pre-wrap' overflowWrap='anywhere' lineClamp={4}>
      {note}
    </Text>
  </Box>
);

// A task someone is working on: status, reward, who has it, the latest note
// and the next action (`children`). Used in My tasks, the review queue and the
// manager's team view. `person` names the assignee for managers.
const QuestCard = ({ task, person, showPerson = false, reviewerName, children }) => {
  const sentBack = task.status === "in progress" && Boolean(task.reviewNote);
  const done = task.status === "done";
  return (
    <Card.Root
      variant='outline'
      position='relative'
      borderColor={sentBack ? "orange.muted" : undefined}
      transition='transform 0.2s ease, box-shadow 0.2s ease'
      _hover={{ transform: "translateY(-2px)", boxShadow: "card-hover" }}
      animation='fade-up'
    >
      <Card.Body gap={3} p={4}>
        <Flex justify='space-between' align='center' gap={2}>
          <Flex wrap='wrap' gap={1.5} minW={0}>
            {!sentBack && <StatusBadge status={task.status} />}
            {sentBack && (
              <Badge colorPalette='orange' variant='solid' size='md'>
                <LuRotateCcw /> Changes requested
              </Badge>
            )}
          </Flex>
          {done ? <CreditAmount value={task.reward} signed size='md' /> : <RewardTierBadge reward={task.reward} showTier={false} />}
        </Flex>

        <Box minW={0}>
          <Heading as='h3' fontSize='md' fontWeight='700' lineHeight='1.3' overflowWrap='anywhere'>
            <Box
              asChild
              _after={{ content: '""', position: "absolute", inset: 0, borderRadius: "l3" }}
              _focusVisible={{ outline: "none", _after: { outline: "2px solid", outlineColor: "brand.focusRing", outlineOffset: "2px" } }}
            >
              <Link to={taskPath(task)}>{task.title}</Link>
            </Box>
          </Heading>
          <HStack gap={2} mt={1.5} minW={0}>
            {showPerson &&
              (person ? (
                <>
                  <UserAvatar name={person} size='2xs' />
                  <Text fontSize='sm' fontWeight='medium' lineClamp={1}>
                    {person}
                  </Text>
                  <Text color='fg.subtle'>·</Text>
                </>
              ) : (
                <>
                  <Icon as={LuUserRound} color='fg.subtle' boxSize={4} />
                  <Text fontSize='sm' color='fg.muted'>
                    Unclaimed
                  </Text>
                  <Text color='fg.subtle'>·</Text>
                </>
              ))}
            <Text fontSize='xs' color='fg.muted' lineClamp={1}>
              {lastEvent(task)}
            </Text>
          </HStack>
        </Box>

        {sentBack && <NoteQuote palette='orange' icon={LuRotateCcw} label={`${reviewerName ?? "Manager"} asked for changes`} note={task.reviewNote} />}
        {task.status === "in review" && task.submissionNote && <NoteQuote label={showPerson ? `${person ?? "Worker"}'s note` : "Your note"} note={task.submissionNote} />}

        {children && (
          <Flex gap={2} pt={1} direction={{ base: "column-reverse", sm: "row" }} justify='flex-end' css={{ "& > *": { flex: { base: "1", sm: "initial" } } }} {...raised}>
            {children}
          </Flex>
        )}
      </Card.Body>
    </Card.Root>
  );
};

export default QuestCard;
