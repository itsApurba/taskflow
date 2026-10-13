import { Button, Heading, Stack, Text } from "@chakra-ui/react";
import { LuCompass } from "react-icons/lu";
import { Link } from "react-router-dom";
import EmptyState from "../components/ui/EmptyState";
import useAuth from "../hooks/useAuth";

// Catch-all route: a welcome for visitors, a "not found" for signed-in people.
const HomePage = () => {
  const { isLoggedIn } = useAuth();
  if (isLoggedIn) {
    return (
      <EmptyState icon={LuCompass} title='This page wandered off' description="We couldn't find what you were looking for." py={6}>
        <Button asChild>
          <Link to='/'>Back to home</Link>
        </Button>
      </EmptyState>
    );
  }
  return (
    <Stack gap={6}>
      <Stack gap={2}>
        <Text textStyle='eyebrow' color='brand.fg'>
          Welcome to TaskFlow
        </Text>
        <Heading as='h1' fontSize={{ base: "2xl", md: "3xl" }} fontWeight='800'>
          Work that pays off.
        </Heading>
        <Text color='fg.muted'>Claim tasks, earn credits when they're approved and spend them in your team's rewards store.</Text>
      </Stack>
      <Stack gap={3}>
        <Button asChild size='lg'>
          <Link to='/signup'>Create an account</Link>
        </Button>
        <Button asChild size='lg' variant='outline' colorPalette='gray'>
          <Link to='/login'>Log in</Link>
        </Button>
      </Stack>
    </Stack>
  );
};

export default HomePage;
