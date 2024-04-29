import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import WebSocketClient from "../components/WebSocketClient";

function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div
      className="felx w-full"
      //  className="flex justify-center items-center h-screen"
    >
      <div>
        <h1 className="text-3xl"> Home</h1>
        <p>Welcome to the home page</p>

        <Button type="primary" className="mt-4">
          Play
        </Button>
        <WebSocketClient url="ws://localhost:8080" />
        <Button onClick={handleLogout}>Logout</Button>
      </div>
    </div>
  );
}

export default Home;
