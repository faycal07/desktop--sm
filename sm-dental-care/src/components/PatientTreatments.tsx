import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaMoneyBill } from 'react-icons/fa';
import TreatmentForm from './TreatmentForm';
import Sidebar from './Sidebar';
import ConfirmationModal from './ConfirmationModal';
import PaymentHistoryPage from './PaymentHistoryPage';
import PaymentsModal from './PaymentsModal';
import toast from "react-hot-toast";


// Types pour l'API

interface APITreatment {
  id: number;
  name: string;
  description: string;
  date: string;
  price: number;
  patient_id: number;
  payments?: APIPayment[];
}








interface PatientTreatmentsProps {
  patient: Patient;
  onBack: () => void;
  onAddTreatment: (treatmentData: Omit<TreatmentFormData, 'patientId'> & { patientId: number }) => Promise<void>;
  onUpdateTreatment: (treatmentId: number, treatmentData: Partial<Treatment>) => Promise<void>;
  onDeleteTreatment: (treatmentId: number) => Promise<void>;
}

interface APIResponse {
  success: boolean;
  error?: string;
  treatments: APITreatment[];
}

const PatientTreatments: React.FC<PatientTreatmentsProps> = ({ 
  patient, 
  onBack,
  onAddTreatment,
  onUpdateTreatment,
  onDeleteTreatment
}) => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [selectedTreatmentForPayments, setSelectedTreatmentForPayments] = useState<Treatment | null>(null);
  
  const [viewingPaymentsTreatment, setViewingPaymentsTreatment] = useState<Treatment | null>(null);

  useEffect(() => {
    if (patient?.id) {
      refreshTreatments();
    }
  }, [patient?.id, patient.treatments]);

  const refreshTreatments = async () => {
    try {
      if (!patient?.id) return;
      
      console.log('Refreshing treatments for patient:', patient.id);
      const response = await window.electronAPI.getPatientTreatments(patient.id) as APIResponse;
      if (response.success) {
        const treatmentsWithPayments = response.treatments.map((treatment: APITreatment) => ({
          id: treatment.id,
          name: treatment.name,
          description: treatment.description,
          date: treatment.date,
          price: treatment.price,
          patientId: treatment.patient_id,
          paymentHistory: treatment.payments?.map(payment => ({
            ...payment,
            treatment_id: treatment.id,
          })) || []
        }));
        setTreatments(treatmentsWithPayments);
        console.log('Treatments refreshed successfully');
      }
    } catch (error) {
      console.error('Error refreshing treatments:', error);
      toast.error("Failed to fetch treatments");

    }
  };



  const handlePaymentSubmit = async (paymentData: PaymentFormData) => {
    try {
      const apiPayment: Omit<APIPayment, 'id'> = {
        paid: paymentData.paid,
        date: paymentData.date,
        act: paymentData.act,
        treatment_id: selectedTreatment?.id || 0,
      };
  
      const result = await window.electronAPI.addPayment(apiPayment);
      if (result.success) {
        // Update payments locally
        setTreatments((prev) =>
          prev.map((treatment) =>
            treatment.id === selectedTreatment?.id
              ? {
                  ...treatment,
                  paymentHistory: [...(treatment.paymentHistory || []), { ...apiPayment, id: result.paymentId }],
                }
              : treatment
          )
        );
        toast.success("Payment added successfully");
      }
      

    } catch (error) {
      console.error('Error handling payment:', error);
      toast.error("Failed to add payment");

    }
  };
  

  const handleUpdatePayment = async (paymentId: number, paymentData: Partial<Payment>) => {
    try {
      const apiPayment: Partial<Payment> = {
        paid: paymentData.paid,
        date: paymentData.date,
        act: paymentData.act,
        treatment_id: paymentData.treatment_id,
      };
  
      const result = await window.electronAPI.updatePaymentHistory(paymentId, apiPayment);
      if (result.success) {
        setTreatments((prev) =>
          prev.map((treatment) =>
            treatment.id === selectedTreatment?.id
              ? {
                  ...treatment,
                  paymentHistory: treatment.paymentHistory?.map((payment) =>
                    payment.id === paymentId ? { ...payment, ...apiPayment } : payment
                  ),
                }
              : treatment
          )
        );
        toast.success("Payment updated successfully");

      }
     
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error("Failed to update payment");

    }
  };
  
  if (showPaymentHistory && selectedTreatmentForPayments) {
    return (
      <PaymentHistoryPage
        treatment={selectedTreatmentForPayments}
        onBack={() => {
          setShowPaymentHistory(false);
          setSelectedTreatmentForPayments(null);
          refreshTreatments();
        }}
        onAddPayment={handlePaymentSubmit}
        onUpdatePayment={handleUpdatePayment} // Ensure this matches Partial<Payment>
      />
    );
  }
  

  const handleEditTreatment = (treatment: Treatment) => {
    setSelectedTreatment(treatment);
    setShowTreatmentForm(true);
  };

  const openDeleteConfirmation = (treatment: Treatment) => {
    setSelectedTreatment(treatment);
    setShowDeleteConfirmation(true);
  };
  

  const handleAddPayment = (treatment: Treatment) => {
    setSelectedTreatmentForPayments(treatment);
    setShowPaymentHistory(true);
  };

  const handleTreatmentSubmit = async (data: TreatmentFormData & { patientId?: number }) => {
    try {
      const treatmentData = {
        name: data.name,
        description: data.description,
        date: data.date,
        price: data.price,
        patient_id: data.patientId || patient.id,
      };

      if (selectedTreatment) {
        await onUpdateTreatment(selectedTreatment.id, treatmentData);
      } else {
        await onAddTreatment({
          ...treatmentData,
          patientId: patient.id,
        });
      }
      
      // Close form first
      setShowTreatmentForm(false);
      setSelectedTreatment(null);
      
      // Then refresh treatments
      await refreshTreatments();
    } catch (error) {
      console.error('Error handling treatment:', error);
    }
  };
  

  const confirmDeleteTreatment = async () => {
    if (selectedTreatment) {
      try {
        await onDeleteTreatment(selectedTreatment.id);
        
        // Close confirmation first
        setShowDeleteConfirmation(false);
        setSelectedTreatment(null);
        
        // Then refresh treatments
        await refreshTreatments();
      } catch (error) {
        console.error('Error deleting treatment:', error);
      }
    }
  };
  
  
  

 

  if (showPaymentHistory && selectedTreatmentForPayments) {
    return (
      <PaymentHistoryPage
        treatment={selectedTreatmentForPayments}
        onBack={() => {
          setShowPaymentHistory(false);
          setSelectedTreatmentForPayments(null);
          refreshTreatments();
        }}
           onAddPayment={handlePaymentSubmit}
      onUpdatePayment={handleUpdatePayment}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
    <div className="p-6 w-full my-3">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft className="mr-2" /> Back to Patients
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-4">
        Treatments for {patient.name} {patient.last_name}
      </h2>

      <button
        onClick={() => {
          setSelectedTreatment(null);
          setShowTreatmentForm(true);
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
      >
        <FaPlus className="inline-block mr-2" /> Add Treatment
      </button>
     <div className="mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg w-full">
  <table className="w-full min-w-full divide-y divide-gray-300">
    <thead className="bg-gray-50">
      <tr>
        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Treatment</th>
        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price</th>
        <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
        <th className="relative py-3.5 pl-3 pr-4">
          <span className="sr-only">Actions</span>
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200 bg-white">
      {treatments.map((treatment) => {
        const totalPaid = treatment.paymentHistory?.reduce((sum, payment) => sum + payment.paid, 0) || 0;
        const remaining = treatment.price - totalPaid;

        return (
          <tr
          key={treatment.id}
          className="hover:bg-gray-50 cursor-pointer"
          onDoubleClick={() => handleAddPayment(treatment)}
        >
        
            <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{treatment.name}</td>
            <td className="px-3 py-4 text-sm text-gray-500">{treatment.description}</td>
            <td className="px-3 py-4 text-sm text-gray-500">{new Date(treatment.date).toLocaleDateString()}</td>
            <td className="px-3 py-4 text-sm">
              <div className="font-medium text-gray-900">${treatment.price}</div>
              {totalPaid > 0 && (
                <>
                  <div className="text-green-600">Paid: ${totalPaid}</div>
                  <div className="text-red-600">Remaining: ${remaining}</div>
                </>
              )}
            </td>
            <td className="px-3 py-4 text-sm">
              <span
                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                  remaining <= 0
                    ? 'bg-green-100 text-green-800'
                    : totalPaid > 0
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {remaining <= 0 ? 'Paid' : totalPaid > 0 ? 'Partial' : 'Unpaid'}
              </span>
            </td>
            <td className="py-4 pl-3 pr-4 text-right text-sm font-medium">
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleEditTreatment(treatment)}
                  className="text-blue-500 hover:text-blue-700"
                  title="Edit Treatment"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => openDeleteConfirmation(treatment)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete Treatment"
                >
                  <FaTrash />
                </button>
                <button
                  onClick={() => handleAddPayment(treatment)}
                  className="text-green-500 hover:text-green-700"
                  title="Add Payment"
                >
                  <FaMoneyBill />
                </button>
                <button
                  onClick={() => setViewingPaymentsTreatment(treatment)}
                  className="text-green-500 hover:text-green-700"
                  title="View Payments"
                >
                  View Payments
                </button>
              </div>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>

  {viewingPaymentsTreatment && (
    <PaymentsModal
      treatment={viewingPaymentsTreatment}
      onClose={() => setViewingPaymentsTreatment(null)}
    />
  )}
</div>


      {showTreatmentForm && (
        <TreatmentForm
          treatment={selectedTreatment}
          patientId={patient.id}
          onSubmit={handleTreatmentSubmit}
          onCancel={() => setShowTreatmentForm(false)}
        />
      )}

  

      {showDeleteConfirmation && selectedTreatment && (
        <ConfirmationModal
          message="Are you sure you want to DELETE this treatment?"
          onConfirm={confirmDeleteTreatment}
          onCancel={() => {
            setShowDeleteConfirmation(false);
            setSelectedTreatment(null);
          }}
          actionType="delete"
        /> 
      )}
 
  </div>
    </div>
  );
};

export default PatientTreatments;