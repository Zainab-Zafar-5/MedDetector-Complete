import axios from "axios";

// 1. Central API Configuration
const API = axios.create({ 
    baseURL: "http://localhost:5000/api" 
});

// 2. Security Interceptor (Token injection)
// ⚡ src/api.js Ke Top Par Yeh Interceptor Confirm Karein
// src/api.js ke request interceptor ko is tarah static lock kar dein:
API.interceptors.request.use((req) => {
    // Standardize to 'pharmacyToken' across your entire frontend
    const token = localStorage.getItem("pharmacyToken");
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

// ─── AUTHENTICATION ───
export const loginPharmacy = (formData) => API.post("/login", formData);

// ─── DASHBOARD & PROFILE (💡 DIRECT INSTANCE PASS) ───
// src/api.js ke andar in lines ko check karke wapas normal karlein:

// ─── DASHBOARD & PROFILE (RESTORED TO AXIOS INTERCEPTOR INSTANCE) ───
export const getDashboard = () => API.get("/dashboard/stats");
export const getProfile = () => API.get("/profile");
export const updateProfile = (data) => API.put("/pharmacy/profile", data);

// ─── MEDICINE INVENTORY (RESTORED TO AXIOS INTERCEPTOR INSTANCE) ───
export const getMedicines = (page = 1) => API.get(`/medicines?page=${page}`);
export const addMedicine     = (data) => API.post("/medicines", data);
export const updateMedicine  = (id, data) => API.put(`/medicines/${id}`, data);
export const deleteMedicine  = (id) => API.delete(`/medicines/${id}`);

// ─── PATIENT REQUESTS (ORDERS) ───
export const getRequests   = () => API.get("/requests");
export const addRequest    = (data) => API.post("/requests", data);
export const updateRequest = (id, data) => API.patch(`/requests/${id}`, data);
export const deleteRequest = (id) => API.delete(`/requests/${id}`);

// ─── RESERVATIONS ───
export const getReservations = () => API.get("/reservations");
export const addReservation  = (data) => API.post("/reservations", data);
export const deleteReservation = (id) => API.delete(`/reservations/${id}`);
export const updateReservation = (id, data) => API.patch(`/reservations/${id}`, data);

// ─── FEEDBACK ───
export const submitFeedback      = (data) => API.post("/feedback", data);
export const getPublicFeedback   = ()     => API.get("/feedback/public");
export const getPharmacyFeedback = ()     => API.get("/feedback/pharmacy");
export const replyToFeedback     = (id, text) => API.put(`/feedback/${id}/reply`, { text });
export const searchPharmacies    = (q)    => API.get(`/pharmacies?q=${q}`);

// ─── ADMIN: FEEDBACK (view all feedback — every pharmacy + the website) ───
// NOTE: assumes a backend route GET /api/feedback/admin that returns
// { success, data } with every feedback entry across pharmacies + website.
// Rename the path below if your backend route is named differently.
export const getAdminFeedback = () => API.get("/feedback/admin");
export const deleteFeedback   = (id) => API.delete(`/feedback/${id}`);

export default API;