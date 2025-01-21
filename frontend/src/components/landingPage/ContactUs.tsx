import { useState } from "react";

const ContactUs = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Placeholder for email sending functionality using Supabase or other services
    try {
      // Add logic here to send email
      console.log("Sending email", { fullName, email, message });
      setSuccess(true);
      setError("");
    } catch (err) {
      setSuccess(false);
      setError("Failed to send message. Please try again later.");
    }
  };

  return (
    <div id="contact-us" className="bg-[#232539] min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-[#CDD6F4] font-inter font-bold text-4xl mb-8">Contact Us</h1>

      <div className="max-w-4xl w-full flex flex-col md:flex-row bg-[#1E1E2E] p-8 rounded-lg shadow-lg">
        {/* Left Side */}
        <div className="flex-1 text-[#CDD6F4] font-inter mb-8 md:mb-0 md:mr-8">
          <h2 className="text-3xl font-bold mb-4">Let's Get in Touch</h2>
          <p className="mb-2">Or just reach out manually to me</p>
          <a
            href="mailto:88sujanpandey@gmail.com"
            className="text-[#89B5FA] underline hover:text-[#A6C8FF]"
          >
            88sujanpandey@gmail.com
          </a>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-inter text-[#CDD6F4] mb-2"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name..."
                className="w-full h-[40px] px-4 bg-[#292E44] text-[#CDD6F4] border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-[#89B5FA]"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-inter text-[#CDD6F4] mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="w-full h-[40px] px-4 bg-[#292E44] text-[#CDD6F4] border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-[#89B5FA]"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-inter text-[#CDD6F4] mb-2"
              >
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your main text here..."
                className="w-full h-[120px] px-4 py-2 bg-[#292E44] text-[#CDD6F4] border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-[#89B5FA]"
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-[#89B5FA] text-[#292E44] font-inter font-semibold text-lg rounded-md w-full h-[54px] flex items-center justify-center hover:bg-[#A6C8FF]"
            >
              Submit
            </button>
          </form>

          {success && (
            <p className="text-[#A6E3A1] text-sm text-center mt-4">
              Your message has been sent successfully.
            </p>
          )}
          {error && (
            <p className="text-[#F38BA8] text-sm text-center mt-4">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
