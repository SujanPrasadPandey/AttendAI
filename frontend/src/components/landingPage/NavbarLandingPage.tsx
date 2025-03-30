import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

const NavbarLandingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigation = (id: string, route: string) => {
    if (location.pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(route);
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
    setIsMenuOpen(false); // Close menu on navigation
  };

  return (
    <header className="bg-[#232539] text-[#CDD6F4]">
      <div className="flex justify-between items-center px-6 md:px-10 lg:px-16 h-16 md:h-24">
        {/* Logo */}
        <div className="font-plaster text-xl">
          <button
            onClick={() => navigate("/")}
            aria-label="Navigate to home"
            className="focus:outline-none"
          >
            <span className="text-[#385167]">Attend</span>
            <span className="text-[#89B5FA]">AI</span>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex space-x-8 text-lg">
          <button
            // onClick={() => handleNavigation("home", "/")}
            onClick={() => navigate("/")}
            className="hover:text-gray-300 focus:outline-none"
          >
            Home
          </button>
          <button
            onClick={() => handleNavigation("features", "/")}
            className="hover:text-gray-300 focus:outline-none"
          >
            Features
          </button>
          <button
            onClick={() => handleNavigation("contact-us", "/")}
            className="hover:text-gray-300 focus:outline-none"
          >
            Contact Us
          </button>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-2xl focus:outline-none"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Desktop Buttons */}
        <div className="hidden md:flex space-x-4">
          <button
            onClick={() => navigate("/signup")}
            className="px-4 py-2 rounded-lg outline outline-2 outline-[#313244] hover:bg-[#313244] focus:outline-none"
            aria-label="Sign up"
          >
            Sign Up
          </button>
          <button
            onClick={() => navigate("/signin")}
            className="px-4 py-2 rounded-lg outline outline-2 outline-[#313244] hover:bg-[#313244] focus:outline-none"
            aria-label="Sign in"
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <nav className="md:hidden bg-[#1e1e2e] text-center space-y-4 py-6">
          <button
            onClick={() => handleNavigation("home", "/")}
            className="block hover:text-gray-300 focus:outline-none"
          >
            Home
          </button>
          <button
            onClick={() => handleNavigation("features", "/")}
            className="block hover:text-gray-300 focus:outline-none"
          >
            Features
          </button>
          <button
            onClick={() => handleNavigation("contact-us", "/")}
            className="block hover:text-gray-300 focus:outline-none"
          >
            Contact Us
          </button>
          <div className="space-y-4">
            <button
              onClick={() => navigate("/signup")}
              className="w-full px-4 py-2 rounded-lg outline outline-2 outline-[#313244] hover:bg-[#313244] focus:outline-none"
              aria-label="Sign up"
            >
              Sign Up
            </button>
            <button
              onClick={() => navigate("/signin")}
              className="w-full px-4 py-2 rounded-lg outline outline-2 outline-[#313244] hover:bg-[#313244] focus:outline-none"
              aria-label="Sign in"
            >
              Sign In
            </button>
          </div>
        </nav>
      )}
    </header>
  );
};

export default NavbarLandingPage;
