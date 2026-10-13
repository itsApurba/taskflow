import { Box, Flex, Heading, Icon, Stack, Text } from "@chakra-ui/react";

// Friendly placeholder for an empty list or a screen that is not built yet.
const EmptyState = ({ icon, title, description, children, palette = "brand", size = "md", ...rest }) => {
  const compact = size === "sm";
  return (
    <Flex direction='column' align='center' textAlign='center' gap={compact ? 3 : 4} py={compact ? 6 : { base: 10, md: 14 }} px={4} {...rest}>
      {icon && (
        <Box position='relative' colorPalette={palette}>
          <Box position='absolute' inset={compact ? "-6px" : "-10px"} rounded='full' bg='colorPalette.subtle' opacity={0.6} />
          <Flex
            position='relative'
            boxSize={compact ? 12 : 16}
            rounded='full'
            bg='colorPalette.muted'
            color='colorPalette.fg'
            align='center'
            justify='center'
            animation='pop'
          >
            <Icon as={icon} boxSize={compact ? 5 : 7} />
          </Flex>
        </Box>
      )}
      <Stack gap={1.5} maxW='sm'>
        <Heading as='h3' fontSize={compact ? "md" : "xl"} fontWeight='700'>
          {title}
        </Heading>
        {description && (
          <Text color='fg.muted' fontSize={compact ? "sm" : "md"}>
            {description}
          </Text>
        )}
      </Stack>
      {children && (
        <Flex gap={2} wrap='wrap' justify='center' mt={1}>
          {children}
        </Flex>
      )}
    </Flex>
  );
};

export default EmptyState;
