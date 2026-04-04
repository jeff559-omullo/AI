// Updated OfficerDashboard.jsx

import React from 'react';

const OfficerDashboard = () => {
    const apiUrl = import.meta.env.VITE_API_URL; // Use environment variable

    // Example usage
    const fetchData = async () => {
        const response = await fetch(`${apiUrl}/officers`);
        const data = await response.json();
        console.log(data);
    };

    // Component logic here

    return (
        <div>
            {/* Component JSX here */}
            <h1>Officer Dashboard</h1>
        </div>
    );
};

export default OfficerDashboard;