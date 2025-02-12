const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

// Determine the correct directory for the database
const dataDir = app.isPackaged
  ? path.join(app.getPath('userData'), 'data') // Use userData for packaged apps
  : path.join(__dirname, 'data'); // Use the 'data' folder in development

// Ensure the directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true }); // Create directories recursively
}

// Path to the database file
const dbPath = path.join(dataDir, 'sm.db');
console.log('Database path:', dbPath);

// Initialize the database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to the database:', err.message);
  } else {
    console.log(`Connected to SQLite database at ${dbPath}`);
  }
});

// Create `users` table
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`, (err) => {
  if (err) console.error('Error creating users table:', err.message);
  else console.log('Users table created or already exists.');
});


// Function to get a user by username
db.getUserByUsername = (username) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM users WHERE username = ?`;
    db.get(query, [username], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
};
  

// Create `patients` table
db.run(`
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    age INTEGER,
    case_description TEXT,
    date TEXT
  )
`, (err) => {
  if (err) console.error('Error creating patients table:', err.message);
  else console.log('Patients table created successfully.');
});

// Create `treatments` table with ON DELETE CASCADE
db.run(`
  CREATE TABLE IF NOT EXISTS treatments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    date TEXT,
    price REAL,
    patient_id INTEGER NOT NULL,
    FOREIGN KEY(patient_id) REFERENCES patients(id) ON DELETE CASCADE
  )
`, (err) => {
  if (err) console.error('Error creating treatments table:', err.message);
  else console.log('Treatments table created successfully.');
});

// Create `payments` table with ON DELETE CASCADE
db.run(`
  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paid REAL NOT NULL,
    date TEXT NOT NULL,
    act TEXT,
    treatment_id INTEGER NOT NULL,
    FOREIGN KEY(treatment_id) REFERENCES treatments(id) ON DELETE CASCADE
  )
`, (err) => {
  if (err) console.error('Error creating payments table:', err.message);
  else console.log('Payments table created successfully.');
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON;', (err) => {
  if (err) console.error('Error enabling foreign keys:', err.message);
  else console.log('Foreign keys enabled.');
});

// Fetch all patients with treatments and payments
db.getAllPatients = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        p.*,
        json_group_array(
          json_object(
            'id', t.id,
            'name', t.name,
            'description', t.description,
            'date', t.date,
            'price', t.price,
            'payments', (
              SELECT json_group_array(
                json_object(
                  'id', pm.id,
                  'paid', pm.paid,
                  'date', pm.date,
                  'act', pm.act
                )
              )
              FROM payments pm
              WHERE pm.treatment_id = t.id
            )
          )
        ) as treatments
      FROM patients p
      LEFT JOIN treatments t ON t.patient_id = p.id
      GROUP BY p.id
    `;

    db.all(query, [], (err, rows) => {
      if (err) return reject(err);
      const patients = rows.map(row => ({
        ...row,
        treatments: JSON.parse(row.treatments).filter(t => t.id !== null)
      }));
      resolve(patients);
    });
  });
};



db.getAllPatientTreatments = () => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM treatments`;

    db.all(query, [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

db.getAllTreatmentPayments = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        pm.*,
        json_object(
          'id', t.id,
          'name', t.name,
          'description', t.description,
          'date', t.date,
          'price', t.price
        ) AS treatment
      FROM payments pm
      LEFT JOIN treatments t ON pm.treatment_id = t.id
    `;

    db.all(query, [], (err, rows) => {
      if (err) return reject(err);
      const payments = rows.map(row => ({
        ...row,
        treatment: JSON.parse(row.treatment)
      }));
      resolve(payments);
    });
  });
};



// Add a new patient
db.addPatient = (patientData) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO patients (name, last_name, age, case_description, date) 
      VALUES (?, ?, ?, ?, ?)
    `;
    db.run(query, [
      patientData.name,
      patientData.last_name,
      patientData.age,
      patientData.case_description,
      patientData.date || new Date().toISOString()
    ], function(err) {
      if (err) return reject(err);
      resolve({ success: true, patientId: this.lastID });
    });
  });
};

// Add a new treatment for a specific patient
db.addTreatment = (treatmentData) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO treatments (name, description, date, price, patient_id) 
      VALUES (?, ?, ?, ?, ?)
    `;
    db.run(query, [
      treatmentData.name,
      treatmentData.description,
      treatmentData.date,
      treatmentData.price,
      treatmentData.patient_id
    ], function(err) {
      if (err) return reject(err);
      resolve({ success: true, treatmentId: this.lastID });
    });
  });
};

// Add a new payment for a specific treatment
db.addPayment = (paymentData) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO payments (paid, date, act, treatment_id) 
      VALUES (?, ?, ?, ?)
    `;
    db.run(query, [
      paymentData.paid,
      paymentData.date,
      paymentData.act,
      paymentData.treatment_id
    ], function(err) {
      if (err) return reject(err);
      resolve({ success: true, paymentId: this.lastID });
    });
  });
};

// Update a patient's details
db.updatePatient = (id, patientData) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE patients
      SET name = ?, last_name = ?, age = ?, case_description = ?, date = ?
      WHERE id = ?
    `;
    db.run(query, [
      patientData.name,
      patientData.last_name,
      patientData.age,
      patientData.case_description,
      patientData.date,
      id
    ], function(err) {
      if (err) return reject(err);
      resolve({ success: true });
    });
  });
};

db.getUserByToken = (token) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT name, username,password FROM users WHERE token = ?";
    db.get(query, [token], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  }); 
};  
  
db.updateUserProfile = (userData) => {
  return new Promise((resolve, reject) => {
    const query = "UPDATE users SET name = ?, username = ?, password = ? WHERE username = ?";
    
    db.run(query, [userData.name, userData.username, userData.password, userData.currentUsername], function (err) {
      if (err) {
        reject(err);
      } else if (this.changes === 0) {
        resolve(false); // ✅ No rows updated, return false
      } else {
        resolve(true); // ✅ Successfully updated user
      }
    });
  });
}; 
 
db.deleteUserAccount = (username) => {
  return new Promise((resolve, reject) => {
    const query = "DELETE FROM users WHERE username = ?";
    db.run(query, [username], function (err) {
      if (err) return reject(err);
      resolve({ success: true });
    });
  });
};

 

// Update a treatment's details
db.updateTreatment = (id, treatmentData) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE treatments
      SET name = ?, description = ?, date = ?, price = ?
      WHERE id = ?
    `;
    db.run(query, [
      treatmentData.name,
      treatmentData.description,
      treatmentData.date,
      treatmentData.price,
      id
    ], function(err) {
      if (err) return reject(err);
      resolve({ success: true });
    });
  });
};

// Update a payment's details
db.updatePaymentHistory = (id, paymentData) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE payments
      SET paid = ?, date = ?, act = ?
      WHERE id = ?
    `;
    db.run(query, [
      paymentData.paid,
      paymentData.date,
      paymentData.act,
      id
    ], function(err) {
      if (err) return reject(err);
      resolve({ success: true });
    });
  });
};

// Delete a patient and cascade delete treatments and payments
db.deletePatient = (id) => {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM patients WHERE id = ?';
    db.run(query, [id], function(err) {
      if (err) return reject(err);
      resolve({ success: true });
    });
  });
};

// Delete a treatment and cascade delete related payments
db.deleteTreatment = (id) => {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM treatments WHERE id = ?';
    db.run(query, [id], function(err) {
      if (err) return reject(err);
      resolve({ success: true });
    });
  });
};

// Delete a payment
db.deletePayment = (id) => {
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM payments WHERE id = ?';
    db.run(query, [id], function(err) {
      if (err) return reject(err);
      resolve({ success: true });
    });
  });
};

db.getPatientTreatments = (patientId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        t.*,
        COALESCE(
          json_group_array(
            json_object(
              'id', p.id,
              'paid', p.paid,
              'date', p.date,
              'act', p.act
            )
          ),
          '[]'
        ) as payments
      FROM treatments t
      LEFT JOIN payments p ON p.treatment_id = t.id
      WHERE t.patient_id = ?
      GROUP BY t.id
    `;

    db.all(query, [patientId], (err, rows) => {
      if (err) return reject(err);

      const treatments = rows.map(row => ({
        ...row,
        payments: JSON.parse(row.payments),
      }));

      resolve({ treatments }); // Wrap in an object for consistency
    });
  });
};


module.exports = db;
