let currentTab = 'all';

function setLogTab(tab) {
    currentTab = tab;
    // Update button styles
    document.getElementById('tabAll').style.color = tab === 'all' ? '#10b981' : '#6b7280';
    document.getElementById('tabAll').style.borderColor = tab === 'all' ? '#10b981' : '#374151';
    
    document.getElementById('tabErrors').style.color = tab === 'errors' ? '#ef4444' : '#6b7280';
    document.getElementById('tabErrors').style.borderColor = tab === 'errors' ? '#ef4444' : '#374151';
    
    // Trigger immediate render
    fetchAndRenderLogs();
}

async function fetchAndRenderLogs() {
    const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : 'https://backend.househunt.live';
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/defense-logs`);
        if (!response.ok) throw new Error('Failed to fetch logs');
        
        let logs = await response.json();
        
        // Calculate counts
        let passed = 0;
        let errors = 0;
        logs.forEach(log => {
            if (log.status >= 400) errors++;
            else passed++;
        });

        document.getElementById('passedCount').textContent = passed;
        document.getElementById('errorCount').textContent = errors;

        // Filter based on tab
        if (currentTab === 'errors') {
            logs = logs.filter(l => l.status >= 400);
        }

        const terminalBody = document.getElementById('terminalBody');
        terminalBody.innerHTML = ''; // Clear

        if (logs.length === 0) {
            terminalBody.innerHTML = '<div style="color: #6b7280;">No logs found for current filter...</div>';
            return;
        }

        logs.forEach(log => {
            const date = new Date(log.timestamp);
            const timeStr = date.toISOString().replace('T', ' ').substring(0, 19);
            const isError = log.status >= 400;
            const color = isError ? '#ef4444' : '#10b981';
            const statusLabel = isError ? '[ERR]' : '[OK] ';

            const line = document.createElement('div');
            line.style.display = 'flex';
            line.style.gap = '15px';
            line.style.padding = '2px 0';
            line.style.borderBottom = '1px dashed #333';
            
            line.innerHTML = `
                <span style="color: #6b7280; min-width: 170px;">${timeStr}</span>
                <span style="color: ${color}; font-weight: bold; min-width: 50px;">${statusLabel}</span>
                <span style="color: #fbbf24; min-width: 40px;">${log.status}</span>
                <span style="color: #60a5fa; min-width: 60px;">${log.method}</span>
                <span style="color: #e5e7eb; flex: 1; word-break: break-all;">${log.endpoint}</span>
                <span style="color: #9ca3af; min-width: 120px; text-align: right;">${log.ip_address}</span>
                <span style="color: #4b5563; min-width: 60px; text-align: right;">${log.duration}ms</span>
            `;
            terminalBody.appendChild(line);
        });

    } catch (err) {
        console.error('Terminal polling error:', err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchAndRenderLogs();
    // Poll every 2 seconds for real-time feel
    setInterval(fetchAndRenderLogs, 2000);
});
