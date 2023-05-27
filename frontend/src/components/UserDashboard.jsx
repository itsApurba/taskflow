import { Box, Button, ButtonGroup, Grid, HStack, Heading, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import React from "react";
import CreateTask from "./CreateTask";
import LoginForm from "./LoginForm";
import CreateSprint from "./CreateSprint";
import TaskList from "./TaskList";

const UserDashboard = () => {
  return (
    <Box p={4}>
      <Grid columns={3}>
        {/* Display user info */}
        <Box rounded={"lg"} bg={useColorModeValue("gray.100", "gray.900")} boxShadow={"lg"} p={8}>
          <HStack>
            <VStack align={"flex-start"}>
              <Heading>User Name</Heading>
              <Text>User Email</Text>
            </VStack>
            {/* Total tasks completed */}
          </HStack>
        </Box>
        <ButtonGroup justifyContent={"center"} py={4}>
          <Button>Create Task</Button>
          <Button>Create Sprint</Button>
        </ButtonGroup>

        <TaskList />

        {/* <CreateSprint /> */}
        <CreateTask />
        {/* <LoginForm/>  */}
        {/* Display tasks and sprints */}
        {/* <Box rounded={"lg"} bg={useColorModeValue("gray.100", "gray.900")} boxShadow={"lg"} p={8}>
          
        </Box> */}
      </Grid>
    </Box>
  );
};

export default UserDashboard;
