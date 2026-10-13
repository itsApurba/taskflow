import {
  Button,
  ButtonGroup,
  Dialog,
  Flex,
  Grid,
  Heading,
  IconButton,
  NativeSelect,
  Portal,
  Separator,
  SimpleGrid,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { LuSquarePen, LuTrash2 } from "react-icons/lu";
import React from "react";
import api from "../api/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const TaskCard = ({ task, refetch }) => {
  const navigate = useNavigate();
  const { open, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef(null);

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/tasks/${task._id}`),
    onSuccess: () => {
      refetch();
      onClose();
    },
  });

  const handleTypeChange = async (e) => {
    await api.post(`/tasks/type/${task._id}`, {
      type: e.target.value,
    });
    refetch();
    console.log(e.target.value);
  };
  const handleStatusChange = async (e) => {
    await api.post(`/tasks/status/${task._id}`, {
      status: e.target.value,
    });
    refetch();
    console.log(e.target.value);
  };

  const handleDelete = async () => {
    deleteMutation.mutate();
    console.log(task);
  };

  const getAssignee = useQuery({
    queryKey: ["assignee-data", task._id],
    queryFn: () => api.get(`/users/${task.assignee}`),
  });

  console.log(task);
  const handleEdit = () => {
    navigate(`/task/${task._id}`, {
      state: {
        task,
      },
    });
    // console.log(task);
  };
  return (
    <SimpleGrid my={4}>
      {/* Phones: info and edit/delete share the top row, the selects get a full-width row below.
          md and up: everything sits on one row, as before. */}
      <Grid
        w={"full"}
        templateColumns={{ base: "minmax(0, 1fr) auto", md: "minmax(0, 1fr) auto auto" }}
        templateAreas={{ base: `"info actions" "selects selects"`, md: `"info selects actions"` }}
        columnGap={2}
        rowGap={3}
        alignItems={"center"}
      >
        <VStack gridArea={"info"} align={"flex-start"} minW={0}>
          <Flex wrap={"wrap"} align={"center"} gap={2}>
            <Heading as={"h3"} size={"xl"} overflowWrap={"anywhere"}>
              {task.title}
            </Heading>
            <Text textTransform={"capitalize"} fontSize={"sm"} borderWidth={"1px"} px={2} rounded={"full"} whiteSpace={"nowrap"}>
              {task.status}
            </Text>
            {task.type && (
              <Text textTransform={"capitalize"} fontSize={"sm"} borderWidth={"1px"} px={2} rounded={"full"} whiteSpace={"nowrap"}>
                {task.type}
              </Text>
            )}
          </Flex>
          <Text overflowWrap={"anywhere"}>{task.description}</Text>
          {getAssignee?.data && <Text>Assignee: {getAssignee?.data?.data.name}</Text>}
        </VStack>
        <Grid gridArea={"selects"} templateColumns={{ base: "1fr 1fr", md: "auto auto" }} gap={2}>
          <NativeSelect.Root w={{ md: "28" }}>
            <NativeSelect.Field name='status' aria-label='Status' onChange={handleStatusChange}>
              <option value=''>status</option>
              <option value='not started'>Not Started</option>
              <option value='in progress'>In Progress</option>
              <option value='completed'>Completed</option>
              <option value='closed'>Closed</option>{" "}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
          <NativeSelect.Root w={{ md: "28" }}>
            <NativeSelect.Field name='type' aria-label='Type' onChange={handleTypeChange}>
              <option value=''>Type</option>
              <option value='bug'>Bug</option>
              <option value='feature'>Feature</option>
              <option value='story'>Story</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Grid>

        <ButtonGroup gridArea={"actions"} alignSelf={{ base: "start", md: "center" }} justifyContent={"center"} py={{ md: 4 }}>
          <IconButton aria-label='Edit task' onClick={handleEdit} color={"blue.500"}>
            <LuSquarePen />
          </IconButton>
          <IconButton aria-label='Delete task' onClick={onOpen} color={"red.500"}>
            <LuTrash2 />
          </IconButton>
        </ButtonGroup>
      </Grid>
      <Separator py={2} />

      <Dialog.Root role='alertdialog' open={open} onOpenChange={(e) => !e.open && onClose()} initialFocusEl={() => cancelRef.current}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title fontSize='lg' fontWeight='bold'>
                  Delete Task
                </Dialog.Title>
              </Dialog.Header>

              <Dialog.Body>Are you sure? You can't undo this action afterwards.</Dialog.Body>

              <Dialog.Footer>
                <Button ref={cancelRef} onClick={onClose}>
                  Cancel
                </Button>
                <Button loading={deleteMutation.isPending} variant='solid' colorPalette='red' onClick={handleDelete}>
                  Delete
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </SimpleGrid>
  );
};

export default TaskCard;

// {
//     "_id": "6471ad21bd4658827e2a7097",
//     "title": "neadfa",
//     "type": "feature",
//     "description": "asdf",
//     "status": "completed",
//     "created_at": "2023-05-27T07:11:29.603Z",
//     "updated_at": "2023-05-27T07:11:29.605Z",
//     "__v": 0
// }
