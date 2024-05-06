import React, { useEffect } from "react";
import { useSession, useUser } from "@clerk/clerk-react";

const AfterSignUp = () => {
  //   const { isSignedIn, user } = useUser();
  const { isSignedIn, session } = useSession();

  console.log("Session:", session);

//   useEffect(() => {
//     if (isSignedIn && user) {
//       // Aquí puedes hacer una llamada API a tu backend
//       createUserInBackend(userId);
//     }
//   }, [isSignedIn, user]);

  const createUserInBackend = async (user) => {
    try {
      const response = await fetch("http://localhost:8080/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.sessionToken}`,
        },
        body: JSON.stringify({
          clerkUserId: userId,
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

  return null; // Este componente no necesita renderizar nada
};

export default AfterSignUp;
