import React, { useEffect, useState } from "react";
import { Button, Table } from "antd";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

type Game = {
  id: string;
  host: User;
  guest?: User;
  status: string;
  createdAt: string;
};

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

if (!VITE_BACKEND_URL) {
  throw new Error("Missing VITE_BACKEND_URL");
}

const api = {
  getGames: async () => {
    const response = await fetch(`${VITE_BACKEND_URL}/game/pending`);
    const data = await response.json();
    return data.yourData;
  },
  getOnGoingGames: async (userId: string) => {
    const response = await fetch(`${VITE_BACKEND_URL}/game/me/${userId}`);
    const data = await response.json();
    return data;
  },
  joinGame: async ({ userId, gameId }: { gameId: string; userId: string }) => {
    const response = await fetch(`${VITE_BACKEND_URL}/game/addMe`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        gameId,
        userId,
      }),
    });
    const data = await response.json();
    return data;
  },
};

const Games: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [ongoingGame, setOngoingGame] = useState<Game | null>(null);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        // Fetch ongoing games for the user
        const ongoingGamesData = user ? await api.getOnGoingGames(user.id) : null;
        if (ongoingGamesData && ongoingGamesData.length > 0) {
          const ongoingGameData = ongoingGamesData[0];
          const ongoingGameNormalized: Game = {
            id: ongoingGameData.id,
            host: {
              id: ongoingGameData.host_id,
              name: ongoingGameData.host_id === user?.id ? "Host (Tú)" : "Host", // Mostrar "Tú" si es el usuario actual
              email: "",
              createdAt: "",
              updatedAt: "",
            },
            guest: ongoingGameData.guest_id
                ? {
                  id: ongoingGameData.guest_id,
                  name: ongoingGameData.guest_id === user?.id ? "Guest (Tú)" : "Guest", // Mostrar "Tú" si es el usuario actual
                  email: "",
                  createdAt: "",
                  updatedAt: "",
                }
                : undefined,
            status: ongoingGameData.status,
            createdAt: ongoingGameData.created_at,
          };
          setOngoingGame(ongoingGameNormalized);
        } else {
          setOngoingGame(null);
        }

        // Fetch all games, including pending
        const data = await api.getGames();

        // Normalizar datos
        const normalizedGames: Game[] = [
          ...data.map((game: Game) => ({
            id: game.id,
            host: game.host,
            guest: game.guest,
            status: game.status === 'pending' ? 'Esperando oponente' : game.status,
            createdAt: game.createdAt,
          })),
          ...(ongoingGamesData?.map((game: any) => ({
            id: game.id,
            host: {
              id: game.host_id,
              name: game.host_id === user?.id ? "Host (Tú)" : "Host", // Mostrar "Tú" si es el usuario actual
              email: "",
              createdAt: "",
              updatedAt: "",
            },
            guest: game.guest_id
                ? {
                  id: game.guest_id,
                  name: game.guest_id === user?.id ? "Guest (Tú)" : "Guest", // Mostrar "Tú" si es el usuario actual
                  email: "",
                  createdAt: "",
                  updatedAt: "",
                }
                : undefined,
            status: game.status,
            createdAt: game.created_at,
          })) || []),
        ];

        setGames(normalizedGames);
      } catch (error) {
        console.error("Error fetching games:", error);
      }
    };

    fetchGames();
  }, [user]);

  const joinGame = async (gameIdToSend: string) => {
    if (!user) {
      return;
    }
    try {
      const data = await api.joinGame({
        userId: user.id,
        gameId: gameIdToSend,
      });
      const gameId = data.yourData.id;

      if (gameId) {
        console.log("Game joined:", gameId);
        // Aquí escuchamos el websocket antes de redirigir
        navigate(`/game/${gameId}`);
      }
    } catch (error) {
      console.error("Error joining game:", error);
    }
  };

  const columns = [
    {
      title: "Jugador",
      dataIndex: "host",
      key: "hostName",
      render: (host: User, record: Game) => (
          <span style={{ color: host.id === user?.id ? "blue" : "black" }}>
          {host.id === user?.id ? "Tú (Host)" : record.guest && record.guest.id === user?.id ? "Tú (Guest)" : host.name}
        </span>
      ),
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Fecha",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt: string) => new Date(createdAt).toLocaleString(),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (record: Game) => {
        // Verificar si el usuario ya está en el juego
        const isUserInGame = record.host.id === user?.id || record.guest?.id === user?.id;

        // Mostrar el botón "Volver" si el usuario ya está en un juego activo
        if (ongoingGame && ongoingGame.id === record.id) {
          return (
              <Button onClick={() => navigate(`/game/${record.id}`)} type="default" style={{ backgroundColor: "#4caf50", borderColor: "#4caf50", color: "white" }}>
                Volver
              </Button>
          );
        }

        // Mostrar el botón "Unirse" solo si el usuario no es parte del juego y el juego está pendiente
        if (!isUserInGame && record.status === 'Esperando oponente') {
          return (
              <Button onClick={() => joinGame(record.id)} type="primary">
                Unirse
              </Button>
          );
        }

        return null; // No mostrar nada si el usuario ya está en el juego o si el estado no es "Esperando oponente"
      },
    },
  ];

  return (
      <div>
        <div className="flex flex-row justify-between mr-10">
          <h1 className="m-5 font-bold text-3xl">Partidas</h1>
          {/* Deshabilitar el botón "Nueva partida" si hay un juego en curso */}
          <Link to="/games/new">
            <Button type="primary" className="mt-4" disabled={!!ongoingGame}>
              Nueva partida
            </Button>
          </Link>
        </div>
        <Table columns={columns} dataSource={games} pagination={false} rowKey="id" />
        <Outlet />
      </div>
  );
};

export default Games;
