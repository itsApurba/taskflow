import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  ButtonGroup,
  Divider,
  HStack,
  Heading,
  IconButton,
  Select,
  SimpleGrid,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import React from "react";
import api from "../api/api";
import { useMutation } from "@tanstack/react-query";

const TaskCard = ({ task, refetch }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

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

  const handleEdit = () => {
    console.log(task);
  };
  return (
    <SimpleGrid my={4}>
      <HStack w={"full"} justify={"space-between"}>
        <VStack align={"flex-start"}>
          <HStack>
            <Heading as={"h3"} size={"md"}>
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
        </VStack>
        <HStack>
          <Select name='status' onChange={handleStatusChange}>
            <option value=''>status</option>
            <option value='not started'>Not Started</option>
            <option value='in progress'>In Progress</option>
            <option value='completed'>Completed</option>
            <option value='closed'>Closed</option>{" "}
          </Select>
          <Select name='type' onChange={handleTypeChange}>
            <option value=''>Type</option>
            <option value='bug'>Bug</option>
            <option value='feature'>Feature</option>
            <option value='story'>Story</option>
          </Select>

          <ButtonGroup justifyContent={"center"} py={4}>
            <IconButton onClick={handleEdit} icon={<EditIcon color={"blue.500"} />} />
            <IconButton onClick={onOpen} icon={<DeleteIcon color={"red.500"} />} />
          </ButtonGroup>
        </HStack>
      </HStack>
      <Divider py={2} />

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Delete Task
            </AlertDialogHeader>

            <AlertDialogBody>Are you sure? You can't undo this action afterwards.</AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button isLoading={deleteMutation.isLoading} colorScheme='red' onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
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
