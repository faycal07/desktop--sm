import React, { useState, useEffect } from "react";
import { FaTimes } from 'react-icons/fa';

interface PatientFormProps {
  patient?: PatientFormData;
  onCancel: () => void;
  onSubmit: (patientData: PatientCreateData) => Promise<void>;
}

const PatientForm: React.FC<PatientFormProps> = ({ patient, onCancel, onSubmit }) => {
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    last_name: '',
    age: 0,
    case_description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name,
        last_name: patient.last_name,
        age: patient.age,
        case_description: patient.case_description,
        date: patient.date
      });
    }
  }, [patient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold" id="dialog-title">
            {patient ? 'Modifier le patient' : 'Ajouter un patient'}
          </h2>
          <button 
            onClick={onCancel} 
            className="text-gray-500 hover:text-gray-700"
            aria-label="Fermer le formulaire"
          >
            <span className="sr-only">Fermer</span>
            <FaTimes aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" aria-labelledby="dialog-title">
          <div>
            <label htmlFor="patient-name" className="block text-sm font-medium text-gray-700">
              Nom
            </label>
            <input
              id="patient-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              aria-required="true"
              placeholder="Entrez le nom du patient"
              aria-label="Nom du patient"
            />
          </div>

          <div>
            <label htmlFor="patient-lastname" className="block text-sm font-medium text-gray-700">
              Prénom
            </label>
            <input
              id="patient-lastname"
              name="last_name"
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              aria-required="true"
              placeholder="Entrez le prénom du patient"
              aria-label="Prénom du patient"
            />
          </div>

          <div>
            <label htmlFor="patient-age" className="block text-sm font-medium text-gray-700">
              Âge
            </label>
            <input
              id="patient-age"
              name="age"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              aria-required="true"
              placeholder="Entrez l'âge du patient"
              aria-label="Âge du patient"
              min="0"
              max="150"
            />
          </div>

          <div>
            <label htmlFor="patient-case" className="block text-sm font-medium text-gray-700">
              Description du cas
            </label>
            <textarea
              id="patient-case"
              name="case_description"
              value={formData.case_description}
              onChange={(e) => setFormData({ ...formData, case_description: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
              placeholder="Décrivez le cas du patient"
              aria-label="Description du cas"
            />
          </div>

          <div>
            <label htmlFor="patient-date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              id="patient-date"
              name="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              aria-required="true"
              aria-label="Date de consultation"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              aria-label="Annuler et fermer le formulaire"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              aria-label={patient ? "Mettre à jour le patient" : "Ajouter le patient"}
            >
              {patient ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientForm;
