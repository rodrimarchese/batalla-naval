import { SignUp, useUser } from "@clerk/clerk-react";

export default function SignUpPage() {
  // const handleAfterSignUp = async (user) => {
  //   // Aquí podrías hacer una llamada a tu API backend para crear el usuario en tu DB
  //   // o para realizar cualquier otra operación post-registro.
  //   try {
  //     const response = await fetch("http://localhost:8080/api/users", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${user.sessionToken}`,
  //       },
  //       body: JSON.stringify({
  //         clerkUserId: user.id,
  //         // Agrega cualquier otra información que necesites enviar
  //       }),
  //     });
  //     const data = await response.json();
  //     console.log("Backend user created:", data);
  //   } catch (error) {
  //     console.error("Error al crear usuario en backend:", error);
  //   }
  // };

  return <SignUp path="/sign-up" fallbackRedirectUrl={"/home"} />;
}
