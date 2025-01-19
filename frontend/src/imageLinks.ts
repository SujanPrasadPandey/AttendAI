import reactLogo from "@/assets/react.svg";
import testBackground from "@/test.svg";

interface ImageLinks {
  logo: string;
  background: string;
  viteLogo: string;
  landingPageDashboard: string,
}

const imageLinks: ImageLinks = {
  logo: reactLogo,
  background: testBackground,
  viteLogo: "/vite.svg", // Public assets should use absolute URLs
  landingPageDashboard: "/landingPageDashboard.png",
};

export default imageLinks;
