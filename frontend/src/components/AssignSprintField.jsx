import { Button, FormControl, FormLabel, Input, InputGroup, InputLeftElement, Menu, MenuButton, MenuItem, MenuList, useOutsideClick } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useFormikContext } from "formik";
import { useEffect, useRef, useState } from "react";
import api from "../api/api";

const AssignSprintField = () => {
  const ref = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useOutsideClick({
    ref: ref,
    handler: () => setIsModalOpen(false),
  });
  const { errors, touched, values, setFieldValue } = useFormikContext();
  const [taskInput, setTaskInput] = useState("");

  const { data, refetch } = useQuery(["tasks-search"], () => api.get(`/tasks/search?name=${taskInput}`), {
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
  };
  console.log(values);
  return (
    <FormControl isInvalid={errors.task && touched.task}>
      <FormLabel>Task</FormLabel>
      <InputGroup flexDir={"column"} zIndex={1} w={"full"} className='itemGroup'>
        <Input value={taskInput} onChange={handleChange} onClick={() => setIsModalOpen(true)} ref={ref} />
        <Menu isOpen={isModalOpen && taskInput.length > 0 && data?.data.length > 0} matchWidth={true} flip={false}>
          <MenuButton className='menubuttonclass' />
          <MenuList w={"full"} className='menulist' maxH={"200px"} overflow={"scroll"}>
            {data?.data.map((task) => (
              <MenuItem gap={2} key={task._id} value={task._id} onClick={() => handleClick(task._id)}>
                {task.title}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </InputGroup>
    </FormControl>
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
