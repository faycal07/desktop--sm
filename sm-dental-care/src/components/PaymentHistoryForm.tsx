import React, { useState, useEffect } from 'react';
import ConfirmationModal from './ConfirmationModal';

interface PaymentHistoryFormProps {
  payment: Payment | null;
  treatmentId: number;
  onClose: () => void;
  onSubmit: (data: PaymentFormData) => Promise<void>;
}

export interface PaymentFormData {
  paid: number;
  date: string;
  act: string;
  treatment_id: number;
}

interface Payment {
  id?: number;
  paid: number;
  date: string;
  act: string;
}

const PaymentHistoryForm: React.FC<PaymentHistoryFormProps> = ({
  payment,
  treatmentId,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    paid: '',
    date: new Date().toISOString().split('T')[0],
    act: '',
  });

  const [error, setError] = useState<string>('');
  const [confirmUpdate, setConfirmUpdate] = useState<boolean>(false); // State for confirmation modal

  // Populate form data if editing an existing payment
  useEffect(() => {
    if (payment) {
      setFormData({
        paid: payment.paid.toString() || '',
        date: payment.date || new Date().toISOString().split('T')[0],
        act: payment.act || '',
      });
    }
  }, [payment, treatmentId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    if (payment) {
      // If editing an existing treatment, show the confirmation modal
      setConfirmUpdate(true);
    } else {
      try {
        await onSubmit({
          ...formData,
          paid: parseFloat(formData.paid),
          treatment_id: treatmentId // Ensure treatment_id is set correctly
        });
      } catch (error) {
        console.error('Error submitting payment:', error);
      }
    }
  };

  const handleConfirmSubmit = async (): Promise<void> => {
    try {
      await onSubmit({
        ...formData,
        paid: parseFloat(formData.paid),
        treatment_id: treatmentId // Ensure treatment_id is set correctly
      }); // Submit the form after confirmation
      setConfirmUpdate(false); // Close the modal
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      console.error('Error submitting treatment:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {payment ? 'Edit Payment' : 'Add Payment'}
        </h2>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Paid Amount */}
          <div>
            <label htmlFor="paid" className="block text-sm font-medium text-gray-700">
              Montant payé
            </label>
            <input
              type="number"
              id="paid"
              value={formData.paid}
              onChange={(e) => setFormData({ ...formData, paid: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Payment Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Act Description */}
          <div>
            <label htmlFor="act" className="block text-sm font-medium text-gray-700">
              Acte
            </label>
            <input
              type="text"
              id="act"
              value={formData.act}
              onChange={(e) => setFormData({ ...formData, act: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {payment ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
      {confirmUpdate && (
        <ConfirmationModal
          message={`Are you sure you want to ${payment ? 'UPDATE' : 'DELETE'} this payment?`}
          onConfirm={handleConfirmSubmit} // Confirm and submit
          onCancel={() => setConfirmUpdate(false)} // Cancel confirmation
          actionType={payment ? 'update' : 'delete'}
        />
      )}
    </div>
  );
};

export default PaymentHistoryForm;
