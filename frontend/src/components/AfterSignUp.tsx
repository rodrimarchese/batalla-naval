import React, { useEffect } from "react";
import { useSession, useUser } from "@clerk/clerk-react";

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

if (!VITE_BACKEND_URL) {
  throw new Error("Missing VITE_BACKEND_URL");
}

const AfterSignUp = () => {
  const { isSignedIn, user } = useUser();
  const { session } = useSession();
  // const { isSignedIn, session } = useSession();

  console.log("Session:", user);

  //   useEffect(() => {
  //     if (isSignedIn && user) {
  //       // Aquí puedes hacer una llamada API a tu backend
  //       createUserInBackend(userId);
  //     }
  //   }, [isSignedIn, user]);

  useEffect(() => {
    if (isSignedIn && user) {
      const createUserInBackend = async () => {
        try {
          const response = await fetch(`${VITE_BACKEND_URL}/user`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session}`,
            },
            body: JSON.stringify({
              clerkUserId: user.id,
              // Otros datos necesarios
            }),
          });
          if (!response.ok) {
            throw new Error("Failed to create user in backend");
          }
          const data = await response.json();
          console.log("User created in backend:", data);
        } catch (error) {
          console.error("Error creating user in backend:", error);
        }
      };
      // Aquí puedes hacer una llamada API a tu backend
      createUserInBackend();
    }
  }, [isSignedIn, user, session]);

  return null; // Este componente no necesita renderizar nada
};

export default AfterSignUp;
