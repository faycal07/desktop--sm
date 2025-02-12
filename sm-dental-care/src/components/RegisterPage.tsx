import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/index.css";
import { Link } from "react-router-dom"; 
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
      alert("Passwords do not match!");
      return;
    }
  
    try {
      const response = await window.electronAPI.register({ name,username, password });
      console.log("Registration Response:", response); // Debug log
  
      if (response.success) {
        localStorage.removeItem("token"); 
          // Afficher un toast après une inscription réussie
         
          navigate("/login", { state: { showToast: true }, replace: true });

       
      } else {
        alert(response.message || "Registration failed. Please try again.");
      }
    } catch (error) { 
      console.error("Error during registration:", error);
      alert("An error occurred. Please try again later.");
    }
  }; 
  




  return (
    <div className="bg-[#f5f5dc] min-h-screen flex items-center justify-center p-6">
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
      <h1 className="text-3xl font-extrabold text-center text-[#6a994e] mb-6">Register</h1>
      <form onSubmit={handleRegister} className="space-y-4">

      <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6a994e]"
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6a994e]"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6a994e]"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6a994e]"
        />
        <button 
          type="submit"
          className="w-full py-3 bg-[#6a994e] text-white font-semibold rounded-lg hover:bg-[#4c7b37] transition-all duration-200"
        >
          Register
        </button>
      </form>
      <div className="mt-4 text-center">
        <p className="text-gray-600">Already have an account? <Link to="/login" className="text-[#6a994e] hover:text-[#4c7b37]">Login here</Link></p>
      </div>
    </div>
  </div>
  
  
  );
};
 
export default RegisterPage;
