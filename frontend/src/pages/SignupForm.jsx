import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button, Field as ChakraField, Input, VStack, Box } from "@chakra-ui/react";
import { useColorModeValue } from "../hooks/useColorMode";
import { toaster } from "../components/ui/toaster";
import api from "../api/api";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const SignUpSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(8, "Must be at least 8 characters").required("Required"),
});
const SignupForm = () => {
  const navigate = useNavigate()
  const { setUserEmail, setIsLoggedIn, setUserName, setUserId } = useAuth();
  return (
    <Box p={4} maxW={"5xl"} m={"auto"}>
      <Box rounded={"lg"} bg={useColorModeValue("gray.100", "gray.900")} boxShadow={"lg"} p={8}>

    <Formik
      initialValues={{ name: "", email: "", password: "" }}
      validationSchema={SignUpSchema}
      onSubmit={async (values) => {
        try {
          const res = await api.post("/auth/register", values);
          console.log(res.data);
          const { token, user } = res.data;
          localStorage.setItem("access_token", JSON.stringify(token));
           toaster.create({
             title: "Success",
             description: "Login Successful",
             type: "success",
           });
           setIsLoggedIn(true);
           setUserName(user.name);
           setUserEmail(user.email);
           setUserId(user._id);
           navigate("/dashboard");
        } catch (error) {
          toaster.create({
            title: "Email Already Exists",
            description: error.response.data.message,
            type: "error",
          });
        }
      }}
    >
      {({ isSubmitting, errors, touched }) => (
        <Form>
          <VStack gap={4}>
            <ChakraField.Root invalid={errors.name && touched.name}>
              <ChakraField.Label>Name</ChakraField.Label>
              <Field as={Input} type='text' name='name' />
              <ChakraField.ErrorText>
                <ErrorMessage name='name' />
              </ChakraField.ErrorText>
            </ChakraField.Root>

            <ChakraField.Root invalid={errors.email && touched.email}>
              <ChakraField.Label>Email</ChakraField.Label>
              <Field as={Input} type='email' name='email' />
              <ChakraField.ErrorText>
                <ErrorMessage name='email' />
              </ChakraField.ErrorText>
            </ChakraField.Root>

            <ChakraField.Root invalid={errors.password && touched.password}>
              <ChakraField.Label>Password</ChakraField.Label>
              <Field as={Input} type='password' name='password' />
              <ChakraField.ErrorText>
                <ErrorMessage name='password' />
              </ChakraField.ErrorText>
            </ChakraField.Root>

            <Button type='submit' disabled={isSubmitting}>
              Sign Up
            </Button>
          </VStack>
        </Form>
      )}
    </Formik>

      </Box>
      </Box>
  );
};

export default SignupForm;
