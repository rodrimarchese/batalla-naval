import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const AppLayout: React.FC = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* <Navbar /> */}
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />{" "}
          {/* se renderizan los componentes de las rutas anidadas en el router que este este layout */}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
