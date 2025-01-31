import { useNavigate } from "react-router-dom";

const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div id="home" className="flex-1 flex flex-col justify-between text-center px-4 md:px-8">
      {/* Headings */}
      <div className="space-y-4 mt-12 sm:mt-20 md:mt-28">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
          Revolutionize School Attendance with
        </h1>
        <h1 className="text-primary font-semibold text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
          Facial Recognition Technology
        </h1>
      </div>

      {/* Description */}
      <div className="mt-8 sm:mt-10 md:mt-14 text-lg sm:text-xl lg:text-2xl">
        <p>
          An efficient, accurate, and seamless attendance management system
          tailored for schools.
        </p>
      </div>

      {/* Buttons */}
      <div className="space-x-4 sm:space-x-6 mt-10 sm:mt-12">
        <a href="" aria-label="Watch Overview">
          <button
            type="button"
            className="px-4 py-3 sm:px-5 sm:py-4 rounded-lg text-lg sm:text-xl md:text-2xl bg-[#33495F] font-semibold text-[#BAC2E3] hover:bg-[#283b4a] transition duration-200"
          >
            Watch Overview
          </button>
        </a>
        <a href="" aria-label="Get Started">
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="px-4 py-3 sm:px-5 sm:py-4 rounded-lg text-lg sm:text-xl md:text-2xl bg-[#89B5FA] font-semibold text-[#1E1E2E] hover:bg-[#6f9be0] transition duration-200"
          >
            Get Started
          </button>
        </a>
      </div>

      {/* Image at the Bottom */}
      <div className="flex justify-center items-end h-full mt-10 sm:mt-12">
        <img
          src="/landingPageDashboard.png"
          alt="Dashboard overview"
          className="w-full max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-4xl"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default Hero;
