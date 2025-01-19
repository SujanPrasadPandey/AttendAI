// v3
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import supabase from "@/utils/supabase";

const Dashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { email } = location.state as { email: string };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Redirect to login page
      navigate("/signin");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Nav bar area */}
      <div className="Navbar w-1/6 justify-center items-center flex">
        <p>navbar</p>
      </div>

      {/* Main Content Box */}
      <div className="bg-mainBox flex-1 flex p-3 m-2 rounded-md space-x-5">
        <div className="w-[194px] h-[254px] bg-[#385167] rounded-md flex justify-center items-center">
          <p>{email}</p>
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




// v2

// import { useLocation } from "react-router-dom";

// interface Props {
//   email: string;
// }

// const Dashboard: React.FC = () => {
//   const location = useLocation();
//   const { email } = location.state as Props;

//   return (
//     <>
//       <div className="flex h-screen">
//         {/* Nav bar area */}
//         <div className="Navbar w-1/6 justify-center items-center flex">
//           <p>Navbar</p>
//         </div>

//         {/* Main Content Box */}
//         <div className="bg-mainBox flex-1 flex p-3 m-2 rounded-md space-x-5">
//           <div className="w-[194px] h-[254px] bg-[#385167] rounded-md flex justify-center items-center">
//             <p>{email}</p>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Dashboard;



// v1

// interface props {
//   email: string,
// }


// const Dashboard = (props: props) => {
//   return (
//     <>
//       <div className="flex h-screen">
//         {/* Nav bar area */}
//         <div className="Navbar w-1/6 justify-center items-center flex">
//           <p>navbar</p>
//         </div>

//         {/* Main Content Box */}
//         <div className="bg-mainBox flex-1 flex p-3 m-2 rounded-md space-x-5">
//           <div className="w-[194px] h-[254px] bg-[#385167] rounded-md flex justify-center items-center">
//             <p>{props.email}</p>
//           </div>
//         </div>
//       </div>
//     </>
//   )
// }

// export default Dashboard