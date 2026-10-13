import { Box, Flex, Heading, IconButton, Stack, Text } from "@chakra-ui/react";
import { LuArrowLeft } from "react-icons/lu";
import useGoBack from "../../hooks/useGoBack";

// Top of every screen: optional back button, eyebrow, title, one-line
// description and actions. Actions drop below the title on phones.
// `back` is where the back button goes when there is no history to return to.
const PageHeader = ({ eyebrow, title, description, actions, actionsProps, back, children, ...rest }) => {
  const goBack = useGoBack(typeof back === "string" ? back : "/");
  return (
    <Flex
      direction={{ base: "column", sm: "row" }}
      align={{ base: "stretch", sm: "flex-end" }}
      justify='space-between'
      gap={{ base: 4, sm: 6 }}
      mb={{ base: 5, md: 8 }}
      animation='fade-up'
      {...rest}
    >
      <Flex gap={3} align='flex-start' minW={0}>
        {back && (
          <IconButton aria-label='Go back' variant='outline' colorPalette='gray' rounded='full' flexShrink={0} onClick={goBack}>
            <LuArrowLeft />
          </IconButton>
        )}
        <Stack gap={1} minW={0}>
          {eyebrow && (
            <Text textStyle='eyebrow' color='brand.fg'>
              {eyebrow}
            </Text>
          )}
          <Heading as='h1' fontSize={{ base: "2xl", md: "3xl" }} lineHeight='1.15' fontWeight='800' overflowWrap='anywhere'>
            {title}
          </Heading>
          {description && (
            <Text color='fg.muted' fontSize={{ base: "sm", md: "md" }}>
              {description}
            </Text>
          )}
          {children}
        </Stack>
      </Flex>
      {actions && (
        <Box display='flex' gap={2} flexShrink={0} css={{ "& > *": { flex: { base: "1", sm: "initial" } } }} {...actionsProps}>
          {actions}
        </Box>
      )}
    </Flex>
  );
};

export default PageHeader;
