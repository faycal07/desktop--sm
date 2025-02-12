const jwt = require('jsonwebtoken');
const db = require("./db");
const bcrypt = require("bcrypt");
const SALT_ROUNDS = 10; // Number of salt rounds for hashing
const fs = require("fs");
const path = require("path");

const getEnvFilePath = () => {
  if (process.env.NODE_ENV === "production" || process.resourcesPath) {
    // In packaged Electron app, env.json is inside resources folder
    return path.join(process.resourcesPath, "env.json");
  } else {
    // In development, it's in the root directory
    return path.join(__dirname, ".env");
    
  }
};

// // Load SECRET_KEY
let SECRET_KEY;

try {
  const envFilePath = getEnvFilePath();
  const envData = fs.readFileSync(envFilePath, "utf8");
  const envConfig = JSON.parse(envData);

  SECRET_KEY = envConfig.SECRET_KEY;
  if (!SECRET_KEY) {
    throw new Error("SECRET_KEY is missing in env.json");
  }
} catch (error) {
  console.error("Failed to load SECRET_KEY:", error.message);
  SECRET_KEY = null; // Ensure it's explicitly null if loading fails
}


// require('dotenv').config();
// require('dotenv').config(); // Load environment variables from .env

  
// const SECRET_KEY = process.env.SECRET_KEY;   

function registerUser({ name, username, password }) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, SALT_ROUNDS, (err, hashedPassword) => {
      if (err) {
        console.error("Error hashing password:", err);
        reject(err);
      } else {
        console.log("Hashed password generated:", hashedPassword);
        db.run(
          "INSERT INTO users (name, username, password) VALUES (?, ?, ?)",
          [name, username, hashedPassword], // Store name along with username and password
          function (err) {
            if (err) {
              if (err.code === "SQLITE_CONSTRAINT") {
                console.error("Username already exists");
                resolve({ success: false, message: "Username already exists" });
              } else {
                console.error("Database error:", err);
                reject(err);
              }
            } else {
              console.log("User registered successfully");
              resolve({ success: true });
            }
          }
        );
      }
    });
  });
}

// Authenticate a user and return a JWT
function authenticateUser({ username, password }) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM users WHERE username = ?",
      [username],
      (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          // Compare the provided password with the hashed password in the database
          bcrypt.compare(password, row.password, (err, result) => {
            if (err) {
              reject(err);
            } else if (result) {
              // Generate a JWT token
              console.log("SECRET_KEY:", process.env.SECRET_KEY);
              
              const token = jwt.sign({ username },SECRET_KEY, { expiresIn: '24h' });
              console.log('Generated JWT Token:', token); // Debug log

              // ✅ Include username in the response
              resolve({ success: true, token, username, message: "Login successful" });
            } else {
              console.error('Invalid credentials');
              resolve({ success: false, message: "Invalid credentials" });
            }
          });
        } else {
          console.error('User not found');
          resolve({ success: false, message: "User not found" });
        }
      }
    );
  });
}


function verifyToken(token) {
  return new Promise((resolve, reject) => {
    console.log("Token received for verification:", token);

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        console.error("Token verification error:", err);
        reject({ success: false, message: "Token invalid or expired" });
      } else {
        console.log("Decoded token payload:", decoded);
        resolve({ success: true, username: decoded.username });
      }
    });
  });
}



module.exports = { registerUser, authenticateUser, verifyToken };
