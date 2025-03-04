import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaArrowLeft, FaPlus } from 'react-icons/fa';
import PaymentHistoryForm from './PaymentHistoryForm';
import ConfirmationModal from './ConfirmationModal';
import Sidebar from './Sidebar';
import toast from "react-hot-toast";

interface Payment {
  id: number;
  paid: number;
  date: string;
  act: string;
  treatment_id: number;
}

interface Treatment {
  id: number;
  name: string;
  description: string;
  date: string;
  price: number;
  patientId: number;
  paymentHistory?: Payment[];
}

interface PaymentHistoryPageProps {
  treatment: Treatment;
  onBack: () => void;
  onAddPayment: (paymentData: Omit<PaymentFormData, 'id'> & { treatment_id: number }) => Promise<void>;
  onUpdatePayment: (paymentId: number, paymentData: Partial<Payment>) => Promise<void>;
}

interface PaymentFormData {
  paid: number;
  date: string;
  act: string;
  treatment_id: number;
}

const PaymentHistoryPage: React.FC<PaymentHistoryPageProps> = ({
  treatment,
  onBack,
}) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        console.log('Loading payments for treatment ID:', treatment.id);
        const result = await window.electronAPI.getTreatmentPayments(treatment.id);

        if (result.success) {
          setPayments(result.payments);
        } else {
          console.error('Failed to load payments: Unknown error occurred');
        }
      } catch (error) {
        console.error('Error loading payments:', error instanceof Error ? error.message : error);
      }
    };

    loadPayments();
  }, [treatment.id]);

  const totalPaid = payments.reduce((sum: number, payment: Payment) => sum + payment.paid, 0);
  const remainingAmount = treatment.price - totalPaid;

  const handlePaymentSubmit = async (paymentData: PaymentFormData) => {
    try {
      if (selectedPayment) {
        // Update existing payment
        const result = await window.electronAPI.updatePaymentHistory(selectedPayment.id, {
          paid: paymentData.paid,
          date: paymentData.date,
          act: paymentData.act,
          treatment_id: treatment.id
        });

        if (result.success) {
          const updatedPayments = await window.electronAPI.getTreatmentPayments(treatment.id);
          if (updatedPayments.success) {
            setPayments(updatedPayments.payments);
          }
          toast.success("Payment updated successfully");
        }
      } else {
        // Add new payment
        const result = await window.electronAPI.addPayment({
          paid: paymentData.paid,
          date: paymentData.date,
          act: paymentData.act,
          treatment_id: treatment.id
        });

        if (result.success) {
          const updatedPayments = await window.electronAPI.getTreatmentPayments(treatment.id);
          if (updatedPayments.success) {
            setPayments(updatedPayments.payments);
          }
          toast.success("Payment added successfully");
        }
      }
      setShowPaymentForm(false);
      setSelectedPayment(null);
    } catch (error) {
      console.error('Error handling payment:', error);
      toast.error("Error handling payment");
    }
  };

  const handleDeletePayment = async (paymentId: number) => {
    try {
      console.log('Deleting payment with ID:', paymentId);
      const result = await window.electronAPI.deletePayment(paymentId);

      if (result.success) {
        const updatedPayments = await window.electronAPI.getTreatmentPayments(treatment.id);
        if (updatedPayments.success) {
          setPayments(updatedPayments.payments);
          toast.success('Payment deleted successfully');
        } else {
          console.error('Failed to refresh payments after deletion: Unknown error occurred');
          toast.error("Failed to load payments");

        }
      } else {
        console.error('Failed to delete payment: Unknown error occurred');
        toast.error("Failed to delete payment");
      }

      setShowDeleteConfirmation(false);
      setSelectedPayment(null);
    } catch (error) {
      console.error('Error deleting payment:', error instanceof Error ? error.message : error);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0C1B33] w-full">
      <Sidebar />
      <div className="p-6 w-full my-3">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-[#f2e7c0] hover:text-[#baaf87]"
          >
            <FaArrowLeft className="mr-2" /> Back to Treatments
          </button>
        </div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#03B5AA]">Payment History for <span className="font-semibold">{treatment.name}</span></h2>
        </div>
        <button
          onClick={() => {
            setSelectedPayment(null);
            setShowPaymentForm(true);
          }}
          className="bg-[#d7ca9b] text-[#0C1B33] hover:bg-[#B2AA8E] font-bold py-2 px-4 rounded flex items-center gap-2"
        >
          <FaPlus /> Add Payment
        </button>

        <div className="bg-[#f1e6b9] rounded-lg shadow-md p-6 mt-4">
          <div className="mb-6">
            <p className="text-lg">
              Total Price: <span className="font-semibold text-green-600">{treatment.price} DZD</span>
            </p>
            <p className="text-lg">
              Total Paid: <span className="font-semibold text-blue-600">{totalPaid} DZD</span>
            </p>
            <p className="text-lg">
              Remaining Amount: <span className="font-semibold text-red-600">{remainingAmount} DZD</span>
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto w-full">
              <thead>
                <tr className="bg-[#e0d6b0]">
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Amount (DZD)</th>
                  <th className="px-4 py-2 text-left">Act</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-400'>
                {payments.map((payment: Payment) => (
                  <tr key={payment.id} className="hover:bg-[#d7ca9b]">
                    <td className="px-4 py-2">{new Date(payment.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-green-600 font-medium">{payment.paid} </td>
                    <td className="px-4 py-2">{payment.act}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowPaymentForm(true);
                        }}
                        className="text-blue-500 hover:text-blue-700 mr-2"
                        title="Edit Payment"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowDeleteConfirmation(true);
                        }}
                        className="text-red-500 hover:text-red-700"
                        title="Delete Payment"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showPaymentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <PaymentHistoryForm
                payment={selectedPayment}
                treatmentId={treatment.id} // Ensure treatmentId is passed correctly
                onClose={() => {
                  setShowPaymentForm(false);
                  setSelectedPayment(null);
                }}
                onSubmit={handlePaymentSubmit}
              />
            </div>
          </div>
        )}

        {showDeleteConfirmation && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <ConfirmationModal
              message="Are you sure you want to DELETE this payment?"
              onConfirm={() => handleDeletePayment(selectedPayment.id)}
              onCancel={() => {
                setShowDeleteConfirmation(false);
                setSelectedPayment(null);
              }}
              actionType="delete"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistoryPage;
