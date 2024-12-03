import { Outlet, useNavigate } from "react-router-dom";
import { ClerkProvider, SignedIn } from "@clerk/clerk-react";
import Navbar from "../components/Navbar";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

export default function RootLayout() {

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <header className="bg-blue-700 text-white py-4">
        <div className=" px-4 flex justify-between items-center">
          <div>
            <p className="text-xl font-bold">Battleship</p>
          </div>
          <div>
            <SignedIn>
              <Navbar />
            </SignedIn>
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </ClerkProvider>
  );
}
