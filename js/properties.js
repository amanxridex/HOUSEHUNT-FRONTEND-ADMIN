document.addEventListener('DOMContentLoaded', async () => {
    const BACKEND_URL = 'https://househunt-backend-h19r.onrender.com';
    const propertyTableBody = document.getElementById('propertyTableBody');

    async function fetchProperties() {
        try {
            const response = await fetch(`${BACKEND_URL}/api/admin/properties`);
            const properties = await response.json();
            
            if (properties && properties.length > 0) {
                renderProperties(properties);
            } else {
                propertyTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #666;">No properties found</td></tr>';
            }
        } catch (e) {
            console.error("Error fetching properties:", e);
            propertyTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #ef4444;">Failed to load properties.</td></tr>';
        }
    }

    function renderProperties(properties) {
        propertyTableBody.innerHTML = ''; 
        
        properties.forEach(prop => {
            const row = document.createElement('tr');
            
            // Map status to badge class
            let statusClass = 'pending';
            let statusText = 'Pending';
            if (prop.status === 'approved') {
                statusClass = 'active';
                statusText = 'Live';
            } else if (prop.status === 'rejected') {
                statusClass = 'idle';
                statusText = 'Rejected';
            }

            row.innerHTML = `
                <td class="prop-td">
                    <img src="${(prop.images && prop.images[0]) || 'assets/mainappicon.png'}" onerror="this.src='assets/mainappicon.png'">
                    <div><strong>${prop.title}</strong><span>${prop.property_type}</span></div>
                </td>
                <td>#HH-${prop.id.substring(0, 4).toUpperCase()}</td>
                <td>${prop.location_text || prop.city}</td>
                <td>₹ ${Number(prop.price).toLocaleString('en-IN')}</td>
                <td>${prop.owner_name || 'Owner'}</td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
                <td class="actions-td">
                    ${prop.status === 'pending' ? `
                        <button class="act-btn approve" onclick="updateStatus('${prop.id}', 'approved')" title="Approve"><i data-lucide="check"></i></button>
                        <button class="act-btn delete" onclick="updateStatus('${prop.id}', 'rejected')" title="Reject"><i data-lucide="x"></i></button>
                    ` : `
                        <button class="act-btn edit" title="Edit"><i data-lucide="edit-3"></i></button>
                        <button class="act-btn delete" onclick="updateStatus('${prop.id}', 'rejected')" title="Delete/Reject"><i data-lucide="trash-2"></i></button>
                    `}
                </td>
            `;
            propertyTableBody.appendChild(row);
        });

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    window.updateStatus = async (id, status) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/admin/properties/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            
            if (response.ok) {
                fetchProperties(); // Refresh
            } else {
                alert("Failed to update status");
            }
        } catch (e) {
            console.error("Update error:", e);
        }
    };

    fetchProperties();
});
