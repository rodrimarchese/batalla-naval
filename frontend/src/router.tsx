// router.tsx
import { createBrowserRouter, Navigate } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import Home from "./pages/Home";
import Games from "./pages/Games";
import NewGame from "./pages/NewGame"; // Importa el nuevo componente aquí
import SignInPage from "./pages/SignIn";
import SignUpPage from "./pages/SignUp";
import AuthWrapper from "./AuthWrapper";
import GamePage from "./pages/GamePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { path: "sign-in", element: <SignInPage /> },
      { path: "sign-up", element: <SignUpPage /> },
      {
        path: "/",
        element: (
          <AuthWrapper>
            <DashboardLayout />
          </AuthWrapper>
        ),
        children: [
          { path: "/", element: <Navigate to="home" replace /> },
          { path: "home", element: <Home /> },
          {
            path: "games",
            element: <Games />,
          },
          { path: "games/new", element: <NewGame /> },
          { path: "game/:gameId", element: <GamePage /> },
        ],
      },
      { path: "*", element: <Navigate to="/home" replace /> },
    ],
  },
]);
