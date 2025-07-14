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
import Typography from "@mui/material/Typography";
import Badge from "@mui/material/Badge";
import Chip from "@mui/material/Chip";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import ExtensionRoundedIcon from "@mui/icons-material/ExtensionRounded";
import SubscriptionsRoundedIcon from "@mui/icons-material/SubscriptionsRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import MessageRoundedIcon from "@mui/icons-material/MessageRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import ExitToAppRoundedIcon from "@mui/icons-material/ExitToAppRounded";

const mainListItems = [
  {
    text: "Dashboard",
    icon: <DashboardRoundedIcon />,
    path: "/admin",
    description: "",
  },
  {
    text: "Organizations",
    icon: <BusinessRoundedIcon />,
    path: "/admin/organizations",
    description: "Manage all organizations",
  },
  {
    text: "Modules",
    icon: <ExtensionRoundedIcon />,
    path: "/admin/modules",
    description: "Manage system modules",
  },
  {
    text: "Subscriptions",
    icon: <SubscriptionsRoundedIcon />,
    path: "/admin/subscriptions",
    description: "Manage subscription plans",
  },
  {
    text: "Chat Support",
    icon: <ChatRoundedIcon />,
    path: "/admin/chat",
    description: "Intervene in user chats",
    badge: "+5",
  },
  {
    text: "WhatsApp Templates",
    icon: <MessageRoundedIcon />,
    path: "/admin/whatsapp-templates",
    description: "Create & manage WhatsApp templates",
  },
  {
    text: "Lead Management",
    icon: <CampaignRoundedIcon />,
    path: "/admin/lead-management",
    description: "Campaigns, forms & lead tracking",
  },
  {
    text: "Chatbot Builder",
    icon: <SmartToyRoundedIcon />,
    path: "/admin/chatbot-builder",
    description: "Visual conversation flow builder",
  },
  {
    text: "Customer Management",
    icon: <PersonRoundedIcon />,
    path: "/admin/customers",
    description: "Dynamic forms & customer data",
  },
];

const secondaryListItems = [
  { text: "Settings", icon: <SettingsRoundedIcon />, path: "/admin/settings" },
  {
    text: "Help & Support",
    icon: <HelpOutlineRoundedIcon />,
    path: "/admin/help",
  },
];

interface AdminMenuContentProps {
  open: boolean;
}

export default function AdminMenuContent({ open }: AdminMenuContentProps) {
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
    <Stack
      sx={{ flexGrow: 1, p: open ? 2 : 1, justifyContent: "space-between" }}
    >
      <List sx={{ pt: 1 }}>
        {mainListItems.map((item, index) => (
          <ListItem
            key={index}
            disablePadding
            sx={{ display: "block", mb: 0.5 }}
          >
            <ListItemButton
              selected={currentPath === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                minHeight: open ? 56 : 48,
                borderRadius: 2,
                px: open ? 2 : 1.5,
                mx: 0.5,
                backgroundColor:
                  currentPath === item.path ? "#6366F1" : "transparent",
                color: currentPath === item.path ? "white" : "text.primary",
                "&:hover": {
                  backgroundColor:
                    currentPath === item.path
                      ? "#5856EB"
                      : "rgba(99, 102, 241, 0.08)",
                },
                "&.Mui-selected": {
                  backgroundColor: "#6366F1",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#5856EB",
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: open ? 40 : "auto",
                  mr: open ? 2 : "auto",
                  justifyContent: "center",
                  color: currentPath === item.path ? "white" : "text.secondary",
                }}
              >
                {item.badge ? (
                  <Badge
                    badgeContent={item.badge}
                    sx={{
                      "& .MuiBadge-badge": {
                        backgroundColor: "#10B981",
                        color: "white",
                        fontSize: "10px",
                        fontWeight: 600,
                        height: 18,
                        minWidth: 18,
                      },
                    }}
                  >
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              {open && (
                <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color:
                        currentPath === item.path ? "white" : "text.primary",
                    }}
                  >
                    {item.text}
                  </Typography>
                  {item.description && (
                    <Typography
                      variant="caption"
                      sx={{
                        color:
                          currentPath === item.path
                            ? "rgba(255,255,255,0.8)"
                            : "text.secondary",
                        fontSize: "11px",
                        lineHeight: 1.2,
                      }}
                    >
                      {item.description}
                    </Typography>
                  )}
                </Box>
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      {open && (
        <Box>
          <Divider sx={{ my: 2 }} />
          <List>
            {secondaryListItems.map((item, index) => (
              <ListItem
                key={index}
                disablePadding
                sx={{ display: "block", mb: 0.5 }}
              >
                <ListItemButton
                  selected={currentPath === item.path}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    minHeight: 48,
                    borderRadius: 2,
                    px: 2,
                    mx: 0.5,
                    "&:hover": {
                      backgroundColor: "rgba(99, 102, 241, 0.08)",
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: "text.secondary" }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      variant: "body2",
                      fontWeight: 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
            <ListItem disablePadding sx={{ display: "block", mb: 0.5 }}>
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  minHeight: 48,
                  borderRadius: 2,
                  px: 2,
                  mx: 0.5,
                  "&:hover": {
                    backgroundColor: "rgba(239, 68, 68, 0.08)",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: "text.secondary" }}>
                  <ExitToAppRoundedIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Logout"
                  primaryTypographyProps={{
                    variant: "body2",
                    fontWeight: 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      )}
    </Stack>
  );
}
