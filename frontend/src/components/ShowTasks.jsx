import { Box, Button, ButtonGroup, Heading, Text, VStack } from "@chakra-ui/react";
import { useColorModeValue } from "../hooks/useColorMode";
import api from "../api/api";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
const ShowTasks = ({ task }) => {
  const { data } = useQuery({
    queryKey: ["tasks", task],
    queryFn: async () => {
      const res = await api.get(`/tasks/${task}`);
      return res.data;
    },
  });
  const navigate = useNavigate();
  console.log(data);
  return (
    <Box my={4} rounded={"lg"} bg={useColorModeValue("gray.100", "gray.900")} boxShadow={"lg"} p={{ base: 5, md: 8 }}>
      <VStack>
        <Heading size={{ base: "2xl", md: "4xl" }} overflowWrap={"anywhere"}>Name: {data?.title}</Heading>
        <Text overflowWrap={"anywhere"}>Description: {data?.description}</Text>
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
