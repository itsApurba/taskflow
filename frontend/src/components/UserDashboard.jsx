import { Box, Button, ButtonGroup, Grid, HStack, Heading, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import LoginForm from "../pages/LoginForm";
import CreateSprint from "./CreateSprint";
import TaskList from "./TaskList";
import SignupForm from "../pages/SignupForm";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import SprintList from "./SprintList";

const UserDashboard = () => {
  const { userName, isTaskView, setIsTaskView } = useAuth();
  const navigate = useNavigate();
  return (
    <Box p={4} maxW={"container.lg"} m={"auto"}>
      <Grid columns={3}>
        {/* Display user info */}
        <Box rounded={"lg"} bg={useColorModeValue("gray.100", "gray.900")} boxShadow={"lg"} p={8}>
          <HStack>
            <VStack align={"flex-start"}>
              <Heading>{userName}</Heading>
              {/* <Text>{userEmail}</Text> */}
            </VStack>
            {/* Total tasks completed */}
          </HStack>
        </Box>
        <ButtonGroup justifyContent={"center"} py={4}>
          {isTaskView ? (
            <Button
              onClick={() => {
                setIsTaskView(false);
              }}
            >
              Show Sprints
            </Button>
          ) : (
            <Button
              onClick={() => {
                setIsTaskView(true);
              }}
            >
              Show Tasks
            </Button>
          )}
        </ButtonGroup>
        {isTaskView ? <TaskList /> : <SprintList />}
      </Grid>
    </Box>
  );
};

export default UserDashboard;
