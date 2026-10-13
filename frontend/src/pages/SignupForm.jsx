import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button, Field as ChakraField, Heading, Icon, Input, InputGroup, Link as ChakraLink, NativeSelect, RadioCard, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { LuClipboardList, LuHand, LuMail, LuUser } from "react-icons/lu";
import { toaster } from "../components/ui/toaster";
import PasswordInput from "../components/ui/PasswordInput";
import api from "../api/api";
import useAuth from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { firstName } from "../lib/game";

const ROLES = [
  { value: "worker", label: "Worker", icon: LuHand, hint: "Claim tasks, get paid" },
  { value: "manager", label: "Manager", icon: LuClipboardList, hint: "Post tasks, approve" },
];

// Workers pick the manager they report to when there is one to pick.
const signUpSchema = (managers) =>
  Yup.object().shape({
    name: Yup.string().required("Required"),
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string().min(8, "Must be at least 8 characters").required("Required"),
    role: Yup.string().oneOf(["worker", "manager"]).required("Required"),
    reportsTo: Yup.string().when("role", {
      is: (role) => role === "worker" && managers.length > 0,
      then: (schema) => schema.required("Pick the manager you report to"),
    }),
  });

const SignupForm = () => {
  const navigate = useNavigate();
  const { setUserEmail, setIsLoggedIn, setUserName, setUserId } = useAuth();
  const managersQuery = useQuery({
    queryKey: ["users", "managers"],
    queryFn: async () => (await api.get("/users/managers")).data,
    retry: false,
  });
  const managers = managersQuery.data ?? [];
  return (
    <Stack gap={6}>
      <Stack gap={1}>
        <Text textStyle='eyebrow' color='brand.fg'>
          New player
        </Text>
        <Heading as='h1' fontSize={{ base: "2xl", md: "3xl" }} fontWeight='800'>
          Create your account
        </Heading>
        <Text color='fg.muted'>Join your team's board and start earning.</Text>
      </Stack>
      <Formik
        initialValues={{ name: "", email: "", password: "", role: "worker", reportsTo: "" }}
        validationSchema={signUpSchema(managers)}
        onSubmit={async (values) => {
          const body = { ...values, reportsTo: values.role === "worker" && values.reportsTo ? values.reportsTo : undefined };
          try {
            const res = await api.post("/auth/register", body);
            const { token, user } = res.data;
            localStorage.setItem("access_token", JSON.stringify(token));
            toaster.create({
              title: `Welcome aboard, ${firstName(user.name)}!`,
              description: user.role === "manager" ? "Post your first task to the market." : "The market is open. Go claim a task!",
              type: "success",
            });
            setIsLoggedIn(true);
            setUserName(user.name);
            setUserEmail(user.email);
            setUserId(user._id);
            navigate(user.role === "manager" ? "/market" : "/dashboard");
          } catch (error) {
            toaster.create({
              title: "Couldn't create your account",
              description: error.response?.data?.message ?? "Try logging in instead, or use another email.",
              type: "error",
            });
          }
        }}
      >
        {({ isSubmitting, errors, touched, values, setFieldValue }) => (
          <Form noValidate>
            <Stack gap={4}>
              <RadioCard.Root name='role' value={values.role} onValueChange={(e) => setFieldValue("role", e.value)} orientation='vertical' align='center' size='sm'>
                <RadioCard.Label fontSize='sm' fontWeight='medium' mb={1.5}>
                  I'm joining as
                </RadioCard.Label>
                <SimpleGrid columns={2} gap={2}>
                  {ROLES.map((role) => (
                    <RadioCard.Item key={role.value} value={role.value} borderRadius='l2' bg='bg.panel' _checked={{ bg: "brand.subtle" }}>
                      <RadioCard.ItemHiddenInput />
                      <RadioCard.ItemControl py={3} gap={1}>
                        <Icon as={role.icon} boxSize={5} color='brand.fg' />
                        <RadioCard.ItemText fontWeight='semibold'>{role.label}</RadioCard.ItemText>
                        <RadioCard.ItemDescription fontSize='xs' textAlign='center'>
                          {role.hint}
                        </RadioCard.ItemDescription>
                      </RadioCard.ItemControl>
                    </RadioCard.Item>
                  ))}
                </SimpleGrid>
              </RadioCard.Root>

              <ChakraField.Root invalid={errors.name && touched.name}>
                <ChakraField.Label>Name</ChakraField.Label>
                <InputGroup startElement={<LuUser />}>
                  <Field as={Input} type='text' name='name' autoComplete='name' placeholder='Your full name' />
                </InputGroup>
                <ChakraField.ErrorText>
                  <ErrorMessage name='name' />
                </ChakraField.ErrorText>
              </ChakraField.Root>

              <ChakraField.Root invalid={errors.email && touched.email}>
                <ChakraField.Label>Email</ChakraField.Label>
                <InputGroup startElement={<LuMail />}>
                  <Field as={Input} type='email' name='email' autoComplete='email' placeholder='you@team.com' />
                </InputGroup>
                <ChakraField.ErrorText>
                  <ErrorMessage name='email' />
                </ChakraField.ErrorText>
              </ChakraField.Root>

              <ChakraField.Root invalid={errors.password && touched.password}>
                <ChakraField.Label>Password</ChakraField.Label>
                <Field as={PasswordInput} name='password' autoComplete='new-password' placeholder='At least 8 characters' />
                <ChakraField.ErrorText>
                  <ErrorMessage name='password' />
                </ChakraField.ErrorText>
              </ChakraField.Root>

              {values.role === "worker" && (
                <ChakraField.Root invalid={errors.reportsTo && touched.reportsTo} disabled={managersQuery.isLoading || managers.length === 0}>
                  <ChakraField.Label>Your manager</ChakraField.Label>
                  <NativeSelect.Root>
                    <Field as={NativeSelect.Field} name='reportsTo'>
                      <option value=''>{managersQuery.isLoading ? "Loading managers…" : managers.length ? "Who do you report to?" : "No managers yet"}</option>
                      {managers.map((manager) => (
                        <option key={manager._id} value={manager._id}>
                          {manager.name}
                        </option>
                      ))}
                    </Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                  <ChakraField.HelperText>
                    {managers.length || managersQuery.isLoading
                      ? "You'll see their market, store and team leaderboard."
                      : "You can still sign up. Your market fills up once a manager adds you."}
                  </ChakraField.HelperText>
                  <ChakraField.ErrorText>
                    <ErrorMessage name='reportsTo' />
                  </ChakraField.ErrorText>
                </ChakraField.Root>
              )}

              <Button type='submit' size='lg' w='full' mt={2} loading={isSubmitting}>
                Create account
              </Button>
            </Stack>
          </Form>
        )}
      </Formik>
      <Text textAlign='center' color='fg.muted' fontSize='sm'>
        Already have an account?{" "}
        <ChakraLink asChild color='brand.fg' fontWeight='semibold'>
          <Link to='/login'>Log in</Link>
        </ChakraLink>
      </Text>
    </Stack>
  );
};

export default SignupForm;
