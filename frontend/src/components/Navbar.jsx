import React, { useState } from "react";
import { FiLogOut, FiMenu, FiX, FiUser, FiBell } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";

const Navbar = () => {
  const router = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 shadow-2xl border-b border-blue-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white tracking-wide">
                Sphoorthy Engineering College
              </span>
              <span className="text-xs text-blue-200 font-medium tracking-wider uppercase">
                Academic Management System
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <RxDashboard className="text-blue-300 text-lg" />
              <span className="text-white font-medium">
                {router.state && router.state.type} Dashboard
              </span>
            </div>
            
            {/* User Profile Section */}
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-blue-200 hover:text-white transition-colors">
                <FiBell className="text-xl" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                  <FiUser className="text-white text-sm" />
                </div>
                <span className="text-white font-medium text-sm">
                  {router.state && router.state.type}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isMobileMenuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </button>
          </div>

          {/* Logout Button */}
          <div className="hidden md:flex items-center">
            <button
              className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              onClick={() => navigate("/")}
            >
              <FiLogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-800/95 backdrop-blur-sm rounded-xl mt-4 p-4 border border-blue-500/20">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-4 py-3">
                <RxDashboard className="text-blue-300" />
                <span className="text-white font-medium">
                  {router.state && router.state.type} Dashboard
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                    <FiUser className="text-white text-sm" />
                  </div>
                  <span className="text-white font-medium text-sm">
                    {router.state && router.state.type}
                  </span>
                </div>
                
                <button
                  className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                  onClick={() => navigate("/")}
                >
                  <FiLogOut className="mr-2 h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;