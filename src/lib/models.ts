import mongoose, { Schema, model, models } from "mongoose";

// --- User Schema ---
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  role: { type: String, enum: ["student", "admin"], default: "student" },
  createdAt: { type: Date, default: Date.now },
});

export const User = models.User || model("User", UserSchema);

// --- Settings Schema (Admin Config) ---
const SettingsSchema = new Schema({
  waveName: { type: String, default: "Gelombang 1" },
  waveStart: { type: Date },
  waveEnd: { type: Date },
  // Multiple fee groups (Golongan)
  feeGroups: [
    {
      name: { type: String, required: true }, // e.g. "Reguler", "Prestasi"
      description: String,
      items: {
        registration: { type: Number, default: 0 },
        participation: { type: Number, default: 0 },
        uniformSport: { type: Number, default: 0 },
        uniformBatik: { type: Number, default: 0 },
        developmentArts: { type: Number, default: 0 },
        developmentAcademic: { type: Number, default: 0 },
        books: { type: Number, default: 0 },
        orientation: { type: Number, default: 0 },
        lab: { type: Number, default: 0 },
        library: { type: Number, default: 0 },
        healthUnit: { type: Number, default: 0 },
        osis: { type: Number, default: 0 },
        tuition: { type: Number, default: 0 },
      },
    },
  ],
});

export const Settings = models.Settings || model("Settings", SettingsSchema);

// --- Registration Schema (Student Data) ---
const RegistrationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  registrationNumber: { type: String, unique: true }, // Auto-generated e.g. PPDB-2025-001
  status: {
    type: String,
    enum: ["draft", "pending", "verified", "rejected"], // pending = sudah bayar & upload, verified = diterima
    default: "draft",
  },

  // Fee Group Selection
  golongan: { type: String, default: "Reguler" },

  // Completeness Flags
  checklist: {
    biodata: { type: Boolean, default: false },
    documents: { type: Boolean, default: false },
    payment: { type: Boolean, default: false },
  },

  // Student Details
  student: {
    fullName: String,
    gender: { type: String, enum: ["L", "P"] },
    birthPlace: String,
    birthDate: Date,
    originSchool: String,
    religion: String,
    address: {
      street: String,
      rt: String,
      rw: String,
      village: String,
      district: String,
      city: String,
      province: String,
    },
    livingWith: String,
    siblingCount: Number,
  },

  // Parents
  father: {
    name: String,
    birthDate: Date,
    education: String,
    job: String,
    phone: String,
  },
  mother: {
    name: String,
    birthDate: Date,
    education: String,
    job: String,
    phone: String,
  },
  guardian: {
    name: String,
    job: String,
    phone: String,
    address: String,
  },

  // Docs
  documents: {
    familyCard: String, // URL
    birthCertificate: String, // URL
    paymentProof: String, // URL
  },

  payment: {
    totalAmount: Number,
    verifiedAt: Date,
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Registration =
  models.Registration || model("Registration", RegistrationSchema);
