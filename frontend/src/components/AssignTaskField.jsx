import { Avatar, FormControl, FormErrorMessage, FormLabel, Input, InputGroup, InputLeftElement, Menu, MenuButton, MenuItem, MenuList, useOutsideClick } from "@chakra-ui/react";
import { ErrorMessage, useField, useFormikContext } from "formik";
import React, { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/api";
import { SearchIcon } from "@chakra-ui/icons";
const AssignTaskField = (props) => {
  const ref = useRef(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  useOutsideClick({
    ref: ref,
    handler: () => setIsModalOpen(false),
  });
  const {
    errors,
    touched,
    values: { assignee },
    setFieldValue,
  } = useFormikContext();
  const [field, meta] = useField(props);

  const { data, refetch } = useQuery(["assignee"], () => api.get(`/users/search?name=${assignee}`), {
    enabled: false,
  });

  useEffect(() => {
    const getData = setTimeout(() => {
      refetch();
    }, 1000);

    return () => clearTimeout(getData);
  }, [assignee]);

  return (
    <FormControl isInvalid={errors.assignee && touched.assignee}>
      <FormLabel>Assignee</FormLabel>
      <InputGroup flexDir={"column"} zIndex={10} w={"full"} className='itemGroup' onClick={() => setIsModalOpen(true)} ref={ref}>
        <InputLeftElement pointerEvents='none' children={<SearchIcon color='gray.300' />} />
        <Input {...props} {...field} />
        <Menu
          isOpen={isModalOpen && assignee.length > 0 && data?.data.length > 0}
          matchWidth={true}
          flip={false}
          eventListeners={{ resize: true, scroll: true }}
        >
          <MenuButton className='menubuttonclass' />
          <MenuList w={"full"} className='menulist'>
            {data?.data.map((user) => (
              <MenuItem gap={2} key={user._id} value={user._id} onClick={() => setFieldValue("assignee", user._id)}>
                <Avatar size={"xs"} /> {user.name}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </InputGroup>
      <FormErrorMessage component='div'>
        <ErrorMessage name='assignee' />
      </FormErrorMessage>
    </FormControl>
  );
};

export default AssignTaskField;
