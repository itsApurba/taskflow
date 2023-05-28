import { Box, Divider, Flex, SimpleGrid, Spinner, useColorModeValue } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/api";
import SprintCard from "./SprintCard";

const SprintList = () => {
  const { isLoading, data, refetch } = useQuery({
    queryKey: ["sprints"],
    queryFn: async () => {
      const res = await api.get("/sprints");
      return res.data;
    },
  });
  return (
    <Box rounded={"lg"} bg={useColorModeValue("gray.100", "gray.900")} boxShadow={"lg"} p={8} mb={8}>
      <Divider />
      <SimpleGrid mt={4} columns={[1,2,3,3]} rowGap={8} columnGap={4}>
        {isLoading ? (
          <Flex w={"full"}>
            <Spinner />
          </Flex>
        ) : (
          data?.map((sprint) => {
            return <SprintCard key={sprint._id} sprint={sprint} refetch={refetch} />;
          })
        )}
      </SimpleGrid>
    </Box>
  );
};

export default SprintList;
