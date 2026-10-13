import { Box, Field as ChakraField, Input } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useFormikContext } from "formik";
import { useEffect, useRef, useState } from "react";
import api from "../api/api";
import useOutsideClick from "../hooks/useOutsideClick";
import { SearchMenu, SearchMenuItem } from "./SearchMenu";

const AssignSprintField = () => {
  const ref = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useOutsideClick({
    ref: ref,
    handler: () => setIsModalOpen(false),
  });
  const { errors, touched, values, setFieldValue } = useFormikContext();
  const [taskInput, setTaskInput] = useState("");

  const { data, refetch } = useQuery({
    queryKey: ["tasks-search"],
    queryFn: () => api.get(`/tasks/search?name=${taskInput}`),
    enabled: false,
  });

  useEffect(() => {
    const getData = setTimeout(() => {
      refetch();
    }, 500);

    return () => clearTimeout(getData);
  }, [taskInput, refetch]);

  const handleChange = (e) => {
    setTaskInput(e.target.value);
  };
  const handleClick = (taskId) => {
    setFieldValue("tasks", [...values.tasks, taskId]);
    setIsModalOpen(false);
  };
  console.log(values);
  return (
    <ChakraField.Root invalid={errors.task && touched.task}>
      <ChakraField.Label>Task</ChakraField.Label>
      <Box position='relative' zIndex={1} w={"full"} className='itemGroup' ref={ref}>
        <Input value={taskInput} onChange={handleChange} onClick={() => setIsModalOpen(true)} />
        {isModalOpen && taskInput.length > 0 && data?.data.length > 0 && (
          <SearchMenu>
            {data?.data.map((task) => (
              <SearchMenuItem key={task._id} onClick={() => handleClick(task._id)}>
                {task.title}
              </SearchMenuItem>
            ))}
          </SearchMenu>
        )}
      </Box>
    </ChakraField.Root>
  );
};

export default AssignSprintField;

{
  /* {values.tasks.map((task) => (
          <Text key={task}>{task}</Text>
        ))
        } */
}
{
  /* <InputLeftElement>
          <Text onClick={() => console.log('hi')}>hi</Text>
        </InputLeftElement> */
}

// const handleClick = () => {
//   setFieldValue("tasks", [...values.tasks, taskInput]);
//   setTaskInput("");
// };
