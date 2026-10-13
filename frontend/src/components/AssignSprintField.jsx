import { Box, Field as ChakraField, Flex, Icon, IconButton, Input, InputGroup, Stack, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useFormikContext } from "formik";
import { useEffect, useRef, useState } from "react";
import { LuPlus, LuSearch, LuX } from "react-icons/lu";
import api from "../api/api";
import useOutsideClick from "../hooks/useOutsideClick";
import useTasks from "../hooks/useTasks";
import { getTaskStatus } from "../lib/game";
import { SearchMenu, SearchMenuItem } from "./SearchMenu";

// Sprint task picker: search tasks and add them; picked tasks show as a list
// with remove buttons. The dropdown stays open so several tasks can be added in a row.
const AssignSprintField = () => {
  const ref = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useOutsideClick({
    ref: ref,
    handler: () => setIsModalOpen(false),
  });
  const { values, setFieldValue } = useFormikContext();
  const [taskInput, setTaskInput] = useState("");
  const [debounced, setDebounced] = useState("");
  const { data: allTasks = [] } = useTasks();
  const [picked, setPicked] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(taskInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [taskInput]);

  const { data } = useQuery({
    queryKey: ["tasks-search", debounced],
    queryFn: () => api.get(`/tasks/search?name=${encodeURIComponent(debounced)}`),
    enabled: debounced.length > 0,
  });

  const byId = (id) => picked[id] ?? allTasks.find((task) => task._id === id);
  const results = (data?.data ?? []).filter((task) => !values.tasks.includes(task._id));

  const handleClick = (task) => {
    setPicked((prev) => ({ ...prev, [task._id]: task }));
    setFieldValue("tasks", [...values.tasks, task._id]);
  };
  const remove = (id) =>
    setFieldValue(
      "tasks",
      values.tasks.filter((taskId) => taskId !== id),
    );

  return (
    <ChakraField.Root>
      <ChakraField.Label>
        Tasks
        <Text as='span' color='fg.muted' fontWeight='normal'>
          ({values.tasks.length})
        </Text>
      </ChakraField.Label>
      <Box position='relative' zIndex={1} w={"full"} ref={ref}>
        <InputGroup startElement={<LuSearch />}>
          <Input
            value={taskInput}
            name='task-search'
            placeholder='Search tasks to add'
            autoComplete='off'
            onChange={(e) => {
              setTaskInput(e.target.value);
              setIsModalOpen(true);
            }}
            onFocus={() => setIsModalOpen(true)}
            onKeyDown={(e) => e.key === "Escape" && setIsModalOpen(false)}
          />
        </InputGroup>
        {isModalOpen && taskInput.trim().length > 0 && results.length > 0 && (
          <SearchMenu>
            {results.map((task) => {
              const status = getTaskStatus(task.status);
              return (
                <SearchMenuItem key={task._id} onClick={() => handleClick(task)}>
                  <Icon as={status.icon} color={`${status.palette}.fg`} flexShrink={0} />
                  <Text flex='1' fontWeight='medium' lineClamp={1}>
                    {task.title}
                  </Text>
                  <Icon as={LuPlus} color='brand.fg' flexShrink={0} />
                </SearchMenuItem>
              );
            })}
          </SearchMenu>
        )}
      </Box>
      {values.tasks.length > 0 && (
        <Stack gap={1.5} w='full' mt={1}>
          {values.tasks.map((id) => {
            const task = byId(id);
            const status = getTaskStatus(task?.status);
            return (
              <Flex
                key={id}
                align='center'
                gap={2.5}
                bg='bg.subtle'
                borderWidth='1px'
                borderColor='border'
                rounded='l2'
                ps={3}
                pe={1}
                minH={{ base: 11, md: 10 }}
              >
                <Icon as={status.icon} color={`${status.palette}.fg`} flexShrink={0} />
                <Text flex='1' fontSize='sm' fontWeight='medium' lineClamp={1}>
                  {task?.title ?? "Task"}
                </Text>
                <IconButton
                  aria-label={`Remove ${task?.title ?? "task"} from sprint`}
                  variant='ghost'
                  colorPalette='gray'
                  size='sm'
                  rounded='l1'
                  onClick={() => remove(id)}
                >
                  <LuX />
                </IconButton>
              </Flex>
            );
          })}
        </Stack>
      )}
    </ChakraField.Root>
  );
};

export default AssignSprintField;
