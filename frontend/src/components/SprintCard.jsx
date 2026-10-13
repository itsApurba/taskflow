import { LuCalendar, LuListTodo, LuTrash2 } from "react-icons/lu";
import { Badge, Box, Card, Flex, HStack, Heading, IconButton, Progress, Text, useDisclosure } from "@chakra-ui/react";
import { toaster } from "./ui/toaster";
import api from "../api/api";
import { useState } from "react";
import { Link } from "react-router-dom";
import ConfirmDialog from "./ui/ConfirmDialog";
import { formatSprintDates, sprintPhase } from "../lib/sprints";

const SprintCard = ({ sprint, refetch }) => {
  const [loading, setLoading] = useState(false);
  const confirm = useDisclosure();
  const phase = sprintPhase(sprint);
  const percent = Math.round(phase.progress * 100);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/sprints/${sprint._id}`);
      toaster.create({
        title: "Sprint deleted",
        type: "success",
        closable: true,
      });
      confirm.onClose();
      refetch();
      setLoading(false);
    } catch (error) {
      toaster.create({
        title: "Error",
        description: error.message,
        type: "error",
        closable: true,
      });
      setLoading(false);
    }
  };

  return (
    <Card.Root
      variant='outline'
      position='relative'
      transition='transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease'
      _hover={{ transform: "translateY(-2px)", boxShadow: "card-hover", borderColor: "brand.muted" }}
      animation='fade-up'
    >
      <Card.Body gap={4}>
        <Flex justify='space-between' align='center' gap={2}>
          <Badge colorPalette={phase.palette} variant='subtle' size='md'>
            <Box boxSize={1.5} rounded='full' bg='colorPalette.solid' />
            {phase.label}
          </Badge>
          <IconButton
            aria-label={`Delete sprint ${sprint.name}`}
            variant='ghost'
            colorPalette='gray'
            size='sm'
            rounded='full'
            minW={{ base: 11, md: 9 }}
            h={{ base: 11, md: 9 }}
            me={-2}
            color='fg.muted'
            _hover={{ color: "fg.error", bg: "bg.error" }}
            position='relative'
            zIndex={1}
            onClick={confirm.onOpen}
          >
            <LuTrash2 />
          </IconButton>
        </Flex>
        <Box minW={0}>
          <Heading as='h3' fontSize='lg' fontWeight='700' lineHeight='1.3' overflowWrap='anywhere'>
            <Box
              asChild
              _after={{ content: '""', position: "absolute", inset: 0, borderRadius: "l3" }}
              _focusVisible={{ outline: "none", _after: { outline: "2px solid", outlineColor: "brand.focusRing", outlineOffset: "2px" } }}
            >
              <Link to={`/sprint/${sprint._id}`} state={{ sprint }}>
                {sprint.name}
              </Link>
            </Box>
          </Heading>
          <HStack gap={1.5} color='fg.muted' fontSize='sm' mt={1}>
            <LuCalendar />
            <Text>{formatSprintDates(sprint) || "No dates"}</Text>
          </HStack>
        </Box>
        <Box>
          <Flex justify='space-between' fontSize='xs' fontWeight='semibold' color='fg.muted' mb={1.5}>
            <Text>{phase.note}</Text>
            <Text fontVariantNumeric='tabular-nums'>{percent}%</Text>
          </Flex>
          <Progress.Root value={percent} size='sm' colorPalette={phase.palette} aria-label={`${sprint.name} time elapsed`}>
            <Progress.Track bg='bg.muted'>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
        </Box>
        <HStack gap={1.5} fontSize='sm' fontWeight='semibold' color='fg.muted'>
          <LuListTodo />
          <Text>
            {sprint.tasks.length} {sprint.tasks.length === 1 ? "task" : "tasks"}
          </Text>
        </HStack>
      </Card.Body>
      <ConfirmDialog
        open={confirm.open}
        onClose={confirm.onClose}
        onConfirm={handleDelete}
        loading={loading}
        title='Delete this sprint?'
        description={`"${sprint.name}" will be removed. Its tasks stay on the board.`}
        confirmLabel='Delete sprint'
        icon={LuTrash2}
      />
    </Card.Root>
  );
};

export default SprintCard;
