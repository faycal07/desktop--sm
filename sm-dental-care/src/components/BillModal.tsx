import React from "react";

type PaymentRecord = {
  paid: number;
  date: string;
  act?: string;
};

type Patient = {
  id: number;
  name: string;
  last_name: string;
  age?: number;
  date: string;
  case_description: string;
  total?: number;
  paymentHistory: PaymentRecord[];
};

interface BillModalProps {
  patient: Patient;
  onClose: () => void;
}

const BillModal: React.FC<BillModalProps> = ({ patient, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-4">
        <h2 className="text-lg font-bold mb-4">Bill for {patient.name}</h2>
        <p>
          <strong>Case Description:</strong> {patient.case_description}
        </p>
        <p>
          <strong>Total:</strong> {patient.total} DZD
        </p>
        <h3 className="text-md font-semibold mt-4">Payment History:</h3>
        <ul className="space-y-2">
          {patient.paymentHistory.map((record, index) => (
            <li key={index} className="text-sm">
              Paid: {record.paid} DZD, Date: {record.date}, Act: {record.act}
            </li>
          ))}
        </ul>
        <div className="flex justify-between mt-4">
          <button
            className="py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={handlePrint}
          >
            Print
          </button>
          <button
            className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillModal;
