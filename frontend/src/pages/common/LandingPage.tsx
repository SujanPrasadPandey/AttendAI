import NavbarLandingPage from "@/components/landingPage/NavbarLandingPage";
import Hero from "@/components/landingPage/Hero";
import Features from "@/components/landingPage/Features";


const LandingPage = () => {
  return (
    <>
      <div className="bg-[#232539] box-border h-[calc(100vh-2.5rem)] m-5 rounded-lg flex flex-col">
        <NavbarLandingPage />
        <Hero />
      </div>
      <Features />
      {/* 
      <ContactUs />
      <Footer /> */}
    </>
  );
};

export default LandingPage;

