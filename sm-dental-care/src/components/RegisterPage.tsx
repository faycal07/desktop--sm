import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/index.css";
import { Link } from "react-router-dom"; 
import { toast } from "react-toastify";
 // Importer la fonction toast

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

 

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (password !== confirmPassword) {
      // alert("Passwords do not match!");
      toast.error("Passwords do not match!");
      return;
    }
  
    try {
      const response = await window.electronAPI.register({ name,username, password });
      console.log("Registration Response:", response); // Debug log
  
      if (response.success) {
        localStorage.removeItem("token"); 
          // Afficher un toast après une inscription réussie
          toast.success("Registration successful! Redirecting to login...");
         
          navigate("/login", { state: { showToast: true }, replace: true });

       
      } else {
        // alert(response.message || "Registration failed. Please try again.");
        toast.error(response.message || "Registration failed. Please try again");
      }
    } catch (error) { 
      console.error("Error during registration:", error);
      // alert("An error occurred. Please try again later.");
      toast.error("An error occurred. Please try again.");
    }
    finally {
      setName(""); // Reset fields
      setUsername("");
      setPassword("");
      setConfirmPassword("");
    }
  }; 
  




  return (
    <div className="bg-[#B2AA8E] min-h-screen flex items-center justify-center p-6">
    <div className="bg-[#afa372] p-8 rounded-lg shadow-lg w-full max-w-sm">
      <h1 className="text-3xl font-extrabold text-center text-[#0C1B33] mb-6">Register</h1>
      <form onSubmit={handleRegister} className="space-y-4">

      <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C1B33]"
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C1B33]"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C1B33]"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C1B33]"
        />
        <button 
          type="submit"
          className="w-full py-3 bg-[#0C1B33] text-white font-semibold rounded-lg hover:bg-[#1d3c6e] transition-all duration-200"
        >
          Register
        </button>
      </form>
      <div className="mt-4 text-center">
        <p className="text-gray-600">Already have an account? <Link to="/login" className="text-[#0C1B33] hover:text-[#1d3c6e]">Login here</Link></p>
      </div>
    </div>
  </div>
  
  
  );
};
 
export default RegisterPage;
