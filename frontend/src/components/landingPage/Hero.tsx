import imageLinks from "@/imageLinks";

const Hero: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col justify-between text-center">
      {/* Headings */}
      <div className="text-6xl space-y-4 mt-28">
        <h1>Revolutionize School Attendance with</h1>
        <h1 className="text-primary font-semibold">
          Facial Recognition Technology
        </h1>
      </div>

      {/* Description */}
      <div className="mt-14 text-xl">
        <p>
          An efficient, accurate, and seamless attendance management system
          tailored for schools.
        </p>
      </div>

      {/* Buttons */}
      <div className="space-x-6 mt-12">
        <a href="" aria-label="Watch Overview">
          <button
            type="button"
            className="px-5 py-5 rounded-lg text-2xl bg-[#33495F] font-semibold text-[#BAC2E3] hover:bg-[#283b4a] transition duration-200"
          >
            Watch Overview
          </button>
        </a>
        <a href="" aria-label="Get Started">
          <button
            type="button"
            className="px-5 py-5 rounded-lg text-2xl bg-[#89B5FA] font-semibold text-[#1E1E2E] hover:bg-[#6f9be0] transition duration-200"
          >
            Get Started
          </button>
        </a>
      </div>

      {/* Image at the Bottom */}
      <div className="flex justify-center items-end h-full mt-12">
        <img
          src={imageLinks.landingPageDashboard}
          alt="Dashboard overview"
          className="w-full max-w-6xl"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default Hero;
