import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";

export default function AdminNavbarBreadcrumbs() {
  const location = useLocation();
  const navigate = useNavigate();

  const pathnames = location.pathname.split("/").filter((x) => x);

  const breadcrumbNameMap: { [key: string]: string } = {
    admin: "Admin",
    modules: "Module Management",
    subscriptions: "Subscriptions",
    organizations: "Organizations",
    customers: "Customers",
    "whatsapp-templates": "WhatsApp Templates",
    "lead-management": "Lead Management",
    chat: "Admin Chat",
    analytics: "Analytics",
    users: "Users",
    settings: "Settings",
    help: "Help",
    profile: "Profile",
  };

  return (
    <Breadcrumbs
      aria-label="admin breadcrumb"
      separator={<NavigateNextRoundedIcon fontSize="small" />}
      sx={{ color: "text.secondary" }}
    >
      <Link
        underline="hover"
        sx={{ display: "flex", alignItems: "center" }}
        color="inherit"
        onClick={() => navigate("/")}
        style={{ cursor: "pointer" }}
      >
        Home
      </Link>
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const displayName =
          breadcrumbNameMap[value] ||
          value.charAt(0).toUpperCase() + value.slice(1);

        return last ? (
          <Typography color="primary" key={to}>
            {displayName}
          </Typography>
        ) : (
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate(to)}
            key={to}
            style={{ cursor: "pointer" }}
          >
            {displayName}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}
