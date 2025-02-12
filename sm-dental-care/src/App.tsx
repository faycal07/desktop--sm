import React from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import WelcomePage from "./components/WelcomePage";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";
import Autres from "./components/Autres";
import Profile from "./components/Profile";
import RegisterPage from "./components/RegisterPage";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Patients from "./components/Patients";
import { Toaster } from 'react-hot-toast';
 
const App = () => {
  return ( 
    <> 
       <Toaster position="top-center" reverseOrder={false} />
     <ToastContainer
        position="top-right" // Position du toast
        autoClose={30000} // Durée avant la fermeture automatique (en millisecondes)
        hideProgressBar={false} // Afficher la barre de progression
        newestOnTop={true} // Afficher les nouveaux toasts en haut
        closeOnClick // Permet de fermer le toast en cliquant dessus
        pauseOnFocusLoss // Met en pause si l'utilisateur quitte la fenêtre
        draggable // Rend le toast déplaçable
        pauseOnHover // Met en pause la fermeture si l'utilisateur survole le toast
      />
    <Router>  
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/autres" element={<Autres />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
    </>
  );
};

export default App;
