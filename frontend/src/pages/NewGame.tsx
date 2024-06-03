import { useSession, useUser } from "@clerk/clerk-react";
import { Button } from "antd";
import { Link, useNavigate } from "react-router-dom";

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

if (!VITE_BACKEND_URL) {
  throw new Error("Missing VITE_BACKEND_URL");
}

const api = {
  createGame: async ({ hostId }: { hostId: string }) => {
    const response = await fetch(`${VITE_BACKEND_URL}/game/new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        hostId,
      }),
    });
    const data = await response.json();
    return data;
  },
};

const NewGame = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { session } = useSession();

  console.log("Session:", session);
  console.log("User:", user);

  const onCreateGame = async () => {
    if (!user) {
      return;
    }
    try {
      const data = await api.createGame({ hostId: user.id });
      const gameId = data.yourData.id;

      if (gameId) {
        navigate(`/game/${gameId}`);
      }
    } catch (error) {
      console.error("Error creating game:", error);
    }
  };

  console.log("User:", user);
  return (
    <div>
      {/* button to go to /games */}
      <Link to="/games">
        <Button type="default" className="mt-4">
          Volver
        </Button>
      </Link>
      <h1 className="m-5 font-bold text-3xl">Nueva Partida</h1>

      <Button type="primary" className="mt-4" onClick={onCreateGame}>
        Crear nuevo juego
      </Button>
    </div>
  );
};

export default NewGame;
