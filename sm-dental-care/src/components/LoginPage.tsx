import React, { useState, useEffect} from "react";
import { useNavigate, Link,useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "../css/index.css";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setUsername('');
    setPassword('');
  // Show toast if "showToast" is passed in the location state
  if (location.state?.showToast) {
    toast.success("Registration successful! You can now log in.", { autoClose: 3000 });
   // Prevent duplicate toasts
  }
}, [location.state]);

 


  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await window.electronAPI.login({ username, password });

      if (response.success) {
        if (response.token) {
          localStorage.setItem('token', response.token);
          if (response.username) {
            localStorage.setItem("username", response.username); // ✅ Store username safely
          } else {
            console.warn("Username is undefined, skipping localStorage set.");
          }
          navigate("/dashboard", { replace: true });
        } else {
          // alert("Token not received, login failed.");
          toast.error("Login failed: No token received.");
        }
      } else {
        // alert("Invalid credentials. Please try again.");
        toast.error(response.message || "Invalid credentials.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      // alert("An error occurred. Please try again later.");
      toast.error("An error occurred. Please try again.");
    } finally {
      setUsername(""); // Clear input fields on error
      setPassword("");
    }

  };

  return (
    <div className="bg-[#B2AA8E] min-h-screen flex items-center justify-center p-6">
      <div className="bg-[#afa372] p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-3xl font-extrabold text-center text-[#0C1B33] mb-6">Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="form-group">
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C1B33]"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C1B33]"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full py-3 bg-[#0C1B33] text-white font-semibold rounded-lg hover:bg-[#1d3c6e] transition-all duration-200"
          >
            Login
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-gray-600">Don't have an account? <Link to="/register" className="text-[#0C1B33] hover:text-[#1d3c6e]">Register here</Link></p>
        </div>
      </div>
    </div>
  );  
};

export default LoginPage;
