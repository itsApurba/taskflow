import { Box, Field as ChakraField, Flex, IconButton, Input, InputGroup, Text } from "@chakra-ui/react";
import { ErrorMessage, useFormikContext } from "formik";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../api/api";
import { LuSearch, LuX } from "react-icons/lu";
import useOutsideClick from "../hooks/useOutsideClick";
import useUser from "../hooks/useUser";
import { SearchMenu, SearchMenuItem } from "./SearchMenu";
import UserAvatar from "./ui/UserAvatar";

// Assignee picker: search people by name or email, then show the pick as a
// removable chip. The Formik value is the user's id.
const AssignTaskField = ({ name = "assignee" }) => {
  const ref = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useOutsideClick({
    ref: ref,
    handler: () => setIsModalOpen(false),
  });
  const { errors, touched, values, setFieldValue } = useFormikContext();
  const assignee = values[name];
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [picked, setPicked] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const results = useQuery({
    queryKey: ["user-search", debounced],
    queryFn: () => api.get(`/users/search?name=${encodeURIComponent(debounced)}`),
    enabled: debounced.length > 0,
  });

  // Editing an existing task: look up the assignee's name from their id.
  const current = useUser(assignee, { enabled: picked?._id !== assignee });
  const assigneeName = picked?._id === assignee ? picked.name : current.data?.name;

  const pick = (user) => {
    setPicked(user);
    setFieldValue(name, user._id);
    setSearch("");
    setIsModalOpen(false);
  };

  return (
    <ChakraField.Root invalid={errors[name] && touched[name]}>
      <ChakraField.Label>Assignee</ChakraField.Label>
      {assignee ? (
        <Flex
          w='full'
          align='center'
          gap={3}
          borderWidth='1px'
          borderColor='border.emphasized'
          bg='bg.panel'
          rounded='l2'
          ps={3}
          pe={1}
          minH={{ base: 11, md: 10 }}
        >
          <UserAvatar name={assigneeName ?? ""} size='xs' />
          <Text flex='1' fontWeight='medium' lineClamp={1}>
            {assigneeName ?? "Loading…"}
          </Text>
          <IconButton aria-label='Remove assignee' variant='ghost' colorPalette='gray' size='sm' rounded='l1' onClick={() => setFieldValue(name, "")}>
            <LuX />
          </IconButton>
        </Flex>
      ) : (
        <Box position='relative' zIndex={10} w={"full"} ref={ref}>
          <InputGroup startElement={<LuSearch />}>
            <Input
              value={search}
              name='assignee-search'
              placeholder='Search by name or email'
              autoComplete='off'
              onChange={(e) => {
                setSearch(e.target.value);
                setIsModalOpen(true);
              }}
              onFocus={() => setIsModalOpen(true)}
              onKeyDown={(e) => e.key === "Escape" && setIsModalOpen(false)}
            />
          </InputGroup>
          {isModalOpen && search.trim().length > 0 && results.data?.data.length > 0 && (
            <SearchMenu>
              {results.data.data.map((user) => (
                <SearchMenuItem key={user._id} onClick={() => pick(user)}>
                  <UserAvatar name={user.name} size='xs' />
                  <Box minW={0}>
                    <Text fontWeight='medium' lineClamp={1}>
                      {user.name}
                    </Text>
                    <Text fontSize='xs' color='fg.muted' lineClamp={1}>
                      {user.email}
                    </Text>
                  </Box>
                </SearchMenuItem>
              ))}
            </SearchMenu>
          )}
        </Box>
      )}
      <ChakraField.HelperText>Optional. Leave empty to put the task up for grabs.</ChakraField.HelperText>
      <ChakraField.ErrorText>
        <ErrorMessage name={name} />
      </ChakraField.ErrorText>
    </ChakraField.Root>
  );
};

export default AssignTaskField;
