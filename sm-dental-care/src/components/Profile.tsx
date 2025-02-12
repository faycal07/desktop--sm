import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import ConfirmationModal from "./ConfirmationModal";
import { Toaster, toast } from "react-hot-toast";

const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({ name: "", username: "", password: "" });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<"update" | "delete">("update");
  const [user, setUser] = useState<{ name: string; username: string; password?: string } | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const username = localStorage.getItem("username");
        if (!username) {
          console.error("No username found, redirecting to login");
          window.location.href = "/login";
          return;
        }

        const response = await window.electronAPI.getUserProfile(username);
        if (response.success && response.user) {
          setUser(response.user);
          setEditedUser({ ...response.user, password: "" });
        } else {
          console.error("Failed to fetch user info");
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUser(null);
      }
    };

    fetchUserProfile();
  }, []);

  const handleUpdate = () => {
    setShowConfirmation(true);
    setConfirmationAction("update");
  };

  const handleDelete = () => {
    setShowConfirmation(true);
    setConfirmationAction("delete");
  };

  const confirmAction = async () => {
    if (!user?.username) {
      toast.error("Error: No user found.");
      return;
    }

    try {
      if (confirmationAction === "update") {
        let hashedPassword = user.password || "";

        if (editedUser.password.trim() !== "") {
          hashedPassword = await window.electronAPI.hashPassword(editedUser.password);
        }

        const updatedUser = {
          name: editedUser.name,
          username: editedUser.username,
          password: hashedPassword,
          currentUsername: user.username,
        };

        const response = await window.electronAPI.updateUserProfile(updatedUser);

        if (response.success) {
          setUser({ ...updatedUser, password: hashedPassword });
          setIsEditing(false);
          toast.success("Profile updated successfully!");
        } else {
          toast.error("Failed to update profile.");
        }
      } else if (confirmationAction === "delete") {
        const response = await window.electronAPI.deleteUserAccount(user.username);
        if (response.success) {
          setUser(null);
          localStorage.removeItem("token");
          window.location.href = "/login";
          toast.success("Account deleted successfully!");
        } else {
          toast.error("Failed to delete account.");
        }
      }
    } catch (error) {
      console.error(`Error updating user:`, error);
      toast.error(`Failed to update profile.`);
    }
    setShowConfirmation(false);
  };

  if (!user) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center flex-col">
          <p className="text-red-500 text-lg">Failed to load profile. Please try logging in again.</p>
          <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg" onClick={() => window.location.href = "/login"}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-lg mx-auto bg-white p-6 rounded-2xl shadow-xl">
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">Profile</h1>
          {isEditing ? (
            <>
              <input type="text" className="border p-3 w-full rounded-lg mb-4" value={editedUser.name} onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })} placeholder="Enter Name" />
              <input type="text" className="border p-3 w-full rounded-lg mb-4" value={editedUser.username} onChange={(e) => setEditedUser({ ...editedUser, username: e.target.value })} placeholder="Enter Username" />
              <input type="password" className="border p-3 w-full rounded-lg mb-4" value={editedUser.password} onChange={(e) => setEditedUser({ ...editedUser, password: e.target.value })} placeholder="Enter new password (optional)" />
              <div className="flex gap-4">
                <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg" onClick={handleUpdate}>Save</button>
                <button className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              <p className="text-lg mb-2"><strong>Name:</strong> {user.name}</p>
              <p className="text-lg mb-4"><strong>Username:</strong> {user.username}</p>
              <div className="flex gap-4">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg" onClick={() => setIsEditing(true)}>Edit</button>
                <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg" onClick={handleDelete}>Delete Account</button>
              </div>
            </>
          )}
        </div>
      </div>
      {showConfirmation && (
        <ConfirmationModal
          message={confirmationAction === "delete" ? "Are you sure you want to delete your account?" : "Are you sure you want to update your profile?"}
          onConfirm={confirmAction}
          onCancel={() => setShowConfirmation(false)}
          actionType={confirmationAction}
        />
      )}
      <Toaster />
    </div>
  );
};

export default Profile;
