import { Box, Flex } from "@chakra-ui/react";

// Dropdown list shown under a search input. Chakra v3's Menu moves focus into
// the menu when opened, which breaks type-to-search, so this is a plain list.
export const SearchMenu = ({ children }) => {
  return (
    <Box
      role='menu'
      position='absolute'
      top='100%'
      mt={1.5}
      w='full'
      maxH='64'
      overflowY='auto'
      bg='bg.panel'
      borderWidth='1px'
      borderColor='border'
      rounded='l2'
      boxShadow='xl'
      p={1.5}
      zIndex='dropdown'
      animation='fade-up'
    >
      {children}
    </Box>
  );
};

export const SearchMenuItem = ({ children, onClick }) => {
  return (
    <Flex
      as='button'
      type='button'
      role='menuitem'
      w='full'
      minH={{ base: 11, md: 10 }}
      align='center'
      gap={2.5}
      px={2.5}
      py={1.5}
      rounded='l1'
      textAlign='start'
      cursor='pointer'
      _hover={{ bg: "bg.muted" }}
      _focusVisible={{ bg: "bg.muted", outline: "none" }}
      onClick={onClick}
    >
      {children}
    </Flex>
  );
};
