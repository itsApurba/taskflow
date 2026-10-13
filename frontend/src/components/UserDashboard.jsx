import { Box, Button, ButtonGroup, Grid, HStack, Heading, VStack } from "@chakra-ui/react";
import TaskList from "./TaskList";
import useAuth from "../hooks/useAuth";
import { useColorModeValue } from "../hooks/useColorMode";
import SprintList from "./SprintList";

const UserDashboard = () => {
  const { userName, isTaskView, setIsTaskView } = useAuth();
  return (
    <Box p={{ base: 3, md: 4 }} maxW={"5xl"} m={"auto"}>
      <Grid columns={3}>
        {/* Display user info */}
        <Box rounded={"lg"} bg={useColorModeValue("gray.100", "gray.900")} boxShadow={"lg"} p={{ base: 5, md: 8 }}>
          <HStack>
            <VStack align={"flex-start"} minW={0}>
              <Heading size={{ base: "2xl", md: "4xl" }} overflowWrap={"anywhere"}>
                {userName}
              </Heading>
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
