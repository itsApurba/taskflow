import {
  Button,
  ButtonGroup,
  Dialog,
  HStack,
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
      <HStack w={"full"} justify={"space-between"}>
        <VStack align={"flex-start"}>
          <HStack>
            <Heading as={"h3"} size={"xl"}>
              {task.title}
            </Heading>
            <Text textTransform={"capitalize"} fontSize={"sm"} borderWidth={"1px"} px={2} rounded={"full"}>
              {task.status}
            </Text>
            {task.type && (
              <Text textTransform={"capitalize"} fontSize={"sm"} borderWidth={"1px"} px={2} rounded={"full"}>
                {task.type}
              </Text>
            )}
          </HStack>
          <Text>{task.description}</Text>
          {getAssignee?.data && <Text>Assignee: {getAssignee?.data?.data.name}</Text>}
        </VStack>
        <HStack>
          <NativeSelect.Root>
            <NativeSelect.Field name='status' onChange={handleStatusChange}>
              <option value=''>status</option>
              <option value='not started'>Not Started</option>
              <option value='in progress'>In Progress</option>
              <option value='completed'>Completed</option>
              <option value='closed'>Closed</option>{" "}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
          <NativeSelect.Root>
            <NativeSelect.Field name='type' onChange={handleTypeChange}>
              <option value=''>Type</option>
              <option value='bug'>Bug</option>
              <option value='feature'>Feature</option>
              <option value='story'>Story</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>

          <ButtonGroup justifyContent={"center"} py={4}>
            <IconButton onClick={handleEdit} color={"blue.500"}>
              <LuSquarePen />
            </IconButton>
            <IconButton onClick={onOpen} color={"red.500"}>
              <LuTrash2 />
            </IconButton>
          </ButtonGroup>
        </HStack>
      </HStack>
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
