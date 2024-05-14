import React, { useEffect, useState } from "react";
import { Button, Table } from "antd";
import { Link, Outlet } from "react-router-dom";

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
};

const Games: React.FC = () => {
  const [games, setGames] = useState([]);

  console.log("Games:", games);

  useEffect(() => {
    const fetchGames = async () => {
      const data = await api.getGames();
      setGames(
        data.map((game: Game) => ({
          id: game.id,
          hostName: game.host.name,
          status: game.status,
          createdAt: new Date(game.createdAt).toLocaleString(),
        }))
      );
    };

    fetchGames();
  }, []);

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
