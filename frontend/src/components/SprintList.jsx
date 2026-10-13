import { Box, Flex, Separator, SimpleGrid, Spinner } from "@chakra-ui/react";
import { useColorModeValue } from "../hooks/useColorMode";
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
    <Box rounded={"lg"} bg={useColorModeValue("gray.100", "gray.900")} boxShadow={"lg"} p={{ base: 4, md: 8 }} mb={8}>
      <Separator />
      <SimpleGrid mt={4} columns={{ base: 1, sm: 2, lg: 3 }} rowGap={8} columnGap={4}>
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
