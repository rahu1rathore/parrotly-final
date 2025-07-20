import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Paper,
  Stack,
  IconButton,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Support as SupportIcon,
  Star as StarIcon,
  ArrowForward as ArrowForwardIcon,
  Dashboard as DashboardIcon,
  Business as BusinessIcon,
  Analytics as AnalyticsIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  GitHub as GitHubIcon,
} from "@mui/icons-material";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <DashboardIcon className="w-8 h-8 text-blue-600" />,
      title: "Powerful Dashboard",
      description: "Get real-time insights with our comprehensive analytics dashboard and reporting tools.",
    },
    {
      icon: <BusinessIcon className="w-8 h-8 text-green-600" />,
      title: "Business Management",
      description: "Streamline your operations with integrated CRM, task management, and customer tracking.",
    },
    {
      icon: <AnalyticsIcon className="w-8 h-8 text-purple-600" />,
      title: "Advanced Analytics",
      description: "Make data-driven decisions with detailed reports and performance analytics.",
    },
    {
      icon: <SecurityIcon className="w-8 h-8 text-red-600" />,
      title: "Enterprise Security",
      description: "Bank-level security with encrypted data, secure authentication, and compliance standards.",
    },
    {
      icon: <SpeedIcon className="w-8 h-8 text-orange-600" />,
      title: "Lightning Fast",
      description: "Optimized performance with real-time updates and instant data synchronization.",
    },
    {
      icon: <SupportIcon className="w-8 h-8 text-indigo-600" />,
      title: "24/7 Support",
      description: "Get help when you need it with our dedicated support team and comprehensive documentation.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CEO, TechCorp",
      avatar: "S",
      content: "This platform transformed our business operations. The dashboard insights are incredible and the customer management features are exactly what we needed.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Operations Manager, StartupXYZ",
      avatar: "M",
      content: "The analytics capabilities helped us increase our revenue by 40% in just 6 months. The interface is intuitive and the support team is outstanding.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Product Director, InnovateNow",
      avatar: "E",
      content: "Best investment we've made for our company. The automation features save us hours every day and the reporting gives us clear visibility into our performance.",
      rating: 5,
    },
  ];

  const clientLogos = [
    { name: "TechCorp", logo: "TC" },
    { name: "InnovateNow", logo: "IN" },
    { name: "StartupXYZ", logo: "SX" },
    { name: "GlobalTech", logo: "GT" },
    { name: "FutureWorks", logo: "FW" },
    { name: "NextGen Solutions", logo: "NG" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <Container maxWidth="lg">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <DashboardIcon className="w-5 h-5 text-white" />
              </div>
              <Typography variant="h6" className="font-bold text-gray-900">
                BusinessHub
              </Typography>
            </div>
            <div className="hidden md:flex space-x-8">
              <Button color="inherit" className="text-gray-600 hover:text-gray-900">
                Features
              </Button>
              <Button color="inherit" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Button>
              <Button color="inherit" className="text-gray-600 hover:text-gray-900">
                About
              </Button>
              <Button color="inherit" className="text-gray-600 hover:text-gray-900">
                Contact
              </Button>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outlined"
                onClick={() => navigate("/login")}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate("/demo")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Get Started
              </Button>
            </div>
          </div>
        </Container>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Container maxWidth="lg">
          <div className="text-center max-w-4xl mx-auto">
            <Typography
              variant="h1"
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Streamline Your Business with{" "}
              <span className="text-blue-600">Smart Solutions</span>
            </Typography>
            <Typography
              variant="h5"
              className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto"
            >
              Powerful CRM, analytics, and business management tools designed to help you grow faster, work smarter, and achieve more.
            </Typography>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/demo")}
                endIcon={<ArrowForwardIcon />}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-4 text-lg"
              >
                Start Free Trial
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate("/admin")}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg"
              >
                View Demo
              </Button>
            </div>
            <div className="mt-12">
              <Typography variant="body2" className="text-gray-500 mb-4">
                Trusted by 10,000+ businesses worldwide
              </Typography>
              <div className="flex flex-wrap justify-center items-center gap-8">
                {clientLogos.map((client) => (
                  <div key={client.name} className="flex items-center space-x-2 opacity-60">
                    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                      <Typography variant="caption" className="font-bold text-gray-600">
                        {client.logo}
                      </Typography>
                    </div>
                    <Typography variant="body2" className="text-gray-500 font-medium">
                      {client.name}
                    </Typography>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <Container maxWidth="lg">
          <div className="text-center mb-16">
            <Typography variant="h2" className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to succeed
            </Typography>
            <Typography variant="h6" className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive business tools that adapt to your workflow and scale with your growth.
            </Typography>
          </div>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border border-gray-100">
                  <CardContent className="p-8">
                    <div className="mb-4">{feature.icon}</div>
                    <Typography variant="h6" className="font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <Container maxWidth="lg">
          <div className="text-center mb-16">
            <Typography variant="h2" className="text-4xl font-bold text-gray-900 mb-4">
              What our customers say
            </Typography>
            <Typography variant="h6" className="text-xl text-gray-600">
              Don't just take our word for it - hear from businesses that have transformed their operations.
            </Typography>
          </div>
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper className="p-6 h-full hover:shadow-lg transition-shadow duration-300">
                  <div className="mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="w-5 h-5 text-yellow-400" />
                    ))}
                  </div>
                  <Typography variant="body1" className="text-gray-700 mb-6 italic leading-relaxed">
                    "{testimonial.content}"
                  </Typography>
                  <div className="flex items-center">
                    <Avatar className="w-12 h-12 bg-blue-600 text-white mr-4">
                      {testimonial.avatar}
                    </Avatar>
                    <div>
                      <Typography variant="subtitle1" className="font-semibold text-gray-900">
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        {testimonial.role}
                      </Typography>
                    </div>
                  </div>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <Container maxWidth="lg">
          <div className="text-center text-white">
            <Typography variant="h2" className="text-4xl font-bold mb-4">
              Ready to transform your business?
            </Typography>
            <Typography variant="h6" className="text-xl mb-8 opacity-90">
              Join thousands of companies using BusinessHub to streamline operations and drive growth.
            </Typography>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/demo")}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg"
              >
                Start Free Trial
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate("/login")}
                className="border-white text-white hover:bg-blue-700 px-8 py-4 text-lg"
              >
                Sign In
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <DashboardIcon className="w-5 h-5 text-white" />
                </div>
                <Typography variant="h6" className="font-bold">
                  BusinessHub
                </Typography>
              </div>
              <Typography variant="body1" className="text-gray-400 mb-6 leading-relaxed">
                Empowering businesses with intelligent tools for growth, efficiency, and success. Transform your operations today.
              </Typography>
              <Stack direction="row" spacing={2}>
                <IconButton className="text-gray-400 hover:text-white">
                  <TwitterIcon />
                </IconButton>
                <IconButton className="text-gray-400 hover:text-white">
                  <LinkedInIcon />
                </IconButton>
                <IconButton className="text-gray-400 hover:text-white">
                  <GitHubIcon />
                </IconButton>
              </Stack>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="h6" className="font-semibold mb-4">
                Product
              </Typography>
              <Stack spacing={2}>
                <Button color="inherit" className="text-gray-400 hover:text-white text-left justify-start p-0">
                  Features
                </Button>
                <Button color="inherit" className="text-gray-400 hover:text-white text-left justify-start p-0">
                  Pricing
                </Button>
                <Button color="inherit" className="text-gray-400 hover:text-white text-left justify-start p-0">
                  Security
                </Button>
                <Button color="inherit" className="text-gray-400 hover:text-white text-left justify-start p-0">
                  Integrations
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="h6" className="font-semibold mb-4">
                Company
              </Typography>
              <Stack spacing={2}>
                <Button color="inherit" className="text-gray-400 hover:text-white text-left justify-start p-0">
                  About Us
                </Button>
                <Button color="inherit" className="text-gray-400 hover:text-white text-left justify-start p-0">
                  Careers
                </Button>
                <Button color="inherit" className="text-gray-400 hover:text-white text-left justify-start p-0">
                  Blog
                </Button>
                <Button color="inherit" className="text-gray-400 hover:text-white text-left justify-start p-0">
                  Press
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="h6" className="font-semibold mb-4">
                Resources
              </Typography>
              <Stack spacing={2}>
                <Button color="inherit" className="text-gray-400 hover:text-white text-left justify-start p-0">
                  Documentation
                </Button>
                <Button color="inherit" className="text-gray-400 hover:text-white text-left justify-start p-0">
                  Help Center
                </Button>
                <Button color="inherit" className="text-gray-400 hover:text-white text-left justify-start p-0">
                  Community
                </Button>
                <Button color="inherit" className="text-gray-400 hover:text-white text-left justify-start p-0">
                  Contact
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="h6" className="font-semibold mb-4">
                Legal
              </Typography>
              <Stack spacing={2}>
                <Button color="inherit" className="text-gray-400 hover:text-white text-left justify-start p-0">
                  Privacy Policy
                </Button>
                <Button color="inherit" className="text-gray-400 hover:text-white text-left justify-start p-0">
                  Terms of Service
                </Button>
                <Button color="inherit" className="text-gray-400 hover:text-white text-left justify-start p-0">
                  Cookie Policy
                </Button>
                <Button color="inherit" className="text-gray-400 hover:text-white text-left justify-start p-0">
                  GDPR
                </Button>
              </Stack>
            </Grid>
          </Grid>
          <div className="border-t border-gray-800 mt-12 pt-8">
            <Typography variant="body2" className="text-center text-gray-400">
              © 2024 BusinessHub. All rights reserved. Built with ❤️ for modern businesses.
            </Typography>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default LandingPage;
