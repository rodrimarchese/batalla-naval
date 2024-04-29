import { UserButton } from "@clerk/clerk-react";
import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div>
      <Link
        to="/home"
        className="px-4 py-2 hover:bg-blue-900 transition-colors"
      >
        Home
      </Link>
      <Link
        to="/profile"
        className="px-4 py-2 hover:bg-blue-900 transition-colors mr-5"
      >
        Profile
      </Link>

      <UserButton afterSignOutUrl="/sign-in" />
    </div>
  );
};

export default Navbar;
