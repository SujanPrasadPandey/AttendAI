import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Retrieve the username from location state or local storage
  const initialUsername =
    location.state?.username || localStorage.getItem("username");
  const [username, setUsername] = useState<string | null>(initialUsername);

  useEffect(() => {
    if (!username) {
      navigate("/signin");
    }
  }, [username, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    navigate("/signin");
  };

  if (!username) {
    return null;
  }

  return (
    <div className="flex h-screen">
      <div className="Navbar w-1/6 justify-center items-center flex">
        <p>navbar</p>
      </div>

      <div className="bg-mainBox flex-1 flex p-3 m-2 rounded-md space-x-5">
        <div className="w-[194px] h-[254px] bg-[#385167] rounded-md flex justify-center items-center">
          <p>{username}</p>
        </div>
        <div className="flex flex-col justify-center items-center space-y-4">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
