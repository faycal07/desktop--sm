// // src/utils/exportToWord.ts
// import { saveAs } from 'file-saver';
// import {
//   Document,
//   Packer,
//   Paragraph,
//   Table,
//   TableCell,
//   TableRow,
//   WidthType,
//   BorderStyle,
//   AlignmentType
// } from 'docx';

// interface Payment {
//   id: number;
//   paid: number;
//   date: string;
//   act: string;
//   treatment_id: number;
// }

// interface Treatment {
//   id: number;
//   name: string;
//   description: string;
//   date: string;
//   price: number;
//   patientId: number;
//   paymentHistory?: Payment[];
// }

// interface Patient {
//   id: number;
//   name: string;
//   last_name: string;
//   age?: number;
//   case_description: string;
//   date: string;
//   treatments: Treatment[]; // Removed optionality to ensure it's always an array
// }

// export const exportPatientsToWord = async () => {
//   // Fetch latest data
//   const response = await window.electronAPI.getAllPatients();
//   const patients = response.success ? response.patients : [];

//   // Fetch treatments and payments for each patient
//   const enrichedPatients = await Promise.all(
//     patients.map(async (patient: Patient) => {
//       const treatmentsResponse = await window.electronAPI.getPatientTreatments(patient.id);
//       if (treatmentsResponse.success) {
//         // Map patient_id to patientId
//         patient.treatments = await Promise.all(
//           treatmentsResponse.treatments.map(async (t: any) => {
//             const paymentsResponse = await window.electronAPI.getTreatmentPayments(t.id);
//             const treatment: Treatment = {
//               id: t.id,
//               name: t.name,
//               description: t.description,
//               date: t.date,
//               price: t.price,
//               patientId: t.patient_id, // Remap here
//               paymentHistory: paymentsResponse.success ? paymentsResponse.payments : []
//             };
//             return treatment;
//           })
//         );
//       } else {
//         // If no treatments, assign an empty array
//         patient.treatments = [];
//       }
//       return patient;
//     })
//   );

//   const doc = new Document({
//     sections: [
//       {
//         children: [
//           // Title
//           new Paragraph({
//             text: "Patients Report",
//             heading: "Heading1",
//             alignment: AlignmentType.CENTER,
//           }),

//           // Main Table
//           new Table({
//             width: {
//               size: 100,
//               type: WidthType.PERCENTAGE,
//             },
//             borders: {
//               top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
//               bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
//               left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
//               right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
//               insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
//               insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
//             },
//             rows: [
//               // Main Header Row
//               new TableRow({
//                 children: [
//                   new TableCell({ children: [new Paragraph("Patient Name")] }),
//                   new TableCell({ children: [new Paragraph("Age")] }),
//                   new TableCell({ children: [new Paragraph("Case Description")] }),
//                   new TableCell({ children: [new Paragraph("Date")] }),

//                   // Treatments Main Header
//                   new TableCell({
//                     children: [new Paragraph("Treatments")],
//                     columnSpan: 4,
//                   }),

//                   // Payments Main Header
//                   new TableCell({
//                     children: [new Paragraph("Payments")],
//                     columnSpan: 3,
//                   }),
//                 ],
//               }),

//               // Subheaders for Treatments and Payments
//               new TableRow({
//                 children: [
//                   new TableCell({ children: [] }),
//                   new TableCell({ children: [] }),
//                   new TableCell({ children: [] }),
//                   new TableCell({ children: [] }),

//                   new TableCell({ children: [new Paragraph("Name")] }),
//                   new TableCell({ children: [new Paragraph("Description")] }),
//                   new TableCell({ children: [new Paragraph("Date")] }),
//                   new TableCell({ children: [new Paragraph("Price")] }),

//                   new TableCell({ children: [new Paragraph("Date")] }),
//                   new TableCell({ children: [new Paragraph("Amount Paid")] }),
//                   new TableCell({ children: [new Paragraph("Act")] }),
//                 ],
//               }),

//               // Data Rows
//               ...enrichedPatients.map((patient) => {
//                 // Handle case where patient has no treatments
//                 if (patient.treatments.length === 0) {
//                   return new TableRow({
//                     children: [
//                       new TableCell({ children: [new Paragraph(`${patient.name} ${patient.last_name}`)] }),
//                       new TableCell({ children: [new Paragraph(`${patient.age ?? "N/A"}`)] }),
//                       new TableCell({ children: [new Paragraph(patient.case_description)] }),
//                       new TableCell({ children: [new Paragraph(patient.date)] }),

//                       new TableCell({ children: [new Paragraph("/")] }),
//                       new TableCell({ children: [new Paragraph("/")] }),
//                       new TableCell({ children: [new Paragraph("/")] }),
//                       new TableCell({ children: [new Paragraph("/")] }),

//                       new TableCell({ children: [new Paragraph("/")] }),
//                       new TableCell({ children: [new Paragraph("/")] }),
//                       new TableCell({ children: [new Paragraph("/")] }),
//                     ],
//                   });
//                 }

//                 const treatmentRows = patient.treatments.map((treatment) => {
//                   const paymentRows = (treatment.paymentHistory || []).map((payment) =>
//                     new TableRow({
//                       children: [
//                         ...Array(8).fill(new TableCell({ children: [new Paragraph("")] })),
//                         new TableCell({ children: [new Paragraph(payment.date)] }),
//                         new TableCell({ children: [new Paragraph(`${payment.paid} DZD`)] }),
//                         new TableCell({ children: [new Paragraph(payment.act)] }),
//                       ],
//                     })
//                   );

//                   return [
//                     new TableRow({
//                       children: [
//                         new TableCell({ children: [new Paragraph(`${patient.name} ${patient.last_name}`)] }),
//                         new TableCell({ children: [new Paragraph(`${patient.age ?? "N/A"}`)] }),
//                         new TableCell({ children: [new Paragraph(patient.case_description)] }),
//                         new TableCell({ children: [new Paragraph(patient.date)] }),

//                         new TableCell({ children: [new Paragraph(treatment.name)] }),
//                         new TableCell({ children: [new Paragraph(treatment.description)] }),
//                         new TableCell({ children: [new Paragraph(treatment.date)] }),
//                         new TableCell({ children: [new Paragraph(`${treatment.price} DZD`)] }),

//                         ...Array(3).fill(new TableCell({ children: [new Paragraph("")] })),
//                       ],
//                     }),
//                     ...paymentRows
//                   ];
//                 });

//                 return treatmentRows.flat();
//               }).flat(),
//             ],
//           }),
//         ],
//       },
//     ],
//   });

//   Packer.toBlob(doc).then((blob) => {
//     saveAs(blob, 'Patients_Report_History.docx');
//   });
// };
// src/utils/exportToWord.ts
import { saveAs } from 'file-saver';
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  WidthType,
  BorderStyle,
  AlignmentType
} from 'docx';

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

interface Patient {
  id: number;
  name: string;
  last_name: string;
  age?: number;
  case_description: string;
  date: string;
  treatments: Treatment[];
}

export const exportPatientsToWord = async () => {
  // Fetch latest data
  const response = await window.electronAPI.getAllPatients();
  const patients = response.success ? response.patients : [];

  // Fetch treatments and payments for each patient
  const enrichedPatients = await Promise.all(
    patients.map(async (patient: Patient) => {
      const treatmentsResponse = await window.electronAPI.getPatientTreatments(patient.id);
      if (treatmentsResponse.success) {
        patient.treatments = await Promise.all(
          treatmentsResponse.treatments.map(async (t: any) => {
            const paymentsResponse = await window.electronAPI.getTreatmentPayments(t.id);
            const treatment: Treatment = {
              id: t.id,
              name: t.name,
              description: t.description,
              date: t.date,
              price: t.price,
              patientId: t.patient_id,
              paymentHistory: paymentsResponse.success ? paymentsResponse.payments : []
            };
            return treatment;
          })
        );
      } else {
        patient.treatments = [];
      }
      return patient;
    })
  );

  const doc = new Document({
    sections: [
      {
        children: [
          // Title
          new Paragraph({
            text: "Patients Report",
            heading: "Heading1",
            alignment: AlignmentType.CENTER,
          }),

          // Main Table
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
              insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
            },
            rows: [
              // Main Header Row
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Patient Name")] }),
                  new TableCell({ children: [new Paragraph("Age")] }),
                  new TableCell({ children: [new Paragraph("Case Description")] }),
                  new TableCell({ children: [new Paragraph("Date")] }),

                  // Treatments Main Header
                  new TableCell({
                    children: [new Paragraph("Treatments")],
                    columnSpan: 4,
                  }),

                  // Payments Main Header
                  new TableCell({
                    children: [new Paragraph("Payments")],
                    columnSpan: 3,
                  }),
                ],
              }),

              // Subheaders for Treatments and Payments
              new TableRow({
                children: [
                  new TableCell({ children: [] }),
                  new TableCell({ children: [] }),
                  new TableCell({ children: [] }),
                  new TableCell({ children: [] }),

                  new TableCell({ children: [new Paragraph("Name")] }),
                  new TableCell({ children: [new Paragraph("Description")] }),
                  new TableCell({ children: [new Paragraph("Date")] }),
                  new TableCell({ children: [new Paragraph("Price")] }),

                  new TableCell({ children: [new Paragraph("Date")] }),
                  new TableCell({ children: [new Paragraph("Amount Paid")] }),
                  new TableCell({ children: [new Paragraph("Act")] }),
                ],
              }),

              // Data Rows
              ...enrichedPatients.map((patient) => {
                const treatmentRows = patient.treatments.length
                  ? patient.treatments.map((treatment) => {
                      const paymentRows = (treatment.paymentHistory || []).map((payment) =>
                        new TableRow({
                          children: [
                            ...Array(4).fill(new TableCell({ children: [new Paragraph("")] })), // Skip Patient Info

                            ...Array(4).fill(new TableCell({ children: [new Paragraph("")] })), // Skip Treatment Info

                            new TableCell({ children: [new Paragraph(payment.date)] }),
                            new TableCell({ children: [new Paragraph(`${payment.paid} DZD`)] }),
                            new TableCell({ children: [new Paragraph(payment.act)] }),
                          ],
                        })
                      );

                      // Return Treatment Row + Payment Rows
                      return [
                        new TableRow({
                          children: [
                            new TableCell({ children: [new Paragraph(`${patient.name} ${patient.last_name}`)] }),
                            new TableCell({ children: [new Paragraph(`${patient.age ?? "/"}`)] }),
                            new TableCell({ children: [new Paragraph(patient.case_description)] }),
                            new TableCell({ children: [new Paragraph(patient.date)] }),

                            new TableCell({ children: [new Paragraph(treatment.name)] }),
                            new TableCell({ children: [new Paragraph(treatment.description)] }),
                            new TableCell({ children: [new Paragraph(treatment.date)] }),
                            new TableCell({ children: [new Paragraph(`${treatment.price} DZD`)] }),

                            ...Array(3).fill(new TableCell({ children: [new Paragraph("/")]})),
                          ],
                        }),
                        ...paymentRows
                      ];
                    })
                  : [
                      new TableRow({
                        children: [
                          new TableCell({ children: [new Paragraph(`${patient.name} ${patient.last_name}`)] }),
                          new TableCell({ children: [new Paragraph(`${patient.age ?? "/"}`)] }),
                          new TableCell({ children: [new Paragraph(patient.case_description)] }),
                          new TableCell({ children: [new Paragraph(patient.date)] }),

                          ...Array(7).fill(new TableCell({ children: [new Paragraph("/")]})),
                        ],
                      }),
                    ];

                return treatmentRows.flat();
              }).flat(),
            ],
          }),
        ],
      },
    ],
  });

  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, 'Patients_Report_History.docx');
  });
};
