import { Button } from "antd";
import { useNavigate, Link } from "react-router-dom";
import WebSocketClient from "../components/WebSocketClient";

function Home() {
  return (
    <div
      className="felx w-full"
      //  className="flex justify-center items-center h-screen"
    >
      <div>
        <h1 className="text-3xl"> Home</h1>
        <p>Welcome to the home page</p>

        <Link to="/games/new">
          <Button type="primary" className="mt-4">
            Nueva partida
          </Button>
        </Link>

        {/* <WebSocketClient url="ws://localhost:8080" /> */}
      </div>
    </div>
  );
}

export default Home;
