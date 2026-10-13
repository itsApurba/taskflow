import { Box, Flex } from "@chakra-ui/react";
import { NavLink, useLocation } from "react-router-dom";

const tabs = [
  { to: "/tasks", label: "Tasks" },
  { to: "/sprints", label: "Sprints" },
];

// Segmented switch between the two board views.
const BoardTabs = (props) => {
  const { pathname } = useLocation();
  return (
    <Flex as='nav' aria-label='Board views' bg='bg.muted' p={1} rounded='full' w={{ base: "full", sm: "max-content" }} {...props}>
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.to);
        return (
          <Box
            key={tab.to}
            asChild
            flex={{ base: 1, sm: "initial" }}
            display='flex'
            alignItems='center'
            justifyContent='center'
            minH={{ base: 10, md: 9 }}
            px={5}
            rounded='full'
            fontWeight='semibold'
            fontSize='sm'
            color={active ? "fg" : "fg.muted"}
            bg={active ? "bg.panel" : "transparent"}
            boxShadow={active ? "sm" : "none"}
            transition='all 0.2s ease'
            focusVisibleRing='inside'
          >
            <NavLink to={tab.to} aria-current={active ? "page" : undefined}>
              {tab.label}
            </NavLink>
          </Box>
        );
      })}
    </Flex>
  );
};

export default BoardTabs;
