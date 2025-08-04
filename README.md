# 🛒 Headless E-Commerce Project – Interview Task

This project is built using **Next.js 14 App Router** with **TypeScript**, **Zustand**, **Tailwind CSS**, **Framer Motion**, **React Hook Form**, **Apollo Client (GraphQL)**, and optionally **Saleor** & **Sanity.io**.  
It is part of an interview assignment given by Kombee.

---

## 📌 Project Overview

The goal of the project was to:

- Set up a scalable front-end architecture using modern technologies.
- Implement login functionality.
- Integrate GraphQL using Apollo Client.
- Prepare for integration with e-commerce APIs (e.g. Saleor) or provided custom APIs (Postman collection).
- Design a clean and responsive UI.

---

## 🔧 Tech Stack

- **Next.js 14 (App Router)**
- **TypeScript**
- **Zustand** – for state management
- **Tailwind CSS** – for styling
- **React Hook Form** – for form handling
- **Framer Motion** – for animations
- **Apollo Client** – for GraphQL integration
- **(Optional) Saleor** – for e-commerce backend
- **(Optional) Sanity.io** – for CMS (blogs, banners, SEO)

---

## ✅ Features Implemented

- [x] Project setup with modern stack
- [x] Responsive login page (UI + logic)
- [x] Apollo Client integrated for future GraphQL queries
- [x] Zustand configured for global state management (Auth, Cart)
- [x] Folder structure optimized for scalability

---

## ⚠️ Challenges Faced

- It was not fully clear whether the project should:
  - Use the provided **Postman API collection**, or
  - Use platforms like **Saleor** and **Sanity.io** to build the backend.
- Some key data (like `price`, `slug`, and `channel`) were missing in the API responses, which made it difficult to complete certain flows (like product details or checkout).
- Due to the limited time, I focused on setting up the architecture and implementing login flow, with room to scale up.

---

## 🚀 How to Run Locally

```bash
git clone https://github.com/karanvanzwala/KombeeX-.git
cd Kombeex
npm install
npm run dev
