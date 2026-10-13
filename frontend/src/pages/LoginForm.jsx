import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button, Field as ChakraField, Heading, Input, InputGroup, Link as ChakraLink, Stack, Text } from "@chakra-ui/react";
import { LuMail } from "react-icons/lu";
import { toaster } from "../components/ui/toaster";
import PasswordInput from "../components/ui/PasswordInput";
import api from "../api/api";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { firstName } from "../lib/game";

const SignUpSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(8, "Must be at least 8 characters").required("Required"),
});
const LoginForm = () => {
  const navigate = useNavigate();
  const { setUserEmail, setIsLoggedIn, setUserName, setUserId } = useAuth();
  return (
    <Stack gap={6}>
      <Stack gap={1}>
        <Text textStyle='eyebrow' color='brand.fg'>
          Welcome back
        </Text>
        <Heading as='h1' fontSize={{ base: "2xl", md: "3xl" }} fontWeight='800'>
          Log in to TaskFlow
        </Heading>
        <Text color='fg.muted'>Pick up your quests where you left them.</Text>
      </Stack>
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={SignUpSchema}
        onSubmit={async (values) => {
          try {
            const {
              data: { token, user },
            } = await api.post("/auth/login", values);
            localStorage.setItem("access_token", JSON.stringify(token));
            toaster.create({
              title: `Welcome back, ${firstName(user.name)}!`,
              description: "Let's see what's next.",
              type: "success",
            });
            setIsLoggedIn(true);
            setUserName(user.name);
            setUserEmail(user.email);
            setUserId(user._id);
            navigate("/dashboard");
          } catch (error) {
            toaster.create({
              title: "Invalid Credentials",
              description: error.response?.data?.message ?? "Check your email and password and try again.",
              type: "error",
            });
          }
        }}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form noValidate>
            <Stack gap={4}>
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
                <Field as={PasswordInput} name='password' autoComplete='current-password' placeholder='At least 8 characters' />
                <ChakraField.ErrorText>
                  <ErrorMessage name='password' />
                </ChakraField.ErrorText>
              </ChakraField.Root>

              <Button type='submit' size='lg' w='full' mt={2} loading={isSubmitting}>
                Log in
              </Button>
            </Stack>
          </Form>
        )}
      </Formik>
      <Text textAlign='center' color='fg.muted' fontSize='sm'>
        New to TaskFlow?{" "}
        <ChakraLink asChild color='brand.fg' fontWeight='semibold'>
          <Link to='/signup'>Create an account</Link>
        </ChakraLink>
      </Text>
    </Stack>
  );
};

export default LoginForm;
