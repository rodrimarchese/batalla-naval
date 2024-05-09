// router.tsx
import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import Home from "./pages/Home";
import History from "./pages/History";
import SignInPage from "./pages/SignIn";
import SignUpPage from "./pages/SignUp";
import AuthWrapper from "./AuthWrapper";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { path: "sign-in", element: <SignInPage /> },
      { path: "sign-up", element: <SignUpPage /> },
      {
        path: "/", // Aquí se maneja directamente el AuthWrapper en la raíz
        element: (
          <AuthWrapper>
            <DashboardLayout />
          </AuthWrapper>
        ),
        children: [
          { path: "/", element: <Navigate to="home" replace /> }, // Redireccionamiento a home
          { path: "home", element: <Home /> }, // Página de inicio como ruta home
          { path: "history", element: <History /> }, // Otra ruta protegida
        ],
      },
      { path: "*", element: <Navigate to="/home" replace /> }, // Redireccionamiento general a home si no coincide ninguna ruta
    ],
  },
]);
