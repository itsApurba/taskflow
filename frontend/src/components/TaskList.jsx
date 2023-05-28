import { Box, Divider, Flex, Spinner, useColorModeValue } from "@chakra-ui/react";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/api";
import TaskCard from "./TaskCard";

const TaskList = () => {
  const { isLoading, data, refetch } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await api.get("/tasks");
      return res.data.reverse();
    },
  });
  return (
    <Box rounded={"lg"} bg={useColorModeValue("gray.100", "gray.900")} boxShadow={"lg"} p={8}>
      <Divider />
      {isLoading ? (
        <Flex w={'full'}>
          <Spinner />
        </Flex>
      ) : (
        data?.map((task) => {
          return <TaskCard key={task._id} task={task} refetch={refetch} />;
        })
      )}
    </Box>
  );
};

export default TaskList;
