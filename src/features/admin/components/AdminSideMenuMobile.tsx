import * as React from "react";
import { styled } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer, { drawerClasses } from "@mui/material/Drawer";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AdminSelectCompany from "./AdminSelectCompany";
import AdminMenuContent from "./AdminMenuContent";

const drawerWidth = 240;

const StyledDrawer = styled(Drawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: "border-box",
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: "border-box",
  },
});

interface AdminSideMenuMobileProps {
  open: boolean;
  toggleDrawer: (open: boolean) => () => void;
}

export default function AdminSideMenuMobile({
  open,
  toggleDrawer,
}: AdminSideMenuMobileProps) {
  return (
    <StyledDrawer
      anchor="right"
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: "background.paper",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          mt: "calc(var(--template-frame-height, 0px) + 4px)",
          p: 1.5,
        }}
      >
        <AdminSelectCompany />
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
        <AdminMenuContent />
      </Box>
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
      </Stack>
    </StyledDrawer>
  );
}
