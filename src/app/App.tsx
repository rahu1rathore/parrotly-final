import * as React from "react";
import { BrowserRouter } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import AppRoutes from "../routes/routes";

export default function App() {
  return (
    <BrowserRouter>
      <CssBaseline enableColorScheme />
      <AppRoutes />
    </BrowserRouter>
  );
}
