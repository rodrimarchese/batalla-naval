import React from "react";
import { Table } from "antd";

const History: React.FC = () => {
  // Definir las columnas para la tabla de Ant Design
  const columns = [
    {
      title: "Partida ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Jugador",
      dataIndex: "player",
      key: "player",
    },
    {
      title: "Puntuación",
      dataIndex: "score",
      key: "score",
    },
    {
      title: "Fecha",
      dataIndex: "date",
      key: "date",
    },
  ];

  // Datos ficticios de partidas
  const data = [
    {
      key: "1",
      id: 1,
      player: "Jugador 1",
      score: 320,
      date: "2022-10-01",
    },
    {
      key: "2",
      id: 2,
      player: "Jugador 2",
      score: 420,
      date: "2022-10-02",
    },
    {
      key: "3",
      id: 3,
      player: "Jugador 3",
      score: 215,
      date: "2022-10-03",
    },
    {
      key: "4",
      id: 4,
      player: "Jugador 4",
      score: 388,
      date: "2022-10-04",
    },
  ];

  return (
    <div>
      <h2>Historial de Partidas</h2>
      <Table columns={columns} dataSource={data} pagination={false} />
    </div>
  );
};

export default History;
