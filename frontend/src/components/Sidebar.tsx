import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="w-64 h-full bg-gray-800 text-white p-4">
      <div className="font-bold text-lg mb-6">Menu</div>
      <ul>
        <li>
          <Link
            to="/home"
            className="block px-4 py-2 hover:bg-gray-700 transition-colors"
          >
            Play
          </Link>
        </li>
        <li>
          <Link
            to="/history"
            className="block px-4 py-2 hover:bg-gray-700 transition-colors"
          >
            History
          </Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
