
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import ConfirmationModal from './ConfirmationModal';

interface TreatmentFormProps {
  treatment?: Treatment | null;
  patientId: number;
  onSubmit: (data: TreatmentFormData) => Promise<void>;
  onCancel: () => void;
}

interface TreatmentFormData {
  name: string;
  description: string;
  date: string;
  price: number;
  patientId: number;
}

const TreatmentForm: React.FC<TreatmentFormProps> = ({
  onSubmit,
  onCancel,
  treatment,
  patientId
}) => {
  const [formData, setFormData] = useState<TreatmentFormData>({
    name: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    price: 0,
    patientId
  });

  const [error, setError] = useState<string>('');
  const [confirmUpdate, setConfirmUpdate] = useState<boolean>(false);

  useEffect(() => {
    if (treatment) {
      setFormData({
        name: treatment.name,
        description: treatment.description,
        date: treatment.date,
        price: treatment.price,
        patientId
      });
    }
  }, [treatment, patientId]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Treatment name is required');
      return false;
    }
    if (!formData.date) {
      setError('Date is required');
      return false;
    }
    if (formData.price < 0) {
      setError('Price amount cannot be negative');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    if (treatment) {
      setConfirmUpdate(true);
    } else {
      try {
        await onSubmit(formData);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
        console.error('Error submitting treatment:', error);
      }
    }
  };

  const handleConfirmSubmit = async (): Promise<void> => {
    try {
      await onSubmit(formData);
      setConfirmUpdate(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      console.error('Error submitting treatment:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-amber-100 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {treatment ? 'Edit Treatment' : 'Add Treatment'}
        </h2>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Treatment Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-1 rounded-md border-[2px] border-[#002147] shadow-sm 
              focus:border-[#001633] focus:ring-[#001633]" 
              required
              placeholder="Enter Treatment Name"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-1 rounded-md border-[2px] border-[#002147] shadow-sm 
              focus:border-[#001633] focus:ring-[#001633]" 
              rows={3}
              placeholder="Enter Treatment Description"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-1 rounded-md border-[2px] border-[#002147] shadow-sm 
              focus:border-[#001633] focus:ring-[#001633]" 
              required
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price Amount (DZD)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              value={formData.price || ''} 
              onChange={handleInputChange}
              className="mt-1 block w-full px-4 py-1 rounded-md border-[2px] border-[#002147] shadow-sm 
              focus:border-[#001633] focus:ring-[#001633]"  
              min="0"
              step="0.01"
              placeholder="Enter Treatment Price"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md 
                       hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
  className="px-4 py-2 bg-[#062951] text-white rounded-md 
                       hover:bg-[#001633] focus:outline-none focus:ring-2 focus:ring-[#001633]"
            >
              {treatment ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>

      {confirmUpdate && (
        <ConfirmationModal
          message={`Are you sure you want to update this treatment?`}
          onConfirm={handleConfirmSubmit}
          onCancel={() => setConfirmUpdate(false)}
          actionType="update"
        />
      )}
    </div>
  );
};

export default TreatmentForm;
