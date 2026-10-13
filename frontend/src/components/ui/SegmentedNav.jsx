import { Box, Flex } from "@chakra-ui/react";
import { NavLink, useLocation } from "react-router-dom";

// Segmented switch between sibling routes (a pill track with the active page
// raised). Each tab is { to, label, shortLabel?, count?, palette?, end? }: `end`
// matches the path exactly, `shortLabel` replaces the label on phones and
// `count` shows a badge in `palette`. Stretches full width on phones.
const SegmentedNav = ({ tabs, label, ...rest }) => {
  const { pathname } = useLocation();
  return (
    <Flex as='nav' aria-label={label} bg='bg.muted' p={1} rounded='full' w={{ base: "full", sm: "max-content" }} maxW='full' {...rest}>
      {tabs.map((tab) => {
        const active = tab.end ? pathname === tab.to : pathname === tab.to || pathname.startsWith(`${tab.to}/`);
        return (
          <Box
            key={tab.to}
            asChild
            flex={{ base: 1, sm: "initial" }}
            minW={0}
            display='flex'
            alignItems='center'
            justifyContent='center'
            gap={1.5}
            minH={{ base: 10, md: 9 }}
            px={{ base: 2, sm: 5 }}
            rounded='full'
            fontWeight='semibold'
            fontSize='sm'
            whiteSpace='nowrap'
            color={active ? "fg" : "fg.muted"}
            bg={active ? "bg.panel" : "transparent"}
            boxShadow={active ? "sm" : "none"}
            transition='all 0.2s ease'
            _hover={active ? undefined : { color: "fg" }}
            focusVisibleRing='inside'
          >
            <NavLink to={tab.to} end={tab.end} aria-current={active ? "page" : undefined}>
              <Box as='span' overflow='hidden' textOverflow='ellipsis' display={tab.shortLabel ? { base: "none", sm: "inline" } : undefined}>
                {tab.label}
              </Box>
              {tab.shortLabel && (
                <Box as='span' overflow='hidden' textOverflow='ellipsis' display={{ base: "inline", sm: "none" }}>
                  {tab.shortLabel}
                </Box>
              )}
              {tab.count > 0 && (
                <Box
                  as='span'
                  colorPalette={tab.palette ?? "brand"}
                  bg='colorPalette.solid'
                  color='colorPalette.contrast'
                  rounded='full'
                  minW={5}
                  h={5}
                  px={1.5}
                  fontSize='2xs'
                  fontWeight='bold'
                  display='inline-flex'
                  alignItems='center'
                  justifyContent='center'
                  fontVariantNumeric='tabular-nums'
                  flexShrink={0}
                >
                  {tab.count}
                </Box>
              )}
            </NavLink>
          </Box>
        );
      })}
    </Flex>
  );
};

export default SegmentedNav;
