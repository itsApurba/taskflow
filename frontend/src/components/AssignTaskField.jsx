import { Avatar, Box, Field as ChakraField, Input, InputGroup } from "@chakra-ui/react";
import { ErrorMessage, useField, useFormikContext } from "formik";
import React, { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/api";
import { LuSearch } from "react-icons/lu";
import useOutsideClick from "../hooks/useOutsideClick";
import { SearchMenu, SearchMenuItem } from "./SearchMenu";
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
  const [field] = useField(props);

  const { data, refetch } = useQuery({
    queryKey: ["assignee"],
    queryFn: () => api.get(`/users/search?name=${assignee}`),
    enabled: false,
  });

  useEffect(() => {
    const getData = setTimeout(() => {
      refetch();
    }, 500);

    return () => clearTimeout(getData);
  }, [assignee, refetch]);

  return (
    <ChakraField.Root invalid={errors.assignee && touched.assignee}>
      <ChakraField.Label>Assignee</ChakraField.Label>
      <Box position='relative' zIndex={10} w={"full"} className='itemGroup' onClick={() => setIsModalOpen(true)} ref={ref}>
        <InputGroup startElement={<LuSearch />} startElementProps={{ color: "gray.300" }}>
          <Input {...props} {...field} onFocus={() => setIsModalOpen(true)} />
        </InputGroup>
        {isModalOpen && assignee.length > 0 && data?.data.length > 0 && (
          <SearchMenu>
            {data?.data.map((user) => (
              <SearchMenuItem key={user._id} onClick={() => setFieldValue("assignee", user._id)}>
                <Avatar.Root size={"xs"}>
                  <Avatar.Fallback />
                </Avatar.Root>{" "}
                {user.name}
              </SearchMenuItem>
            ))}
          </SearchMenu>
        )}
      </Box>
      <ChakraField.ErrorText>
        <ErrorMessage name='assignee' />
      </ChakraField.ErrorText>
    </ChakraField.Root>
  );
};

export default AssignTaskField;
