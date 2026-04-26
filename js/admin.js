document.addEventListener('DOMContentLoaded', () => {
    // Growth Chart
    const ctx = document.getElementById('growthChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Residential',
                    data: [65, 85, 120, 150, 180, 240],
                    borderColor: '#2D68FF',
                    backgroundColor: 'rgba(45, 104, 255, 0.1)',
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Commercial',
                    data: [30, 45, 60, 55, 90, 110],
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, grid: { display: false } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // Mock Recent Activity
    const recentProperties = [
        { name: 'Luxury Villa', loc: 'Sector 150, Noida', price: '₹ 4.5 Cr', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=100&q=80' },
        { name: 'Skyline Apartment', loc: 'Cyber City, Gurgaon', price: '₹ 1.2 Cr', img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=100&q=80' },
        { name: 'Commercial Plaza', loc: 'CP, Delhi', price: '₹ 8.5 Cr', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=100&q=80' }
    ];

    const activityList = document.getElementById('recentProperties');
    if (activityList) {
        recentProperties.forEach(prop => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            item.innerHTML = `
                <img src="${prop.img}">
                <div class="activity-info">
                    <h4>${prop.name}</h4>
                    <p>${prop.loc} • ${prop.price}</p>
                </div>
            `;
            activityList.appendChild(item);
        });
    }
});
