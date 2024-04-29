import * as React from "react";
import { useAuth, useSession } from "@clerk/clerk-react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout() {
  const { userId, isLoaded } = useAuth();
  const { isSignedIn, session } = useSession();

  console.log("Session:", session);
  console.log("isSignedIn:", isSignedIn);

  const navigate = useNavigate();

  console.log(userId);

  React.useEffect(() => {
    if (isLoaded && !userId) {
      navigate("/sign-in");
    }
  }, [isLoaded, navigate, userId]);

  if (!isLoaded) return "Loading...";

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}
