import { Box, Card, Flex, Grid, HStack, Heading, IconButton, Menu, NativeSelect, Portal, Text, useDisclosure } from "@chakra-ui/react";
import { LuEllipsisVertical, LuSquarePen, LuTrash2, LuUserRound } from "react-icons/lu";
import moment from "moment";
import api from "../api/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import ConfirmDialog from "./ui/ConfirmDialog";
import RewardTierBadge from "./ui/RewardTierBadge";
import StatusBadge from "./ui/StatusBadge";
import TaskTypeBadge from "./ui/TaskTypeBadge";
import UserAvatar from "./ui/UserAvatar";
import { toaster } from "./ui/toaster";
import { BOARD_STATUSES, TASK_TYPES, assigneeId, getTaskStatus, isMarketTask, taskPath } from "../lib/game";

// Keeps the selects and menu clickable above the card-wide title link.
const raised = { position: "relative", zIndex: 1 };

// The footer lays out by the card's own width (container queries), so it
// stacks in narrow cards whether that is a phone or a two-column desktop grid.
const wide = "@container (min-width: 34rem)";

const TaskCard = ({ task, refetch }) => {
  const navigate = useNavigate();
  const { open, onOpen, onClose } = useDisclosure();

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/tasks/${task._id}`),
    onSuccess: async () => {
      await refetch();
      onClose();
      toaster.create({ title: "Task deleted", type: "success" });
    },
    onError: () => toaster.create({ title: "Couldn't delete the task", type: "error" }),
  });

  // The selects show the value being saved until the board refetches.
  const statusMutation = useMutation({
    mutationFn: (status) => api.post(`/tasks/status/${task._id}`, { status }),
    onSuccess: () => refetch(),
    onError: () => toaster.create({ title: "Couldn't change the status", type: "error" }),
  });
  const typeMutation = useMutation({
    mutationFn: (type) => api.post(`/tasks/type/${task._id}`, { type }),
    onSuccess: () => refetch(),
    onError: () => toaster.create({ title: "Couldn't change the type", type: "error" }),
  });
  const status = statusMutation.isPending ? statusMutation.variables : task.status;
  const type = typeMutation.isPending ? typeMutation.variables : task.type;

  const userId = assigneeId(task);
  const populatedName = typeof task.assignee === "object" ? task.assignee?.name : undefined;
  const getAssignee = useQuery({
    queryKey: ["user", userId],
    queryFn: () => api.get(`/users/${userId}`),
    enabled: Boolean(userId) && !populatedName,
  });
  const assigneeName = populatedName ?? getAssignee.data?.data.name;

  // Market tasks (posted with a reward) move through claim/submit/approve, so
  // the board's pickers, edit form and delete do not apply to them.
  const isMarket = isMarketTask(task);
  const editState = { task };
  const handleEdit = () => navigate(`/task/${task._id}`, { state: editState });

  return (
    <Card.Root
      variant='outline'
      position='relative'
      css={{ containerType: "inline-size" }}
      transition='transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
      _hover={{ boxShadow: "card-hover", borderColor: "brand.muted" }}
      animation='fade-up'
    >
      <Card.Body gap={3}>
        <Flex justify='space-between' align='flex-start' gap={2}>
          <Flex wrap='wrap' gap={1.5} minW={0}>
            <StatusBadge status={status} />
            <TaskTypeBadge type={type} />
            {task.reward != null && <RewardTierBadge reward={task.reward} />}
          </Flex>
          {!isMarket && (
            <Menu.Root positioning={{ placement: "bottom-end" }}>
              <Menu.Trigger asChild>
                <IconButton
                  aria-label={`Actions for ${task.title}`}
                  variant='ghost'
                  colorPalette='gray'
                  size='sm'
                  rounded='full'
                  mt={-1}
                  me={-2}
                  minW={{ base: 11, md: 9 }}
                  h={{ base: 11, md: 9 }}
                  {...raised}
                >
                  <LuEllipsisVertical />
                </IconButton>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content>
                    <Menu.Item value='edit' onClick={handleEdit}>
                      <LuSquarePen /> Edit task
                    </Menu.Item>
                    <Menu.Item value='delete' color='fg.error' _highlighted={{ bg: "bg.error" }} onClick={onOpen}>
                      <LuTrash2 /> Delete task
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          )}
        </Flex>

        <Box minW={0}>
          <Heading as='h3' fontSize='lg' fontWeight='700' lineHeight='1.3' overflowWrap='anywhere'>
            <Box
              asChild
              // Stretched link: the whole card opens the task.
              _after={{ content: '""', position: "absolute", inset: 0, borderRadius: "l3" }}
              _focusVisible={{ outline: "none", _after: { outline: "2px solid", outlineColor: "brand.focusRing", outlineOffset: "2px" } }}
            >
              <Link to={taskPath(task)} state={editState}>
                {task.title}
              </Link>
            </Box>
          </Heading>
          {task.description && (
            <Text color='fg.muted' fontSize='sm' mt={1} lineClamp={2} overflowWrap='anywhere'>
              {task.description}
            </Text>
          )}
        </Box>

        <Flex
          justify='space-between'
          gap={3}
          pt={3}
          borderTopWidth='1px'
          borderColor='border'
          css={{ flexDirection: "column", alignItems: "stretch", [wide]: { flexDirection: "row", alignItems: "center" } }}
        >
          <HStack gap={2} minW={0}>
            {userId ? (
              <UserAvatar name={assigneeName ?? ""} size='xs' />
            ) : (
              <Flex
                boxSize={6}
                rounded='full'
                borderWidth='1.5px'
                borderStyle='dashed'
                borderColor='border.emphasized'
                align='center'
                justify='center'
                color='fg.subtle'
                flexShrink={0}
              >
                <LuUserRound size={12} />
              </Flex>
            )}
            <Text fontSize='sm' fontWeight='medium' lineClamp={1} color={userId ? "fg" : "fg.muted"}>
              {userId ? (assigneeName ?? "Assigned") : "Unassigned"}
            </Text>
            {task.updated_at && (
              <Text fontSize='xs' color='fg.subtle' whiteSpace='nowrap' css={{ display: "none", "@container (min-width: 40rem)": { display: "block" } }}>
                · {moment(task.updated_at).fromNow()}
              </Text>
            )}
          </HStack>
          {!isMarket && (
            <Grid templateColumns='repeat(2, minmax(0, 1fr))' gap={2} flexShrink={0} css={{ width: "100%", [wide]: { width: "auto" } }} {...raised}>
              <NativeSelect.Root css={{ [wide]: { width: "9rem" } }}>
                <NativeSelect.Field name='status' aria-label={`Status of ${task.title}`} value={status} onChange={(e) => statusMutation.mutate(e.target.value)}>
                  {!BOARD_STATUSES.includes(status) && (
                    <option value={status} disabled>
                      {getTaskStatus(status).label}
                    </option>
                  )}
                  {BOARD_STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {getTaskStatus(value).label}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
              <NativeSelect.Root css={{ [wide]: { width: "8rem" } }}>
                <NativeSelect.Field name='type' aria-label={`Type of ${task.title}`} value={type ?? ""} onChange={(e) => typeMutation.mutate(e.target.value)}>
                  {!type && (
                    <option value='' disabled>
                      Set type
                    </option>
                  )}
                  {Object.entries(TASK_TYPES).map(([value, meta]) => (
                    <option key={value} value={value}>
                      {meta.label}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Grid>
          )}
        </Flex>
      </Card.Body>

      <ConfirmDialog
        open={open}
        onClose={onClose}
        onConfirm={() => deleteMutation.mutate()}
        loading={deleteMutation.isPending}
        title='Delete this task?'
        description={`"${task.title}" will be removed for everyone. You can't undo this.`}
        confirmLabel='Delete task'
        icon={LuTrash2}
      />
    </Card.Root>
  );
};

export default TaskCard;
