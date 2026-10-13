import { Badge, Button, Flex, Heading } from "@chakra-ui/react";
import { LuChevronRight } from "react-icons/lu";
import { Link } from "react-router-dom";

// Heading for a block inside a page, with an optional count and "see all" link.
const SectionHeader = ({ title, count, to, linkLabel = "See all", as = "h2", ...rest }) => (
  <Flex align='center' justify='space-between' gap={3} mb={3} {...rest}>
    <Flex align='center' gap={2} minW={0}>
      <Heading as={as} fontSize={{ base: "lg", md: "xl" }} fontWeight='700' lineClamp={1}>
        {title}
      </Heading>
      {count != null && (
        <Badge variant='subtle' colorPalette='gray' size='sm'>
          {count}
        </Badge>
      )}
    </Flex>
    {to && (
      <Button asChild variant='ghost' size='sm' colorPalette='brand' mr={-2} flexShrink={0} minH={{ base: 11, md: 9 }}>
        <Link to={to}>
          {linkLabel} <LuChevronRight />
        </Link>
      </Button>
    )}
  </Flex>
);

export default SectionHeader;
