import reactLogo from "@/assets/react.svg";
import testBackground from "@/test.svg";

interface ImageLinks {
  logo: string;
  background: string;
  viteLogo: string;
  landingPageDashboard: string,
  landingPageFeatures_analytic: string,
  landingPageFeatures_insight: string,
  landingPageFeatures_leave: string,
  landingPageFeatures_secure: string,
  landingPageFeatures_smarter: string,
  landingPageFeatures_tailored: string,
}

const imageLinks: ImageLinks = {
  logo: reactLogo,
  background: testBackground,
  viteLogo: "/vite.svg", // Public assets should use absolute URLs
  landingPageDashboard: "/landingPageDashboard.png",
  landingPageFeatures_analytic: "/landingPageFeatures_analytic.png",
  landingPageFeatures_insight: "/landingPageFeatures_insight.png",
  landingPageFeatures_leave: "/landingPageFeatures_leave.png",
  landingPageFeatures_secure: "/landingPageFeatures_secure.png",
  landingPageFeatures_smarter: "/landingPageFeatures_smarter.png",
  landingPageFeatures_tailored: "/landingPageFeatures_tailored.png",
};

export default imageLinks;
