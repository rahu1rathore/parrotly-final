import * as React from "react";
import { styled } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import MuiDrawer, { drawerClasses } from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import AdminMenuContent from "./AdminMenuContent";
import AdminOptionsMenu from "./AdminOptionsMenu";
import AdminSelectCompany from "./AdminSelectCompany";

const drawerWidth = 280;
const collapsedWidth = 72;

const openedMixin = (theme: any) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: any) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: collapsedWidth,
});

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }: { theme?: any; open?: boolean }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

interface AdminSideMenuProps {
  open: boolean;
  onToggle: () => void;
}

export default function AdminSideMenu({ open, onToggle }: AdminSideMenuProps) {
  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        display: { xs: "none", md: "block" },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: "background.paper",
          borderRight: "1px solid #E5E7EB",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: open ? "space-between" : "center",
          mt: "calc(var(--template-frame-height, 0px) + 4px)",
          p: 1.5,
          minHeight: 64,
        }}
      >
        {open && <AdminSelectCompany />}
        <IconButton
          onClick={onToggle}
          sx={{
            ml: open ? 0 : 0,
            color: "text.secondary",
          }}
        >
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Box>
      <Divider />
      <Box
        sx={{
          overflow: "auto",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <AdminMenuContent open={open} />
      </Box>
      {open && (
        <Stack
          direction="row"
          sx={{
            p: 2,
            gap: 1,
            alignItems: "center",
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Avatar
            sizes="small"
            alt="Admin User"
            src="/static/images/avatar/admin.jpg"
            sx={{ width: 36, height: 36, bgcolor: "secondary.main" }}
          >
            AU
          </Avatar>
          <Box sx={{ mr: "auto" }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, lineHeight: "16px" }}
            >
              Admin User
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              admin@example.com
            </Typography>
          </Box>
          <AdminOptionsMenu />
        </Stack>
      )}
      {!open && (
        <Box
          sx={{
            p: 1,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Avatar
            sizes="small"
            alt="Admin User"
            src="/static/images/avatar/admin.jpg"
            sx={{ width: 36, height: 36, bgcolor: "secondary.main" }}
          >
            AU
          </Avatar>
        </Box>
      )}
    </Drawer>
  );
}
