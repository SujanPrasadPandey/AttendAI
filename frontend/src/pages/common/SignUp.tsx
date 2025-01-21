import ContactUs from "@/components/landingPage/ContactUs"
import NavbarLandingPage from "@/components/landingPage/NavbarLandingPage"


const SignUp = () => {
  return (
    <>
      <NavbarLandingPage />
      <ContactUs />
    </>
  )
}

export default SignUp

// v1
// import { useState } from "react";
// import supabase from "@/utils/supabase";

// const SignUp: React.FC = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState(false);

//   const handleSignUp = async () => {
//     const { error } = await supabase.auth.signUp({
//       email,
//       password,
//     });
//     if (error) {
//       setError(error.message);
//       setSuccess(false);
//     } else {
//       setError("");
//       setSuccess(true);
//     }
//   };

//   return (
//     <div>
//       <h1>Sign Up</h1>
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
//       {success && <p style={{ color: "green" }}>Sign-up successful! Check your email for confirmation.</p>}
//       <button onClick={handleSignUp}>Sign Up</button>
//     </div>
//   );
// };

// export default SignUp;
