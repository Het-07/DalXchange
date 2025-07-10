// src/App.tsx
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Homepage from "./pages/Homepage/Homepage";
import CreateListing from "./pages/CreateListing/CreateListing";
import Listings from "./pages/Listings/Listings";
import Profile from "./pages/Profile/Profile";
import About from "./pages/About/About";
// import NotFound from "./pages/NotFound/NotFound";
import AuthCallback from "./pages/Authentication/AuthCallback";

function App() {
  return (
    <Routes>
      {/* Wrapped layout (Navbar + Footer) */}
      <Route element={<Layout />}>
        <Route path="/" element={<Homepage />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<About />} />
      </Route>

      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Standalone page (no layout) */}
      <Route path="/create-listing" element={<CreateListing />} />
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
}

export default App;
