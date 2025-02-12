import React from 'react';

interface PaymentsModalProps {
  treatment: Treatment;
  onClose: () => void;
}

const PaymentsModal: React.FC<PaymentsModalProps> = ({ treatment, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
        <h3 className="text-lg font-semibold mb-4">
          Historique des paiements pour {treatment.name}
        </h3>

        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✖
        </button>

        {treatment.paymentHistory && treatment.paymentHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Montant</th>
                  <th className="px-4 py-2 text-left">Acte</th>
                </tr>
              </thead>
              <tbody>
                {treatment.paymentHistory.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-green-600 font-medium">
                      ${payment.paid}
                    </td>
                    <td className="px-4 py-2">{payment.act}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td className="px-4 py-2 font-semibold">Total</td>
                  <td className="px-4 py-2 text-green-600 font-semibold">
                    ${treatment.paymentHistory.reduce((sum, payment) => sum + payment.paid, 0)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 italic text-center py-4">
            Aucun paiement enregistré
          </p>
        )}
      </div>
    </div>
  );
};

export default PaymentsModal;
