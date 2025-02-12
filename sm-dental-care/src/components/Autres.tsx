import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Sidebar from "./Sidebar";

const Autres: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all patients
        const patientResponse = await window.electronAPI.getAllPatients();
        if (patientResponse.success) {
          setPatients(patientResponse.patients);
        }

        // Fetch all treatments
        const treatmentResponse = await window.electronAPI.getAllPatientTreatments();
        console.log("Treatment Response:", treatmentResponse); // Log the full treatment response
        if (treatmentResponse.success) {
          setTreatments(treatmentResponse.treatments);
          console.log("Fetched Treatments:", treatmentResponse.treatments); // Log fetched treatments
        }

        // Fetch all payments
        const paymentResponse = await window.electronAPI.getAllTreatmentPayments();
        console.log("Payment Response:", paymentResponse); // Log the full payment response
        if (paymentResponse.success) {
          setPayments(paymentResponse.payments);
          console.log("Fetched Payments:", paymentResponse.payments); // Log fetched payments
        }
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };

    fetchStats();
  }, []);

  // Group patients by date
  const patientData = Object.values(
    patients.reduce((acc, p) => {
      const date = p.date || "Inconnue";
      acc[date] = acc[date] || { date, count: 0 };
      acc[date].count += 1;
      return acc;
    }, {} as Record<string, { date: string; count: number }>)
  );

  // Group treatments by date
  const treatmentData = Object.values(
    treatments.reduce((acc, t) => {
      const date = t.date || "Inconnue";
      acc[date] = acc[date] || { date, count: 0 };
      acc[date].count += 1;
      return acc;
    }, {} as Record<string, { date: string; count: number }>)
  );

  // Group payments by date
  const paymentData = Object.values(
    payments.reduce((acc, p) => {
      const date = p.date || "Inconnue";
      acc[date] = acc[date] || { date, totalPaid: 0 };
      acc[date].totalPaid += p.paid;
      return acc;
    }, {} as Record<string, { date: string; totalPaid: number }>)
  );

  const totalPaid = payments.reduce((sum, p) => sum + p.paid, 0);
  const totalTreatmentCost = treatments.reduce((sum, t) => sum + t.price, 0); 
const remainingBalance = totalTreatmentCost - totalPaid; // ✅ Correct calculation

const paymentPieData = [
  { name: "Total Paiements", value: totalPaid },
  { name: "Reste à Payer", value: remainingBalance > 0 ? remainingBalance : 0 }, // Avoid negative values
];

  // // Data for PieChart (total paid amounts)
  // const totalPaid = payments.reduce((sum, p) => sum + p.paid, 0);
  // const paymentPieData = [
  //   { name: "Total Paiements", value: totalPaid },
  //   { name: "Reste à Payer", value: totalPaid * 0.3 }, // Simulated pending amount
  // ];
  const COLORS = ["#0088FE", "#FFBB28"];

  const getPaymentStatistics = () => {
    const today = new Date();
    const todayString = today.toISOString().split("T")[0]; // Format YYYY-MM-DD
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Get start of week (Sunday)
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);
  
    const totalPayments = payments.reduce((sum, p) => sum + p.paid, 0);
    const paymentsToday = payments.filter((p) => p.date.startsWith(todayString)).reduce((sum, p) => sum + p.paid, 0);
    const paymentsThisWeek = payments.filter((p) => new Date(p.date) >= startOfWeek).reduce((sum, p) => sum + p.paid, 0);
    const paymentsThisMonth = payments.filter((p) => new Date(p.date) >= startOfMonth).reduce((sum, p) => sum + p.paid, 0);
    const paymentsThisYear = payments.filter((p) => new Date(p.date) >= startOfYear).reduce((sum, p) => sum + p.paid, 0);
  
    return { totalPayments, paymentsToday, paymentsThisWeek, paymentsThisMonth, paymentsThisYear };
  };
  
  const getTreatmentStatistics = () => {
    const today = new Date();
    const todayString = today.toISOString().split("T")[0];
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);
  
    const treatmentsToday = treatments.filter((t) => t.date.startsWith(todayString)).length;
    const treatmentsThisWeek = treatments.filter((t) => new Date(t.date) >= startOfWeek).length;
    const treatmentsThisMonth = treatments.filter((t) => new Date(t.date) >= startOfMonth).length;
    const treatmentsThisYear = treatments.filter((t) => new Date(t.date) >= startOfYear).length;
  
    return { treatmentsToday, treatmentsThisWeek, treatmentsThisMonth, treatmentsThisYear };
  };
  


  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6 space-y-6">
        <h1 className="text-3xl font-bold">Statistiques du Cabinet Dentaire</h1>
{/* Payment & Treatment Statistics Section */}
<div className="bg-white p-6 shadow-lg rounded-lg mt-6">
  <h2 className="text-xl font-semibold mb-4">Statistiques Financières et Médicales</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
    
    {/* Total Payments */}
    <div className="p-4 bg-gray-100 rounded-lg">
      <span className="text-sm text-gray-500">Total Paiements</span>
      <h4 className="text-xl font-bold text-green-600">{getPaymentStatistics().totalPayments.toFixed(2)} DZD</h4>
    </div>

    {/* Today's Payments */}
    <div className="p-4 bg-blue-100 rounded-lg">
      <span className="text-sm text-gray-500">Paiements Aujourd'hui</span>
      <h4 className="text-xl font-bold text-blue-600">{getPaymentStatistics().paymentsToday.toFixed(2)} DZD</h4>
    </div>

    {/* This Week's Payments */}
    <div className="p-4 bg-yellow-100 rounded-lg">
      <span className="text-sm text-gray-500">Paiements Cette Semaine</span>
      <h4 className="text-xl font-bold text-yellow-600">{getPaymentStatistics().paymentsThisWeek.toFixed(2)} DZD</h4>
    </div>

    {/* This Month's Payments */}
    <div className="p-4 bg-purple-100 rounded-lg">
      <span className="text-sm text-gray-500">Paiements Ce Mois</span>
      <h4 className="text-xl font-bold text-purple-600">{getPaymentStatistics().paymentsThisMonth.toFixed(2)} DZD</h4>
    </div>

    {/* This Year's Payments */}
    <div className="p-4 bg-red-100 rounded-lg">
      <span className="text-sm text-gray-500">Paiements Cette Année</span>
      <h4 className="text-xl font-bold text-red-600">{getPaymentStatistics().paymentsThisYear.toFixed(2)} DZD</h4>
    </div>

    {/* Treatments Today */}
    <div className="p-4 bg-blue-100 rounded-lg">
      <span className="text-sm text-gray-500">Traitements Aujourd'hui</span>
      <h4 className="text-xl font-bold text-blue-600">{getTreatmentStatistics().treatmentsToday}</h4>
    </div>

    {/* Treatments This Week */}
    <div className="p-4 bg-yellow-100 rounded-lg">
      <span className="text-sm text-gray-500">Traitements Cette Semaine</span>
      <h4 className="text-xl font-bold text-yellow-600">{getTreatmentStatistics().treatmentsThisWeek}</h4>
    </div>

    {/* Treatments This Month */}
    <div className="p-4 bg-purple-100 rounded-lg">
      <span className="text-sm text-gray-500">Traitements Ce Mois</span>
      <h4 className="text-xl font-bold text-purple-600">{getTreatmentStatistics().treatmentsThisMonth}</h4>
    </div>

    {/* Treatments This Year */}
    <div className="p-4 bg-red-100 rounded-lg">
      <span className="text-sm text-gray-500">Traitements Cette Année</span>
      <h4 className="text-xl font-bold text-red-600">{getTreatmentStatistics().treatmentsThisYear}</h4>
    </div>

  </div>
</div>

        {/* Patients Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Évolution du Nombre de Patients</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={patientData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#4CAF50" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Treatments Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Nombre de Traitements Réalisés</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={treatmentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#FF5733" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payments Line Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Paiements Reçus par Jour</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={paymentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="totalPaid" stroke="#0088FE" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Payments Pie Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Répartition des Paiements</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentPieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label
              >
                {paymentPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
      </div>
      
    </div>
  );
};

export default Autres;
