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
    console.log("Response:", response);
    const data = await response.json();
    return data.yourData;
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
  const [games, setGames] = useState([]);
  const { user } = useUser();
  const navigate = useNavigate();

  console.log("Games:", games);

  useEffect(() => {
    const fetchGames = async () => {
      const data = await api.getGames();
      setGames(
          data.map((game: Game) => ({
            id: game.id,
            hostName: game.host.name,
            status: game.status === 'pending' ? 'Esperando oponente' : game.status,
            createdAt: new Date(game.createdAt).toLocaleString(),
          }))
      );
    };

    fetchGames();
  }, []);

  const joinGame = async (gameIdToSend: string) => {
    if (!user) {
      return;
    }
    try {
      const data = await api.joinGame({
        userId: user.id,
        gameId: gameIdToSend,
      });
      console.log("Data:", data);

      const gameId = data.yourData.id;

      if (gameId) {
        console.log("Game joined:", gameId);
        // redirect to /game/:gameId
        // ACA no quiero redirigir. quiero hacer que escuche el websocket.
        // una vez que se conecta, directo lo redirijo a /game/:gameId con el juego en marcha
        navigate(`/game/${gameId}`);
      }
    } catch (error) {
      console.error("Error joining game:", error);
    }
  };

  const columns = [
    // {
    //   title: "ID Partida",
    //   dataIndex: "id",
    //   key: "id",
    // },
    {
      title: "Jugador",
      dataIndex: "hostName",
      key: "hostName",
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
    },
    {
      title: "Acciones",
      key: "actions",
      render: (record: {
        id: string;
        hostName: string;
        status: string;
        createdAt: string;
      }) => {
        console.log("Record:", record);

        return (
            <Button onClick={() => joinGame(record.id)} type="primary">
              Unirse
            </Button>
        );
      },
    },
  ];

  return (
      <div>
        <div className="flex flex-row justify-between mr-10">
          <h1 className="m-5 font-bold text-3xl">Partidas</h1>
          <Link to="/games/new">
            <Button type="primary" className="mt-4">
              Nueva partida
            </Button>
          </Link>
        </div>
        <Table columns={columns} dataSource={games} pagination={false} />
        <Outlet />
      </div>
  );
};

export default Games;

