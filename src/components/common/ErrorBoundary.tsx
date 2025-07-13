import React from "react";
import { Box, Typography, Button, Card, CardContent } from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            p: 3,
            backgroundColor: "background.default",
          }}
        >
          <Card sx={{ maxWidth: 500, width: "100%" }}>
            <CardContent sx={{ textAlign: "center", p: 4 }}>
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                color="error"
              >
                Oops! Something went wrong
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                We encountered an unexpected error. Please try refreshing the
                page.
              </Typography>
              {this.state.error && (
                <Typography
                  variant="caption"
                  component="pre"
                  sx={{
                    backgroundColor: "grey.100",
                    p: 2,
                    borderRadius: 1,
                    mb: 2,
                    textAlign: "left",
                    fontSize: "0.75rem",
                    overflow: "auto",
                    maxHeight: 200,
                  }}
                >
                  {this.state.error.message}
                </Typography>
              )}
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={() => window.location.reload()}
                sx={{ mr: 1 }}
              >
                Refresh Page
              </Button>
              <Button variant="outlined" onClick={this.handleReset}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
