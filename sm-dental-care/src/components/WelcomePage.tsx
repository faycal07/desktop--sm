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
    {/* <button 
  className="login-button bg-[#1E88E5] hover:bg-[#1565C0] text-white font-semibold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
  onClick={goToLogin}
>
  Log In
</button>
<button 
  className="login-button bg-[#42A5F5] hover:bg-[#1E88E5] text-white font-semibold py-3 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
  onClick={goTosignin}
>
  Sign In 
</button>
 */}
 <button 
            className="bg-[#7b194a] hover:bg-[#46123a] text-white font-semibold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
            onClick={goToLogin}
          >
            Log In
          </button>
          <button 
            className="bg-[#03B5AA] hover:bg-[#028A83] text-white font-semibold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
            onClick={goTosignin}
          >
            Sign Up
          </button>

    </div>
  </div>
</div>


  );
};

export default WelcomePage;
