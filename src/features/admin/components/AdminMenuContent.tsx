import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import ExtensionRoundedIcon from "@mui/icons-material/ExtensionRounded";
import SubscriptionsRoundedIcon from "@mui/icons-material/SubscriptionsRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import ExitToAppRoundedIcon from "@mui/icons-material/ExitToAppRounded";

const mainListItems = [
  { text: "Overview", icon: <DashboardRoundedIcon />, path: "/admin" },
  {
    text: "Module Management",
    icon: <ExtensionRoundedIcon />,
    path: "/admin/modules",
  },
  {
    text: "Subscriptions",
    icon: <SubscriptionsRoundedIcon />,
    path: "/admin/subscriptions",
  },
  {
    text: "Organizations",
    icon: <BusinessRoundedIcon />,
    path: "/admin/organizations",
  },
  {
    text: "Analytics",
    icon: <AnalyticsRoundedIcon />,
    path: "/admin/analytics",
  },
  { text: "Users", icon: <PeopleRoundedIcon />, path: "/admin/users" },
];

const secondaryListItems = [
  { text: "Settings", icon: <SettingsRoundedIcon />, path: "/admin/settings" },
  {
    text: "Help & Support",
    icon: <HelpOutlineRoundedIcon />,
    path: "/admin/help",
  },
];

export default function AdminMenuContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  const currentPath = location.pathname;

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: "block" }}>
            <ListItemButton
              selected={currentPath === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box>
        <Divider sx={{ my: 1 }} />
        <List dense>
          {secondaryListItems.map((item, index) => (
            <ListItem key={index} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                selected={currentPath === item.path}
                onClick={() => handleNavigation(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
          <ListItem disablePadding sx={{ display: "block" }}>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <ExitToAppRoundedIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Stack>
  );
}
