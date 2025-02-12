export {};

declare global {
  interface Window {
    electronAPI: {
      getPatientTreatments: (patientId: number) => Promise<{
        success: boolean;
        treatments: Array<{
          id: number;
          name: string;
          description: string;
          date: string;
          price: number;
          patient_id: number;
          payments: Array<{
            id: number;
            paid: number;
            date: string;
            act: string;
          }>;
        }>;
      }>;

      // Authentication APIs
    
      login: (credentials: { username: string; password: string }) => Promise<{ success: boolean; token?: string; message?: string ;username?: string; }>;
      register: (credentials: { name: string; username: string; password: string }) => Promise<{ success: boolean; message?: string }>;
      verifyToken: (token: string) => Promise<{ success: boolean; username?: string; message?: string }>;
      logout: () => Promise<{ success: boolean; message?: string }>;
      getUserInfo: (token: string) => Promise<{ success: true; name: string } | { success: false; message: string }>;

      // Patient Management
      getAllPatients: () => Promise<{ success: boolean; patients: Patient[] }>;
      getAllPatientTreatments: () => Promise<{ success: boolean; treatments: Treatment[] }>;
      getAllTreatmentPayments: () => Promise<{ success: boolean; payments: PaymentRecord[] }>;
      addPatient: (data: PatientCreateData) => Promise<{ success: boolean; id?: number }>; 
      updatePatient: (id: number, data: PatientCreateData) => Promise<{ success: boolean }>;
      deletePatient: (id: number) => Promise<{ success: boolean }>; 
      hashPassword: (password: string) => Promise<string>;
 
//
getUserProfile: (token: string) => Promise<{ success: boolean; user?: { name: string; username: string }; error?: string }>;

updateUserProfile: (userData: { name: string; username: string; password?: string }) => Promise<{ success: boolean }>;
deleteUserAccount: (username: string) => Promise<{ success: boolean }>;


      // Treatment Management
      addTreatment: (data: Omit<Treatment, 'id'>) => Promise<{ success: boolean; treatmentId: number }>;
      updateTreatment: (id: number, data: Partial<Treatment>) => Promise<{ success: boolean }>;
      getTreatmentsForPatient: (patientId: number) => Promise<{ success: boolean; treatments: Treatment[] }>;
      deleteTreatment: (id: number) => Promise<{ success: boolean }>;

      updatePaymentHistory: (id: number, data: Partial<PaymentRecord>) => Promise<{ success: boolean }>;


      // Payment Management
      addPayment: (paymentData: Omit<PaymentRecord, 'id'>) => Promise<{ success: boolean; paymentId: number }>;
      deletePayment: (id: number) => Promise<{ success: boolean }>;
      getTreatmentPayments: (treatmentId: number) => Promise<{ success: boolean; payments: PaymentRecord[] }>;
    };
  }
 export interface UpdateUserResponse {
    success: boolean;
    error?: string; // ✅ Ensure 'error' is always an optional field
  }
  
  export interface Treatment {
    id: number;
    name: string;
    description: string;
    date: string;
    price: number;
    patientId: number;
    paymentHistory?: APIPayment[];
  }

  export interface Patient {
    id: number;
    name: string;
    last_name: string;
    age?: number;
    date: string;
    case_description: string;
    treatments: Treatment[];
  }

  interface PatientCreateData extends PatientFormData {
    treatments?: Treatment[];
  }

  export interface PaymentRecord {
    id: number;
    paid: number;
    date: string;
    act: string;
    treatment_id: number;
  }

  interface PatientFormData {
    name: string;
    last_name: string;
    age: number;
    date: string;
    case_description: string;
  }

  export interface TreatmentFormData {
    name: string;
    description: string;
    date: string;
    price: number;
    patientId: number;
  }

  export interface PaymentFormData {
    paid: number;
    date: string;
    act: string;
    treatment_id: number;
  }
  interface Payment {
    id: number;
    paid: number;
    date: string;
    act: string;
    treatment_id: number;
  }
  
 
  
  interface APIPayment {
    id: number;
    paid: number;
    date: string;
    act: string;
    treatment_id: number;
  }

  interface PatientFormProps {
    patient?: PatientFormData;
    onCancel: () => void;
    onSubmit: (patientData: PatientCreateData) => Promise<void>;
  }
  export interface PaymentHistoryPageProps {
    treatment: Treatment;
    onBack: () => void;
    onAddPayment: (paymentData: Omit<PaymentFormData, 'id'> & { treatment_id: number }) => Promise<void>;

    onUpdatePayment: (paymentId: number, paymentData: Partial<PaymentRecord>) => Promise<void>;
  }
  export interface PatientTreatmentsProps {
    patient: Patient;
    onBack: () => void;
    onAddTreatment: (treatmentData: Omit<TreatmentFormData, 'patientId'> & { patientId: number }) => Promise<void>;
    onUpdateTreatment: (treatmentId: number, treatmentData: Partial<Treatment>) => Promise<void>;
    onDeleteTreatment: (treatmentId: number) => Promise<void>;
  }
}

export type { Patient, Treatment, TreatmentFormData };









