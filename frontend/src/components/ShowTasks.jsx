import { Box, Button, ButtonGroup, Heading, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import api from "../api/api";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
const ShowTasks = ({ task }) => {
  const { data, refetch } = useQuery({
    queryKey: ["tasks", task],
    queryFn: async () => {
      const res = await api.get(`/tasks/${task}`);
      return res.data;
    },
  });
  const navigate = useNavigate();
  console.log(data);
  return (
    <Box my={4} rounded={"lg"} bg={useColorModeValue("gray.100", "gray.900")} boxShadow={"lg"} p={8}>
      <VStack>
        <Heading>Name: {data?.title}</Heading>
        <Text>Description: {data?.description}</Text>
        <Text>Type: {data?.type}</Text>
        <Text>Status: {data?.status}</Text>
        <ButtonGroup>
            <Button onClick={() => navigate(`/task/${task}`)}>Edit</Button>
        </ButtonGroup>
      </VStack>
    </Box>
  );
};

export default ShowTasks;
