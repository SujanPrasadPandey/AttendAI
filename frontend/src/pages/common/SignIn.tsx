import { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "@/utils/supabase";

const SignIn: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else if (data?.user) {
      setError("");
      navigate("/dashboard", { state: { email: data.user.email } });
    }
  };

  return (
    <div>
      <h1>Sign In</h1>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handleSignIn}>Sign In</button>
    </div>
  );
};

export default SignIn;





// import { useState } from "react";
// import supabase from "@/utils/supabase";

// const SignIn: React.FC = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   const handleSignIn = async () => {
//     const { error } = await supabase.auth.signInWithPassword({ email, password });
//     if (error) {
//       setError(error.message);
//     } else {
//       alert("Sign-in successful!");
//       // Redirect or handle authenticated user
//     }
//   };

//   return (
//     <div>
//       <h1>Sign In</h1>
//       <div>
//         <label>Email:</label>
//         <input
//           type="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />
//       </div>
//       <div>
//         <label>Password:</label>
//         <input
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />
//       </div>
//       {error && <p style={{ color: "red" }}>{error}</p>}
//       <button onClick={handleSignIn}>Sign In</button>
//     </div>
//   );
// };

// export default SignIn;
