import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

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
        <Button onClick={handleLogout}>Logout</Button>
      </div>
    </div>
  );
}

export default Home;
