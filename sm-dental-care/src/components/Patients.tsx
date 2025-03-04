import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "./Sidebar";
import PatientForm from "./PatientForm";
import PatientTreatments from "./PatientTreatments";
import ConfirmationModal from "./ConfirmationModal";
import { FaPlus, FaEdit, FaTrash, FaMedkit } from "react-icons/fa";
import toast from "react-hot-toast";
import { exportPatientsToWord } from "../utils/exportToWord";


const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState<string>("all");
  const [showAllPatients, setShowAllPatients] = useState(false); // State to toggle between all patients and today's patients
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [selectedPatientForTreatments, setSelectedPatientForTreatments] = useState<Patient | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | null;
    payload: Patient | null;
  }>({ type: null, payload: null });


  const fetchPatients = useCallback(async () => {
    if (selectedPatientForTreatments) return;
  
    try {
      const response = await window.electronAPI.getAllPatients();
      if (response.success && Array.isArray(response.patients)) {
        const patientsWithTreatments = await Promise.all(
          response.patients.map(async (patient: any) => {
            const treatmentsResponse = await window.electronAPI.getPatientTreatments(patient.id);
            if (treatmentsResponse.success) {
              patient.treatments = await Promise.all(
                treatmentsResponse.treatments.map(async (treatment: any) => {
                  const paymentsResponse = await window.electronAPI.getTreatmentPayments(treatment.id);
                  treatment.paymentHistory = paymentsResponse.success ? paymentsResponse.payments : [];
                  return treatment;
                })
              );
            }
            return patient;
          })
        );
  
        setPatients(patientsWithTreatments);
        setFilteredPatients(patientsWithTreatments);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to fetch patients");
    }
  }, [selectedPatientForTreatments]);
  

   // Get today's date in YYYY-MM-DD format
   const today = new Date().toISOString().split("T")[0];

   // Filter patients who were added today OR have treatments/payments today
   const filteredPatientsList = patients.filter((p) => 
     p.date.startsWith(today) ||
     p.treatments?.some((t) => t.date.startsWith(today)) ||
     p.treatments?.some((t) => t.paymentHistory?.some((pay) => pay.date.startsWith(today)))
   );

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // useEffect(() => {
  //   const lowercasedSearchTerm = searchTerm.toLowerCase();
  //   setFilteredPatients(
  //     patients.filter((patient) => {
  //       if (searchField === "all") {
  //         return Object.values(patient).some((value) =>
  //           String(value).toLowerCase().includes(lowercasedSearchTerm)
  //         );
  //       }
  //       return String(patient[searchField as keyof Patient])
  //         .toLowerCase()
  //         .includes(lowercasedSearchTerm);
  //     })
  //   );
  // }, [patients, searchTerm, searchField]);

  useEffect(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
  
    // Determine which patient list to apply the search on
    const patientsToSearch = showAllPatients ? patients : filteredPatientsList;
  
    setFilteredPatients(
      patientsToSearch.filter((patient) => {
        if (searchField === "all") {
          return Object.values(patient).some((value) =>
            String(value).toLowerCase().includes(lowercasedSearchTerm)
          );
        }
        return String(patient[searchField as keyof Patient])
          .toLowerCase()
          .includes(lowercasedSearchTerm);
      })
    );
  }, [patients, searchTerm, searchField, showAllPatients, filteredPatientsList]);
  

   

  const getPatientStatistics = () => {
    const today = new Date();
    const todayString = today.toISOString().split("T")[0]; // YYYY-MM-DD format
  
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Get Sunday of this week
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);
  
    const patientsToday = patients.filter((p) => p.date.startsWith(todayString)).length;
    const patientsThisWeek = patients.filter((p) => new Date(p.date) >= startOfWeek).length;
    const patientsThisMonth = patients.filter((p) => new Date(p.date) >= startOfMonth).length;
    const patientsThisYear = patients.filter((p) => new Date(p.date) >= startOfYear).length;
  
    return {
      total: patients.length,
      today: patientsToday,
      thisWeek: patientsThisWeek,
      thisMonth: patientsThisMonth,
      thisYear: patientsThisYear,
    };
  };
  

  const handleSubmit = async (patientData: PatientCreateData) => {
    try {
      if (editingPatient) {
        const result = await window.electronAPI.updatePatient(editingPatient.id, patientData);
        if (result.success) {
          await fetchPatients();
          setShowForm(false);
          setEditingPatient(null);
          toast.success("Patient updated successfully");

        }
      } else {
        const result = await window.electronAPI.addPatient(patientData);
        if (result.success) {
          await fetchPatients();
          setShowForm(false);
          toast.success("Patient added successfully");

        }
      }
    } catch (error) {
      console.error('Error handling patient submission:', error);
      toast.error("Failed to process patient data");

    }
  };

  const handleCancelAction = () => {
    setConfirmAction({ type: null, payload: null });
    setEditingPatient(null);
    setShowForm(false);
  };

  const handleConfirmAction = async () => {
    if (confirmAction.type === "delete" && confirmAction.payload) {
      try {
        await window.electronAPI.deletePatient(confirmAction.payload.id);
        await fetchPatients();
        toast.success("Patient deleted successfully");

      } catch (error) {
        console.error("Error deleting patient:", error);
        toast.error("Failed to delete patient");

      }
    }
    setConfirmAction({ type: null, payload: null });
  };

 

  const handleAddTreatment = async (treatmentData: Omit<TreatmentFormData, 'patientId'> & { patientId: number }) => {
    try {
      const response = await window.electronAPI.addTreatment(treatmentData);
      if (response.success && selectedPatientForTreatments) {
        const patientResponse = await window.electronAPI.getPatientTreatments(selectedPatientForTreatments.id);
        if (patientResponse.success) {
          const mappedTreatments = mapAPITreatmentsToTreatments(patientResponse.treatments);
          setSelectedPatientForTreatments(prev => ({
            ...prev!,
            treatments: mappedTreatments
          }));
          toast.success("Treatment added successfully");

        }
      }
    } catch (error) {
      console.error("Error adding treatment:", error);
      toast.error("Failed to add treatment");

    }
  };

  const mapAPITreatmentsToTreatments = (apiTreatments: any[]): Treatment[] => {
    return apiTreatments.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      date: t.date,
      price: t.price,
      patientId: t.patient_id,
      paymentHistory: t.payments?.map((p: any) => ({
        id: p.id,
        paid: p.paid,
        date: p.date,
        act: p.act,
        treatment_id: t.id
      })) || []
    }));
  };

  const handleUpdateTreatment = async (treatmentId: number, treatmentData: Partial<Treatment>) => {
    try {
      const response = await window.electronAPI.updateTreatment(treatmentId, treatmentData);
      if (response.success && selectedPatientForTreatments) {
        const patientResponse = await window.electronAPI.getPatientTreatments(selectedPatientForTreatments.id);
        if (patientResponse.success) {
          const mappedTreatments = mapAPITreatmentsToTreatments(patientResponse.treatments);
          setSelectedPatientForTreatments(prev => ({
            ...prev!,
            treatments: mappedTreatments 
          }));
          toast.success("Treatment updated successfully");

        }
      }
    } catch (error) {
      console.error("Error updating treatment:", error);
      toast.error("Failed to update treatment");

    }
  };

  const handleDeleteTreatment = async (treatmentId: number) => {
    try {
      const response = await window.electronAPI.deleteTreatment(treatmentId);
      if (response.success && selectedPatientForTreatments) {
        const patientResponse = await window.electronAPI.getPatientTreatments(selectedPatientForTreatments.id);
        if (patientResponse.success) {
          const mappedTreatments = mapAPITreatmentsToTreatments(patientResponse.treatments);
          setSelectedPatientForTreatments(prev => ({
            ...prev!,
            treatments: mappedTreatments
          }));
          toast.success("Treatment deleted successfully");

        }
      }
    } catch (error) {
      console.error("Error deleting treatment:", error);
      toast.error("Failed to delete treatment");

    }
  };

  if (selectedPatientForTreatments) {
    return (
      <PatientTreatments
        key={selectedPatientForTreatments.id}
        patient={selectedPatientForTreatments}
        onBack={() => setSelectedPatientForTreatments(null)}
        onAddTreatment={handleAddTreatment}
        onUpdateTreatment={handleUpdateTreatment}
        onDeleteTreatment={handleDeleteTreatment}
      />
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0C1B33]">
      <Sidebar />
      <div className="flex-1 p-2 bg-[#0C1B33] ">
  
        <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-2 mt-4 mb-2">

          <button
            className="flex items-center justify-center py-2 px-4 w-full sm:w-36 bg-[#9c916b] text-white text-sm font-semibold rounded-lg hover:bg-[#c2b583] transition-colors"
            onClick={() => {
              setEditingPatient(null);
              setShowForm(true);
            }}
          >
            <FaPlus className="mr-2" /> Add Patient
          </button>
          <button
  onClick={() => exportPatientsToWord()}  // No arguments here
  className="bg-[#03B5AA] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#1a7771] "
>
  Download Register History
</button>
          <select
            title="Filter"
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            className="w-full sm:w-40 px-4 py-2 bg-white border rounded-md text-sm shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
          >
            <option value="all">All Fields</option>
            <option value="name">Name</option>
            <option value="last_name">Last Name</option>
            <option value="age">Age</option>
            <option value="date">Date</option>
            <option value="case_description">Case Description</option>
          </select>
          <input
            type="text"
            className="w-full sm:w-80 h-11 px-4 pl-12 text-sm text-gray-700 bg-white border rounded-full focus:ring-2 focus:ring-green-500 focus:outline-none shadow-md"
            placeholder="Search for patient"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

            {/* Toggle button to switch between all patients and today's patients */}
        <button
          onClick={() => setShowAllPatients(!showAllPatients)}
          className="px-4 py-2 bg-emerald-800 text-white text-sm rounded-lg hover:bg-emerald-600"
        >
          {showAllPatients ? "Show Today's Patients" : "Show All Patients"}
        </button>
        </div>

 {/* Patient Statistics Section */}
 <div className=" bg-[#B2AA8E] p-4 shadow rounded-lg text-[#0C1B33] bottom-0 my-4">
  <h3 className="text-lg font-semibold mb-2">Patient Statistics</h3>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
    <div className="p-2 bg-gray-100 rounded-lg">
      <span className="text-sm text-gray-500">Total Patients</span>
      <h4 className="text-xl font-bold">{getPatientStatistics().total}</h4>
    </div>
    <div className="p-2 bg-green-100 rounded-lg">
      <span className="text-sm text-gray-500">Today's New Patients</span>
      <h4 className="text-xl font-bold">{getPatientStatistics().today}</h4>
    </div>
    <div className="p-2 bg-blue-100 rounded-lg">
      <span className="text-sm text-gray-500">This Week</span>
      <h4 className="text-xl font-bold">{getPatientStatistics().thisWeek}</h4>
    </div>
    <div className="p-2 bg-cyan-100 rounded-lg">
      <span className="text-sm text-gray-500">This Month</span>
      <h4 className="text-xl font-bold">{getPatientStatistics().thisMonth}</h4>
    </div>
    <div className="p-2 bg-purple-100 rounded-lg">
      <span className="text-sm text-gray-500">This Year</span>
      <h4 className="text-xl font-bold">{getPatientStatistics().thisYear}</h4>
    </div>
  </div>
</div> 



        <div className="overflow-x-auto bg-[#e0d6b0] shadow rounded-lg mx-2">
          <table className="min-w-full table-auto">
            <thead className="bg-[#e0d6b0] border-b">
              <tr>
                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">Last Name</th>
                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">Age</th>
                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">Case Description</th>
                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-400">
            {/* {(showAllPatients ? patients : filteredPatientsList).map((patient) => ( */}
            {filteredPatients.map((patient) => (
              <tr
              key={patient.id}
              className="bg-[#f7eecb] hover:bg-[#cdc191] cursor-pointer"
              onDoubleClick={() => setSelectedPatientForTreatments(patient)}
            >
            
                  <td className="px-5 py-3 text-sm text-gray-700">{patient.name}</td>
                  <td className="px-5 py-3 text-sm text-gray-700">{patient.last_name}</td>
                  {/* <td className="px-5 py-3 text-sm text-gray-700">{patient.age}</td> */}
                  <td className="px-5 py-3 text-sm text-gray-700">{patient.age ?? "N/A"}  {/* Display "N/A" if age is undefined */}</td>
                  <td className="px-5 py-3 text-sm text-gray-700">{patient.date}</td>
                  <td className="px-5 py-3 text-sm text-gray-700">{patient.case_description}</td>
                  <td className="px-5 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => {
                          setEditingPatient(patient);
                          setShowForm(true);
                        }}
                        title="Edit patient"
                      >
                        <FaEdit className="mr-1" /> 
                      </button>
                      <button
                        onClick={() => setSelectedPatientForTreatments(patient)}
                        className="text-green-600 hover:text-green-800"
                        title="View treatments"
                      >
                        <FaMedkit className="inline mr-1" /> Treatments
                      </button>
                      <button
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setConfirmAction({ type: "delete", payload: patient })}
                        title="Delete patient"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
        </div>
   

     

      </div>
        

      {showForm && (
        <PatientForm
          patient={editingPatient ? {
            name: editingPatient.name,
            last_name: editingPatient.last_name,
            age: editingPatient.age || 0,
            date: editingPatient.date,
            case_description: editingPatient.case_description
          } : undefined}
          onCancel={handleCancelAction}
          onSubmit={handleSubmit}
        />
      )}
      {confirmAction.type && confirmAction.payload && (
        <ConfirmationModal
          actionType="delete"
          onCancel={handleCancelAction}
          onConfirm={handleConfirmAction}
          message={`Are you sure you want to delete ${confirmAction.payload.name}?`}
        />
      )}
    </div>
  );
};

export default Patients;
