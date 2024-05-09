// AuthWrapper.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

interface AuthWrapperProps {
  children: React.ReactNode; // Definir que los hijos pueden ser cualquier elemento React válido.
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { isSignedIn, isLoaded } = useUser();
  const location = useLocation();

  if (!isLoaded) {
    // Podrías mostrar un spinner o cualquier otro indicador de carga aquí.
    return <div>Cargando...</div>;
  }

  // Redirige al usuario a la página de inicio de sesión si no está autenticado
  if (!isSignedIn) {
    // 'to' podría ser un objeto para mantener el estado de la ubicación previa
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // Si el usuario está autenticado, renderiza los componentes hijos.
  return <>{children}</>;
};

export default AuthWrapper;
