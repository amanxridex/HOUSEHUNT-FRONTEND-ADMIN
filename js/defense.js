document.addEventListener('DOMContentLoaded', async () => {
    const BACKEND_URL = 'https://backend.househunt.live';
    const tbody = document.getElementById('logsTableBody');

    try {
        const response = await fetch(`${BACKEND_URL}/api/admin/defense-logs`);
        if (!response.ok) throw new Error('Failed to fetch logs');
        
        const logs = await response.json();
        
        if (logs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px; color: #10b981;">
                        <i data-lucide="shield-check" style="width: 48px; height: 48px; margin-bottom: 10px;"></i>
                        <br><strong>No Intrusions Detected</strong>
                        <p style="margin-top: 5px; font-size: 0.85rem;">Your perimeter is secure.</p>
                    </td>
                </tr>
            `;
            lucide.createIcons();
            return;
        }

        tbody.innerHTML = '';
        
        logs.forEach(log => {
            const tr = document.createElement('tr');
            
            // Format timestamp
            const date = new Date(log.timestamp);
            const formattedDate = date.toISOString().replace('T', ' ').substring(0, 19);
            
            // Truncate user agent
            const ua = log.user_agent.length > 50 ? log.user_agent.substring(0, 47) + '...' : log.user_agent;

            tr.innerHTML = `
                <td style="color: #6b7280;">${formattedDate}</td>
                <td><span class="ip-address">${log.ip_address}</span></td>
                <td><code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; color: #d97706;">${log.method} ${log.endpoint}</code></td>
                <td title="${log.user_agent}" style="color: #4b5563;">${ua}</td>
                <td><span class="badge-blocked"><i data-lucide="ban" style="width: 12px; height: 12px;"></i> BLOCKED</span></td>
            `;
            tbody.appendChild(tr);
        });
        
        lucide.createIcons();
    } catch (err) {
        console.error('Error fetching security logs:', err);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 40px; color: #ef4444;">
                    <i data-lucide="alert-triangle" style="width: 48px; height: 48px; margin-bottom: 10px;"></i>
                    <br><strong>Error Loading Logs</strong>
                    <p style="margin-top: 5px; font-size: 0.85rem;">${err.message}</p>
                </td>
            </tr>
        `;
        lucide.createIcons();
    }
});
