import React, { useEffect, useState } from 'react';
import "../css/index.css";
import { useNavigate } from "react-router-dom";
import Sidebar from './Sidebar';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState(''); // State to hold the username
  const [loading, setLoading] = useState(true); // Handle loading state during token checks

  useEffect(() => {
    const verifyTokenAndFetchUser = async () => {
      const token = localStorage.getItem('token');
      console.log("Token fetched from localStorage:", token);

      if (!token) {
        console.log("No token found in localStorage. Redirecting to login...");
        setLoading(false); // Stop loading before navigating
        navigate('/login');
        return;
      }

      try {
        const verifyResponse = await window.electronAPI.verifyToken(token);
        console.log("Response from verifyToken API:", verifyResponse);

        if (verifyResponse.success) {
          const userResponse = await window.electronAPI.getUserInfo(token);
          console.log("User response data:", userResponse);

          if (userResponse.success) {
            setName(userResponse.name);
          } else {
            console.error("Failed to fetch user info:", userResponse.message);
            localStorage.removeItem('token');
            navigate('/login');
          }
        } else {
          console.error("Token is invalid or expired.");
          localStorage.removeItem('token');
          navigate('/login');
        }
      } catch (error) {
        console.error("Error while verifying token or fetching user:", error);
        localStorage.removeItem('token'); // Clear token in case of errors
        navigate('/login');
      } finally {
        setLoading(false); // Ensure loading is set to false in all cases
      }
    };

    verifyTokenAndFetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear stored token
    navigate('/');
  };

  // If still loading, show a loading indicator
  if (loading) {
    return <div className="flex bg-[#f5f5dc] min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex bg-[#f5f5dc] min-h-screen">
      {/* Sidebar */}
   
        <Sidebar />
      

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg mx-auto">
          <h1 className="text-4xl font-extrabold text-center text-[#6a994e] mb-6">
            Welcome, {name || 'Guest'}
          </h1>
          <div className="text-center">
            <button
              onClick={handleLogout}
              className="py-3 px-6 bg-[#6a994e] text-white font-semibold rounded-lg hover:bg-[#4c7b37] transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
