import { LuTrash2 } from "react-icons/lu";
import { HStack, Heading, IconButton, Text, VStack } from "@chakra-ui/react";
import { toaster } from "./ui/toaster";
import moment from "moment";
import api from "../api/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SprintCard = ({ sprint, refetch }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/sprints/${sprint._id}`);
      toaster.create({
        title: "Sprint deleted",
        type: "success",
        closable: true,
      });
      refetch();
      setLoading(false);
    } catch (error) {
      toaster.create({
        title: "Error",
        description: error.message,
        type: "error",
        closable: true,
      });
      setLoading(false);
    }
  };

  return (
    <VStack
      align={"flex-start"}
      shadow={"lg"}
      p={2}
      transitionDuration='0.3s'
      _hover={{
        transform: "translateY(-2px)",
        cursor: "pointer",
      }}
    >
      <HStack w={"full"} align={"center"} justify={"space-evenly"}>
        <div
          onClick={() =>
            navigate(`/sprint/${sprint._id}`, {
              state: {
                sprint,
              },
            })
          }
        >
          <VStack align={"flex-start"}>
            <Heading size={"3xl"} fontWeight={"normal"}>
              {sprint.name}
            </Heading>
            <VStack align={"flex-start"} lineHeight={"0.8"}>
              <Text fontSize={"sm"}>StartDate: {moment(sprint.startDate).format("MMM Do YY")}</Text>
              <Text fontSize={"sm"}>EndDate: {moment(sprint.endDate).format("MMM Do YY")} </Text>
            </VStack>
            <Text fontSize={"medium"} textTransform={"capitalize"}>
              {moment(sprint.endDate).fromNow()}{" "}
            </Text>
            {sprint.tasks.length > 0 && (
              <Text fontSize={"medium"} textTransform={"capitalize"}>
                Tasks: {sprint.tasks.length}
              </Text>
            )}
          </VStack>
        </div>
        <IconButton zIndex={1000} shadow={"lg"} aria-label='delete' loading={loading} onClick={handleDelete} color={"red.500"}>
          <LuTrash2 />
        </IconButton>
      </HStack>
    </VStack>
  );
};

export default SprintCard;
