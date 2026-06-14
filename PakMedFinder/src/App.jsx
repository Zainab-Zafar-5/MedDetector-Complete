import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

import './App.css';

// --- MAIN WEBSITE COMPONENTS ---
import NavBar from './NavBar/NavBar';
import Footer from './Footer/Footer';
import HeroSection from './Components/HeroSection/HeroSection';
import FeaturesSection from './Components/FeaturesSection/FeaturesSection';
import WhyUs from './Components/WhyUs/WhyUs';
import CTASection from './Components/CtaSection/CtaSection';
import StatsSection from './Components/StatsSection/StatsSection';
import FAQSection from './Components/FAQSection/FAQSection';
import PartnerDetailsPage from './Components/PartnerDetailsPage/PartnerDetailsPage';
import PartnerRegistration from './Components/PartnerRegistration/PartnerRegistration';
import SearchResults from './SearchResults/SearchResults';
import ShortageMap from './ShortageMap/ShortageMap'; // ✅ Correct Import
import HeroSectionImage from './assets/HeroSectionImage.png';

// --- PHARMACY PORTAL IMPORTS (V2 Removed) ---
import Dashboard    from './PharmacyPortal/pages/Dashboard';
import Medicines    from './PharmacyPortal/pages/Medicines';
import AddMedicine  from './PharmacyPortal/pages/AddMedicine';
import Requests     from './PharmacyPortal/pages/Requests';
import Reservations from './PharmacyPortal/pages/Reservations';
import Profile      from './PharmacyPortal/pages/Profile';
import Prescriptions from "./PharmacyPortal/pages/Prescriptions";

// --- OTHER IMPORTS ---
import LoginPage      from "./Components/Login/Login";
import AdminDashboard from './AdminDashboard/AdminDashboard';

// --- 🏠 Home Page Wrapper ---
const HomePage = () => (
  <>
    <HeroSection
      title="Find the Medicines You Need — Instantly."
      subtitle="Real-time medicine availability, shortage alerts, and AI-powered alternatives."
      ctaPrimary={{ label: 'Search Medicine'}}
      ctaSecondary={{ label: 'View Shortage Map'}} 
      imageUrl={HeroSectionImage}
    />
    <FeaturesSection id="features" />
    <WhyUs />
    <CTASection />
    <StatsSection />
    <FAQSection id="faq" />
  </>
);

// --- 🛡️ Layout Logic (Maintains UI Cleanliness) ---
const Layout = ({ children }) => {
  const location = useLocation();
  
  // Routes jahan NavBar aur Footer nahi dikhana (Portals & Maps)
  const hideLayout = 
    location.pathname.startsWith("/pharmacy") || 
    location.pathname.startsWith("/dashboard") ||
    location.pathname === "/partner-register" ||
    location.pathname === "/admin-portal" ||
    location.pathname === "/shortage-map"; 

  return (
    <>
      {!hideLayout && <NavBar />}
      <main>{children}</main>
      {!hideLayout && <Footer />}
    </>
  );
};

function App() {
  return (
    <Layout>
      <Routes>
        {/* --- Main Website Routes (Unchanged) --- */}
        <Route path="/" element={<HomePage />} />
        <Route path="/why-us" element={<WhyUs />} />
        <Route path="/partner-details/:id" element={<PartnerDetailsPage />} />
        <Route path="/partner-register"    element={<PartnerRegistration />} />
        <Route path="/search-results"      element={<SearchResults />} />
        <Route path="/shortage-map"        element={<ShortageMap />} />

        {/* --- AUTH ROUTES --- */}
        {/* Login ko portal ka entry point rakha hai */}
        <Route path="/login" element={<LoginPage />} />

        {/* --- ADMIN ROUTES --- */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* --- PHARMACY PORTAL ROUTES (Clean Paths & V2 Removed) --- */}
        {/* Ye routes ab seedha Atlas database se connect honge */}
        <Route path="/pharmacy/dashboard"    element={<Dashboard />} />
        <Route path="/pharmacy/medicines"    element={<Medicines />} />
        <Route path="/pharmacy/add-medicine" element={<AddMedicine />} />
        <Route path="/pharmacy/requests"     element={<Requests />} />
        <Route path="/pharmacy/reservations" element={<Reservations />} />
        <Route path="/pharmacy/profile"      element={<Profile />} />
        <Route path="/pharmacy/prescriptions" element={<Prescriptions />} />

        {/* --- REDIRECTS & ERROR HANDLING --- */}
        {/* Agar koi purana '/dashboard' link kholay toh wo naye path par chala jaye */}
        <Route path="/dashboard/*" element={<Navigate to="/pharmacy/dashboard" />} />
        {/* Ghalat URL par auto-login redirect */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Layout>
  );
}

export default App;