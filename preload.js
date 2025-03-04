const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // User Authentication
  // login: (data) => ipcRenderer.invoke('authenticate-user', data),
  // register: (data) => ipcRenderer.invoke('register-user', data),
  // verifyToken: (token) => ipcRenderer.invoke('verify-token', token),
  // User Authentication
  login: async (data) => {
    try {
      return await ipcRenderer.invoke("authenticate-user", data);
    } catch (error) {
      console.error("IPC Login Error:", error);
      return { success: false, message: "Login failed due to internal error" };
    }
  },

  register: async (data) => {
    try {
      return await ipcRenderer.invoke("register-user", data);
    } catch (error) {
      console.error("IPC Registration Error:", error);
      return { success: false, message: "Registration failed due to internal error" };
    }
  },

  verifyToken: async (token) => {
    try {
      return await ipcRenderer.invoke("verify-token", token);
    } catch (error) {
      console.error("IPC Token Verification Error:", error);
      return { success: false, message: "Token verification failed" };
    }
  },
  getUserInfo: (token) => ipcRenderer.invoke('getUserInfo', token),


 
  updateUserProfile: (userData) => ipcRenderer.invoke("update-user-profile", userData),
  deleteUserAccount: (username) => ipcRenderer.invoke("delete-user-account", username),
  getUserProfile: (username) => ipcRenderer.invoke("get-user-profile", username),
  // // getStatistics: () => ipcRenderer.invoke("getStatistics"),
  hashPassword: (password) => ipcRenderer.invoke("hash-password", password),
  // getUserProfile: (token) => ipcRenderer.invoke("get-user-profile", token), 
  // updateUserProfile: (userData) => ipcRenderer.invoke("update-user-profile", userData),

  // deleteUserAccount: (username) => ipcRenderer.invoke("delete-user-account", username),
 
  // Patient Management
  getAllPatients: () => ipcRenderer.invoke('get-all-patients'),
  getAllPatientTreatments: () => ipcRenderer.invoke('get-all-treatments'),
  getAllTreatmentPayments: () => ipcRenderer.invoke('get-all-payments'),
  addPatient: (data) => ipcRenderer.invoke('add-patient', data),
  updatePatient: (id, patientData) => ipcRenderer.invoke('updatePatient', id, patientData),
  deletePatient: (id) => ipcRenderer.invoke('delete-patient', id),

  // Treatment Management
  addTreatment: (data) => ipcRenderer.invoke('add-treatment', data),
  updateTreatment: (id, data) => ipcRenderer.invoke('update-treatment', { id, treatmentData: data }),
  deleteTreatment: (id) => ipcRenderer.invoke('deleteTreatment', id),

  // Payment History Management
  updatePaymentHistory: (id, data) => ipcRenderer.invoke('update-payment', { id, paymentData: data }),
  deletePayment: (id) => ipcRenderer.invoke('delete-payment', id),

  // ... other methods
  getPatientTreatments: (patientId) => ipcRenderer.invoke('getPatientTreatments', patientId),

  // Payment Management
  addPayment: (paymentData) => ipcRenderer.invoke('add-payment', paymentData),
  getTreatmentPayments: (treatmentId) => ipcRenderer.invoke('get-treatment-payments', treatmentId),
});

