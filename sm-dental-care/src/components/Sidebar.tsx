import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('token'); // Supprime le token
    navigate('/'); // Redirige vers la page d'accueil/login
  };

  return (
    <div className="bg-[#6a994e] text-white h-screen sticky top-0 left-0 p-6 flex flex-col">
      <h2 className="text-2xl font-extrabold text-center mb-4">Dashboard</h2>

      {/* Menu Principal */}
      <ul className="space-y-4 flex-grow">
        <li>
          <Link
            to="/dashboard"
            className="block py-2 px-4 rounded-lg text-center hover:bg-[#4c7b37] transition-all duration-200"
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/patients"
            className="block py-2 px-4 rounded-lg text-center hover:bg-[#4c7b37] transition-all duration-200"
          >
            Patients
          </Link>
        </li>
        <li>
          <Link
            to="/autres"
            className="block py-2 px-4 rounded-lg text-center hover:bg-[#4c7b37] transition-all duration-200"
          >
            Autres
          </Link>
        </li>
        <li>
          <Link
            to="/profile"
            className="block py-2 px-4 rounded-lg text-center hover:bg-[#4c7b37] transition-all duration-200"
          >
            Profile
          </Link>
        </li>
      </ul>

      {/* Bouton Déconnexion */}
      <button
        onClick={handleLogout}
        className="py-3 px-6 bg-[#37601e] text-white font-semibold rounded-lg hover:bg-[#4c7b37] transition-all duration-200 w-full"
      >
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
