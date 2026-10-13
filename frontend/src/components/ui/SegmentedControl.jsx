import { Box, Flex } from "@chakra-ui/react";

// Pill switch between two to four views of one screen (Market / My tasks),
// styled like BoardTabs. Full width on phones. Options take a `count` badge.
const SegmentedControl = ({ options, value, onChange, label, ...rest }) => (
  <Flex role='radiogroup' aria-label={label} bg='bg.muted' p={1} rounded='full' w={{ base: "full", sm: "max-content" }} {...rest}>
    {options.map((option) => {
      const active = option.value === value;
      return (
        <Box
          as='button'
          type='button'
          role='radio'
          aria-checked={active}
          key={option.value}
          flex={{ base: 1, sm: "initial" }}
          display='flex'
          alignItems='center'
          justifyContent='center'
          gap={1.5}
          minH={{ base: 10, md: 9 }}
          px={{ base: 3, sm: 5 }}
          rounded='full'
          fontWeight='semibold'
          fontSize='sm'
          whiteSpace='nowrap'
          cursor='pointer'
          color={active ? "fg" : "fg.muted"}
          bg={active ? "bg.panel" : "transparent"}
          boxShadow={active ? "sm" : "none"}
          transition='all 0.2s ease'
          _hover={{ color: "fg" }}
          focusVisibleRing='inside'
          onClick={() => onChange(option.value)}
        >
          {option.label}
          {option.count != null && option.count > 0 && (
            <Box
              as='span'
              colorPalette={option.palette ?? "gray"}
              bg={option.palette ? "colorPalette.solid" : "bg.emphasized"}
              color={option.palette ? "colorPalette.contrast" : "fg.muted"}
              fontSize='xs'
              lineHeight='1'
              px={1.5}
              py={1}
              minW={5}
              rounded='full'
              fontVariantNumeric='tabular-nums'
            >
              {option.count}
            </Box>
          )}
        </Box>
      );
    })}
  </Flex>
);

export default SegmentedControl;
