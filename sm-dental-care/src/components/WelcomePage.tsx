import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/index.css";

const WelcomePage = () => {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/login");
  };
  const goTosignin = () => {
    navigate("/register");
  };

  return (
<div className="welcome-container">
  <div className="flex flex-col items-center justify-center h-full space-y-6 p-6">

    <div className="flex flex-col space-y-4 mt-36">
    <button 
  className="login-button bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
  onClick={goToLogin}
>
  Log In
</button>
<button 
  className="login-button bg-orange-400 hover:bg-orange-500 text-white font-semibold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
  onClick={goTosignin}
>
  Sign In 
</button>

    </div>
  </div>
</div>


  );
};

export default WelcomePage;
