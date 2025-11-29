# 🚀 Airtable-Connected Dynamic Form Builder

![Status](https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge)
![Stack](https://img.shields.io/badge/MERN-Stack-blue?style=for-the-badge)
![Auth](https://img.shields.io/badge/Auth-OAuth_2.0-purple?style=for-the-badge)

A full-stack SaaS application that allows users to create **dynamic, logic-driven forms** mapped directly to their **Airtable** databases. It features secure OAuth authentication, a custom conditional logic engine, and dual-write data synchronization between Airtable and MongoDB.

🔗 **[Live Demo Application](https://airtable-form-builder-dun.vercel.app)**
*(Login with your Airtable account to test the Admin Dashboard)*

---

## 📸 Screenshots

| **Admin Dashboard** | **Logic Builder** |
|:---:|:---:|
| ![Dashboard](https://placehold.co/600x400/2d2d2d/FFF?text=Admin+Dashboard) | ![Builder](https://placehold.co/600x400/2d2d2d/FFF?text=Logic+Configuration) |

| **Public Form (Hidden Field)** | **Public Form (Logic Triggered)** |
|:---:|:---:|
| ![Public Form Hidden](https://placehold.co/600x400/2d2d2d/FFF?text=Field+Hidden) | ![Public Form Visible](https://placehold.co/600x400/2d2d2d/FFF?text=Field+Revealed) |

---

## ✨ Key Features

### 🔐 Authentication & Security
* **Airtable OAuth 2.0:** Secure login using official Airtable credentials.
* **Token-Based Auth:** Custom JWT implementation using a **URL-token strategy** to bypass cross-site cookie restrictions on modern browsers (Safari/Firefox).

### 🏗️ Form Builder
* **Dynamic Schema Fetching:** Automatically pulls Bases, Tables, and Fields from the user's Airtable account.
* **Field Support:** Supports Single Line Text, Long Text, Select, Multi-Select, Email, URL, and Attachments.

### 🧠 Conditional Logic Engine
* **Client-Side Evaluation:** A pure function engine that evaluates rules in real-time.
* **Complex Rules:** Define visibility rules like *"Show GitHub URL only if Role equals 'Engineer'"*.

### 💾 Dual-Write Synchronization
* **Cloud & Local Sync:** Submissions are saved to **Airtable** (for the user) and backed up to **MongoDB** (for the app).
* **Reliability:** Ensures data is never lost even if one service is down.

### 📊 Admin Dashboard
* **Response Viewer:** View all incoming submissions in a clean, dark-themed data table.
* **Shareable Links:** One-click copy for public form URLs.

---

## 🛠️ Tech Stack

| **Frontend** | **Backend** | **Infrastructure** |
| :--- | :--- | :--- |
| React (Vite) | Node.js | Vercel (Frontend) |
| React Router | Express.js | Render (Backend) |
| Axios (Interceptors) | MongoDB (Mongoose) | MongoDB Atlas |
| CSS Modules | JSON Web Tokens | Airtable API |

---

## 🚀 How to Run Locally

Follow these steps to set up the project on your local machine.

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/airtable-form-builder.git](https://github.com/your-username/airtable-form-builder.git)
cd airtable-form-builder
