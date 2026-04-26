document.addEventListener('DOMContentLoaded', () => {
    // User Growth Chart
    new Chart(document.getElementById('userGrowthChart'), {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'New Users',
                data: [400, 600, 800, 1200, 1500, 2100],
                borderColor: '#2D68FF',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(45, 104, 255, 0.1)'
            }]
        },
        options: { plugins: { legend: { display: false } }, scales: { y: { grid: { display: false } }, x: { grid: { display: false } } } }
    });

    // Property Distribution
    new Chart(document.getElementById('propertyTypeChart'), {
        type: 'doughnut',
        data: {
            labels: ['Villas', 'Apartments', 'Plots', 'Commercial'],
            datasets: [{
                data: [30, 45, 15, 10],
                backgroundColor: ['#2D68FF', '#10B981', '#F59E0B', '#8B5CF6']
            }]
        },
        options: { plugins: { legend: { position: 'bottom' } } }
    });

    // Revenue Chart
    new Chart(document.getElementById('revenueChart'), {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Revenue (in Lakhs)',
                data: [12, 19, 15, 25, 32, 45],
                backgroundColor: '#2D68FF',
                borderRadius: 8
            }]
        }
    });

    // Conversion Ratio
    new Chart(document.getElementById('conversionChart'), {
        type: 'pie',
        data: {
            labels: ['Leads', 'Site Visits', 'Closures'],
            datasets: [{
                data: [60, 25, 15],
                backgroundColor: ['#EEF4FF', '#2D68FF', '#10B981']
            }]
        }
    });
});
