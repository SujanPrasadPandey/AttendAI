const features = [
    { icon: '🎓', title: 'Smarter Attendance', description: 'Leverage advanced facial recognition technology for quick, precise, and hassle-free attendance tracking, minimizing errors and manual effort.' },
    { icon: '📊', title: 'Instant Insights', description: 'Stay updated with real-time attendance data and notifications, empowering teachers and admins to make informed decisions instantly.' },
];

const Features = () => {
    return (
        <div className="flex justify-center flex-col items-center">
            <div className="text-center mt-12">
                <h1 className="text-5xl font-bold m-10">Features</h1>
            </div>
            <div className="space-x-8 bg-red-500 w-[1206px]">
                {features.map((feature, idx) => (
                    <div
                        key={idx}
                        className="p-4 border rounded bg-gray-800 text-lightText shadow hover:shadow-lg"
                    >
                        <div className="text-4xl mb-4">{feature.icon}</div>
                        <h3 className="text-xl font-bold">{feature.title}</h3>
                        <p className="text-gray-400">{feature.description}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Features