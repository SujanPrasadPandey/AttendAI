import React from 'react';

const features = [
    {
        icon: "/landingPageFeatures_smarter.png", 
        title: 'Smarter Attendance',
        description: 'Leverage advanced facial recognition technology for quick, precise, and hassle-free attendance tracking, minimizing errors and manual effort.'
    },
    {
        icon: "/landingPageFeatures_insight.png",
        title: 'Instant Insights',
        description: 'Stay updated with real-time attendance data and notifications, empowering teachers and admins to make informed decisions instantly.'
    },
    {
        icon: "/landingPageFeatures_leave.png",
        title: 'Simplified Leave Requests',
        description: 'Easily manage student leave requests with a streamlined approval process, reducing paperwork and administrative overhead.'
    },
    {
        icon: "/landingPageFeatures_tailored.png",
        title: 'Tailored User Access',
        description: 'Provide dedicated dashboards for teachers, students, parents, and admins, ensuring everyone gets the right tools and information.'
    },
    {
        icon: "/landingPageFeatures_secure.png",
        title: 'Secure by Design',
        description: 'Keep sensitive attendance data safe with robust encryption and privacy protocols, protecting schools and students from breaches.'
    },
    {
        icon: "/landingPageFeatures_analytic.png",
        title: 'Meaningful Analytics',
        description: 'Unlock valuable insights into attendance trends and student behavior with powerful analytics, helping improve engagement and outcomes.'
    },
];


const Features: React.FC = () => {
    return (
        <div id='features' className="max-w-[1206px] mx-auto px-4 py-16">
            <h1 className="text-5xl font-bold text-center text-[#CDD6F4] mb-12">Features</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, idx) => (
                    <div
                        key={idx}
                        className="w-[379px] h-[328px] bg-[#232539] text-[#CDD6F4] rounded-lg shadow-lg flex flex-col items-center justify-between p-6"
                    >
                        <img
                            src={feature.icon}
                            alt={feature.title}
                            className="w-20 h-20 object-contain mb-4"
                        />
                        <h3 className="text-3xl font-semibold mb-4">{feature.title}</h3>
                        <p className="text-sm text-center leading-relaxed">
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Features;