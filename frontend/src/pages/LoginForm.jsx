import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Button, FormControl, FormLabel, Input, FormErrorMessage, VStack, Box, useColorModeValue, useToast } from "@chakra-ui/react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const SignUpSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().min(8, "Must be at least 8 characters").required("Required"),
});
const LoginForm = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { setUserEmail, setIsLoggedIn, setUserName, setUserId } = useAuth();
  return (
    <Box p={4} maxW={"container.lg"} m={"auto"}>
      <Box rounded={"lg"} bg={useColorModeValue("gray.100", "gray.900")} boxShadow={"lg"} p={8}>
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={SignUpSchema}
          onSubmit={async (values) => {
            try {
              const {
                data: { token, user },
              } = await api.post("/auth/login", values);
              localStorage.setItem("access_token", JSON.stringify(token));
              toast({
                title: "Success",
                description: "Login Successful",
                status: "success",
              });
              setIsLoggedIn(true);
              setUserName(user.name);
              setUserEmail(user.email);
              setUserId(user._id);
              navigate("/dashboard");
            } catch (error) {
              toast({
                title: "Invalid Credentials",
                description: error.response.data.message,
                status: "error",
              });
            }
          }}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form>
              <VStack spacing={4}>
                <FormControl isInvalid={errors.email && touched.email}>
                  <FormLabel>Email</FormLabel>
                  <Field as={Input} type='email' name='email' />
                  <FormErrorMessage component='div'>
                    <ErrorMessage name='email' />
                  </FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={errors.password && touched.password}>
                  <FormLabel>Password</FormLabel>
                  <Field as={Input} type='password' name='password' />
                  <FormErrorMessage component='div'>
                    <ErrorMessage name='password' />
                  </FormErrorMessage>
                </FormControl>

                <Button type='submit' disabled={isSubmitting}>
                  Login
                </Button>
              </VStack>
            </Form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

export default LoginForm;
