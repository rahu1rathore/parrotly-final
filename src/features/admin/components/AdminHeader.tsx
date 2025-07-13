import * as React from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import MenuButton from "../../../features/dashboard/components/MenuButton";
import ColorModeIconDropdown from "../../../themes/ColorModeIconDropdown";
import AdminNavbarBreadcrumbs from "./AdminNavbarBreadcrumbs";
import AdminSearch from "./AdminSearch";
import Button from "@mui/material/Button";
import RefreshIcon from "@mui/icons-material/Refresh";

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function AdminHeader({
  title = "Admin Dashboard",
  subtitle = "Manage your application settings and configurations",
}: AdminHeaderProps) {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <Stack
      direction="row"
      sx={{
        display: { xs: "none", md: "flex" },
        width: "100%",
        alignItems: { xs: "flex-start", md: "center" },
        justifyContent: "space-between",
        maxWidth: { sm: "100%", md: "1700px" },
        pt: 1.5,
      }}
      spacing={2}
    >
      <Stack direction="column" spacing={1}>
        <AdminNavbarBreadcrumbs />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Stack>
      <Stack direction="row" sx={{ gap: 1 }}>
        <AdminSearch />
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
        <MenuButton showBadge aria-label="Open notifications">
          <NotificationsRoundedIcon />
        </MenuButton>
        <ColorModeIconDropdown />
      </Stack>
    </Stack>
  );
}
