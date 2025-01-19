const NavbarLandingPage: React.FC = () => {
  return (
    <div className="h-24 flex justify-between items-center px-8 text-lg font-sans">
      {/* Logo */}
      <div className="font-plaster text-xl">
        <a href="/" aria-label="Navigate to home">
          <span className="text-[#385167]">Attend</span>
          <span className="text-[#89B5FA]">AI</span>
        </a>
      </div>

      {/* Navigation Links */}
      <nav className="space-x-16">
        <a href="#home" className="hover:text-gray-300">
          Home
        </a>
        <a href="#features" className="hover:text-gray-300">
          Features
        </a>
        <a href="#contact-us" className="hover:text-gray-300">
          Contact Us
        </a>
      </nav>

      {/* Buttons */}
      <div className="space-x-4">
        <a href="/signup" aria-label="Sign up">
          <button className="px-4 py-2 rounded-lg outline outline-2 outline-[#313244] hover:bg-[#313244]">
            Sign Up
          </button>
        </a>
        <a href="/signin" aria-label="Sign in">
          <button className="px-4 py-2 rounded-lg outline outline-2 outline-[#313244] hover:bg-[#313244]">
            Sign In
          </button>
        </a>
      </div>
    </div>
  );
};

export default NavbarLandingPage;