import React from "react";

type ConfirmationModalProps = {
  message: string; // The message to display in the modal
  actionType: "update" | "delete"; // Specifies the type of action (update or delete)
  onConfirm: () => void; // Function to call on confirmation
  onCancel: () => void; // Function to call on cancellation
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  message,
  actionType,
  onConfirm,
  onCancel,
}) => {
  // Styling based on action type
  const isDelete = actionType === "delete";

  return (
    <div
      id="confirmationModal"
      className="fixed inset-0 z-50 bg-gray-900 bg-opacity-60 flex items-center justify-center"
    >
      <div className="relative mx-auto shadow-xl rounded-md bg-white max-w-md w-full">
        {/* Close Button */}
        <div className="flex justify-end p-2">
          <button
            onClick={onCancel}
            aria-label="Close Modal" // Add this
            title="Close Modal" // Optionally add this for better accessibility
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 inline-flex items-center"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 pt-0 text-center">
          {/* Icon for Delete or Update */}
          {isDelete ? (
            <svg
              className="w-20 h-20 text-red-600 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          ) : (
            <svg
              className="w-20 h-20 text-blue-600 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          )}

          {/* Message */}
          <h3 className="text-xl font-normal text-gray-500 mt-5 mb-6">{message}</h3>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={onConfirm}
              className={`text-white ${
                isDelete ? "bg-red-600 hover:bg-red-800" : "bg-blue-600 hover:bg-blue-800"
              } focus:ring-4 ${
                isDelete ? "focus:ring-red-300" : "focus:ring-blue-300"
              } font-medium rounded-lg text-base inline-flex items-center px-4 py-2`}
            >
              {isDelete ? "Yes, delete" : "Yes, update"}
            </button>
            <button
              onClick={onCancel}
              className="text-gray-900 bg-white hover:bg-gray-100 focus:ring-4 focus:ring-cyan-200 border border-gray-200 font-medium rounded-lg text-base px-4 py-2"
            >
              No, cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
