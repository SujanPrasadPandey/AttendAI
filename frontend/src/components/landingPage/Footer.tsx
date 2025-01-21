import React from "react";
import { FaGithub, FaLinkedin, FaInstagram, FaBook, FaCode } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-[#272739] text-textPrimary max-w-[1197px] h-[388px] mx-auto p-8 rounded-lg flex flex-col items-center m-16">
      {/* Logo and Slogan */}
      <div className="mb-4">
        <div className="font-plaster text-3xl text-center">
          <button
            onClick={() => navigate("/")}
            aria-label="Navigate to home"
            className="focus:outline-none"
          >
            <span className="text-[#385167]">Attend</span>
            <span className="text-[#89B5FA]">AI</span>
          </button>
        </div>
        <p className="mt-2 text-lg">Smarter Attendance</p>
      </div>

      {/* Links Section */}
      <div className="flex flex-wrap justify-center gap-16 mb-6">
        <div className="flex flex-col items-center">
          <h4 className="text-lg font-semibold mb-2">Project Links</h4>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <FaBook />
              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#89B5FA]"
              >
                Docs
              </a>
            </li>
            <li className="flex items-center gap-2">
              <FaCode />
              <a
                href=""
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#89B5FA]"
              >
                GitHub
              </a>
            </li>
          </ul>
        </div>

        <div className="flex flex-col items-center">
          <h4 className="text-lg font-semibold mb-2">Social Links</h4>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <FaGithub />
              <a
                href="https://github.com/SujanPrasadPandey"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#89B5FA]"
              >
                GitHub
              </a>
            </li>
            <li className="flex items-center gap-2">
              <FaLinkedin />
              <a
                href="https://www.linkedin.com/in/88sujanpandey/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#89B5FA]"
              >
                LinkedIn
              </a>
            </li>
            <li className="flex items-center gap-2">
              <FaInstagram />
              <a
                href="https://www.instagram.com/88sujanpandey/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#89B5FA]"
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-gray-400 text-sm text-center">
        &copy; {new Date().getFullYear()} AttendAI. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
