"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Link, useLocation, NavLink } from "react-router-dom";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Search, Menu, X } from "lucide-react";
import logo from "../../assets/logos.png";
import "./Navbar.css";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const location = useLocation();

  const CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID;
  const DOMAIN = import.meta.env.VITE_COGNITO_DOMAIN;
  const REDIRECT_URI = import.meta.env.VITE_COGNITO_REDIRECT_URI;

  const loginUrl = `https://${DOMAIN}/login?client_id=${CLIENT_ID}&response_type=code&scope=email+openid+profile&redirect_uri=${REDIRECT_URI}`;
  const logoutUrl = `https://${DOMAIN}/logout?client_id=${CLIENT_ID}&logout_uri=${REDIRECT_URI}`;

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsLoggedIn(true);
    }
    const query = new URLSearchParams(location.search);
    if (query.get("loggedIn")) {
      setIsLoggedIn(true);
      window.history.replaceState(null, "", window.location.pathname);
    }

    // Add scroll event listener
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    window.location.href = logoutUrl;
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchValue.trim()) {
      // Navigate to listings with search query
      window.location.href = `/listings?search=${encodeURIComponent(
        searchValue
      )}`;
    }
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            <img src={logo || "/placeholder.svg"} alt="DalXchangeLogo" />
          </Link>

          <Button
            icon={<Menu size={24} />}
            className="mobile-menu-btn p-button-text"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Menu"
          />

          <div className="navbar-links">
            <span className="navbar-search">
              <InputText
                placeholder="Search"
                className="p-inputtext-sm"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleSearch}
              />
              <Search size={16} className="search-icon" />
            </span>

            <NavLink
              to="/listings"
              className={({ isActive }) =>
                isActive ? "navbar-link active" : "navbar-link"
              }
            >
              Listings
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                isActive ? "navbar-link active" : "navbar-link"
              }
            >
              About
            </NavLink>

            {isLoggedIn ? (
              <>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    isActive ? "navbar-link active" : "navbar-link"
                  }
                >
                  Profile
                </NavLink>
                <Button
                  label="Logout"
                  onClick={handleLogout}
                  className="p-button-sm logout-btn"
                  icon={
                    <i
                      className="pi pi-sign-out"
                      style={{ marginRight: "0.5rem" }}
                    ></i>
                  }
                />
              </>
            ) : (
              <Button
                label="Login/Register"
                onClick={() => (window.location.href = loginUrl)}
                className="p-button-sm login-btn"
                icon={
                  <i
                    className="pi pi-user"
                    style={{ marginRight: "0.5rem" }}
                  ></i>
                }
              />
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-menu-header">
          <Link
            to="/"
            className="navbar-logo"
            onClick={() => setMobileMenuOpen(false)}
          >
            <img
              src={logo || "/placeholder.svg"}
              alt="DalXchangeLogo"
              style={{ height: "60px" }}
            />
          </Link>
          <Button
            icon={<X size={24} />}
            className="mobile-menu-close p-button-text"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          />
        </div>

        <div className="mobile-menu-links">
          <InputText
            placeholder="Search listings..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                window.location.href = `/listings?search=${encodeURIComponent(
                  searchValue
                )}`;
                setMobileMenuOpen(false);
              }
            }}
            style={{ marginBottom: "1rem" }}
          />

          <Link
            to="/listings"
            className="mobile-menu-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            Listings
          </Link>
          <Link
            to="/about"
            className="mobile-menu-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </Link>
          {isLoggedIn ? (
            <>
              <Link
                to="/profile"
                className="mobile-menu-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <Link
                to="/create-listing"
                className="mobile-menu-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Create Listing
              </Link>
              <Button
                label="Logout"
                onClick={handleLogout}
                className="p-button-sm logout-btn"
                style={{ marginTop: "1rem" }}
                icon={
                  <i
                    className="pi pi-sign-out"
                    style={{ marginRight: "0.5rem" }}
                  ></i>
                }
              />
            </>
          ) : (
            <Button
              label="Login/Register"
              onClick={() => (window.location.href = loginUrl)}
              className="p-button-sm login-btn"
              style={{ marginTop: "1rem" }}
              icon={
                <i className="pi pi-user" style={{ marginRight: "0.5rem" }}></i>
              }
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
