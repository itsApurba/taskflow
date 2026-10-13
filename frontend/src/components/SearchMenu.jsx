import { Box, Flex } from "@chakra-ui/react";

// Dropdown list shown under a search input. Chakra v3's Menu moves focus into
// the menu when opened, which breaks type-to-search, so this is a plain list.
export const SearchMenu = ({ children }) => {
  return (
    <Box
      role='menu'
      position='absolute'
      top='100%'
      mt={1}
      w='full'
      maxH='200px'
      overflowY='auto'
      bg='bg.panel'
      borderWidth='1px'
      rounded='l2'
      shadow='md'
      py={1}
      zIndex='dropdown'
    >
      {children}
    </Box>
  );
};

export const SearchMenuItem = ({ children, onClick }) => {
  return (
    <Flex as='button' type='button' role='menuitem' w='full' align='center' gap={2} px={3} py={1.5} textAlign='start' cursor='pointer' _hover={{ bg: "bg.muted" }} onClick={onClick}>
      {children}
    </Flex>
  );
};
