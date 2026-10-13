import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button, Field as ChakraField, Heading, Input, InputGroup, Link as ChakraLink, Stack, Text } from "@chakra-ui/react";
import { LuMail, LuUser } from "react-icons/lu";
import { toaster } from "../components/ui/toaster";
import PasswordInput from "../components/ui/PasswordInput";
import api from "../api/api";
import useAuth from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { firstName } from "../lib/game";

const SignUpSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(8, "Must be at least 8 characters").required("Required"),
});
const SignupForm = () => {
  const navigate = useNavigate();
  const { setUserEmail, setIsLoggedIn, setUserName, setUserId } = useAuth();
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
        initialValues={{ name: "", email: "", password: "" }}
        validationSchema={SignUpSchema}
        onSubmit={async (values) => {
          try {
            const res = await api.post("/auth/register", values);
            const { token, user } = res.data;
            localStorage.setItem("access_token", JSON.stringify(token));
            toaster.create({
              title: `Welcome aboard, ${firstName(user.name)}!`,
              description: "Your board is ready.",
              type: "success",
            });
            setIsLoggedIn(true);
            setUserName(user.name);
            setUserEmail(user.email);
            setUserId(user._id);
            navigate("/dashboard");
          } catch (error) {
            toaster.create({
              title: "Couldn't create your account",
              description: error.response?.data?.message ?? "Try logging in instead, or use another email.",
              type: "error",
            });
          }
        }}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form noValidate>
            <Stack gap={4}>
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
