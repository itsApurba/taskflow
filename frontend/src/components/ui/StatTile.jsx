import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";

// A single number with a label, e.g. "In progress 3". With `to` the whole
// tile is a link with a hover lift.
const StatTile = ({ label, value, icon, palette = "brand", hint, to, ...rest }) => {
  const interactive = Boolean(to);
  const content = (
    <>
      {icon && (
        <Flex colorPalette={palette} bg='colorPalette.subtle' color='colorPalette.fg' rounded='l2' boxSize={9} align='center' justify='center' mb={3}>
          <Icon as={icon} boxSize={4.5} />
        </Flex>
      )}
      <Text textStyle='hud' fontSize={{ base: "2xl", md: "3xl" }} lineHeight='1'>
        {value}
      </Text>
      <Text fontSize='sm' fontWeight='semibold' color='fg.muted' mt={1.5} lineClamp={1}>
        {label}
      </Text>
      {hint && (
        <Text fontSize='xs' color='fg.subtle' mt={0.5} lineClamp={1}>
          {hint}
        </Text>
      )}
    </>
  );
  return (
    <Box
      layerStyle='panel'
      p={{ base: 3.5, md: 4 }}
      minW={0}
      display='block'
      transition='transform 0.2s ease, box-shadow 0.2s ease'
      _hover={interactive ? { transform: "translateY(-2px)", boxShadow: "card-hover" } : undefined}
      focusVisibleRing='outside'
      asChild={interactive}
      {...rest}
    >
      {interactive ? <Link to={to}>{content}</Link> : content}
    </Box>
  );
};

export default StatTile;
