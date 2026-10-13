import { Box, Button, Flex } from "@chakra-ui/react";

// Single-select pill row for filters. Scrolls sideways inside itself on narrow
// screens so the page never does.
const FilterChips = ({ options, value, onChange, label, ...rest }) => (
  <Box
    role='radiogroup'
    aria-label={label}
    overflowX='auto'
    mx={{ base: -4, md: 0 }}
    px={{ base: 4, md: 0 }}
    css={{ scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}
    {...rest}
  >
    <Flex gap={2} w='max-content'>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Button
            key={option.value}
            role='radio'
            aria-checked={active}
            size='sm'
            rounded='full'
            minH={{ base: 11, md: 9 }}
            px={4}
            variant={active ? "solid" : "outline"}
            colorPalette={active ? "brand" : "gray"}
            bg={active ? undefined : "bg.panel"}
            onClick={() => onChange(option.value)}
          >
            {option.label}
            {option.count != null && (
              <Box as='span' fontSize='xs' opacity={0.75} fontVariantNumeric='tabular-nums'>
                {option.count}
              </Box>
            )}
          </Button>
        );
      })}
    </Flex>
  </Box>
);

export default FilterChips;
