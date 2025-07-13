import * as React from "react";
import { styled } from "@mui/material/styles";
import Divider, { dividerClasses } from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MuiMenuItem from "@mui/material/MenuItem";
import { paperClasses } from "@mui/material/Paper";
import { listClasses } from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import UnfoldMoreRoundedIcon from "@mui/icons-material/UnfoldMoreRounded";
import BusinessIcon from "@mui/icons-material/Business";

const MenuItem = styled(MuiMenuItem)({
  margin: "2px 0",
});

export default function AdminSelectCompany() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <React.Fragment>
      <IconButton
        onClick={handleClick}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          borderRadius: "8px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          "&:hover": {
            bgcolor: "grey.100",
          },
          "&:focus-visible": {
            bgcolor: "action.focus",
          },
        }}
      >
        <AdminPanelSettingsIcon sx={{ color: "secondary.main" }} />
        <ListItemText
          primary={
            <Typography variant="body2" sx={{ fontWeight: 500, ml: 1 }}>
              Admin Panel
            </Typography>
          }
          secondary={
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", ml: 1 }}
            >
              System Management
            </Typography>
          }
          sx={{ my: 0 }}
        />
        <UnfoldMoreRoundedIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        id="admin-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        sx={{
          [`& .${listClasses.root}`]: {
            "& > li": {
              borderRadius: "0.5rem",
            },
          },
          [`& .${paperClasses.root}`]: {
            padding: 0,
          },
          [`& .${dividerClasses.root}`]: {
            margin: "4px -4px",
          },
        }}
      >
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <BusinessIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Acme Corp" secondary="Current Organization" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <AdminPanelSettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Admin Settings"
            secondary="Manage admin panel"
          />
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}
