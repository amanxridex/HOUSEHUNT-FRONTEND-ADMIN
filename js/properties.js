    let currentProperties = [];

    async function fetchProperties() {
        try {
            const response = await fetch(`${BACKEND_URL}/api/admin/properties`);
            const properties = await response.json();
            currentProperties = properties;
            
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
                <td class="prop-td" onclick="viewDetails('${prop.id}')" style="cursor: pointer;">
                    <img src="${(prop.images && prop.images[0]) || 'assets/mainappicon.png'}" onerror="this.src='assets/mainappicon.png'">
                    <div><strong>${prop.title}</strong><span>${prop.property_type}</span></div>
                </td>
                <td>#HH-${prop.id.substring(0, 4).toUpperCase()}</td>
                <td>${prop.location_text || prop.city}</td>
                <td>₹ ${Number(prop.price).toLocaleString('en-IN')}</td>
                <td>${prop.owner_name || 'Owner'}</td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
                <td class="actions-td">
                    <button class="act-btn edit" onclick="viewDetails('${prop.id}')" title="View Details"><i data-lucide="eye"></i></button>
                    ${prop.status === 'pending' ? `
                        <button class="act-btn approve" onclick="updateStatus('${prop.id}', 'approved')" title="Approve"><i data-lucide="check"></i></button>
                    ` : ''}
                    <button class="act-btn delete" onclick="updateStatus('${prop.id}', 'rejected')" title="Reject/Delete"><i data-lucide="trash-2"></i></button>
                </td>
            `;
            propertyTableBody.appendChild(row);
        });

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    window.viewDetails = (id) => {
        const prop = currentProperties.find(p => p.id === id);
        if (!prop) return;

        const modal = document.getElementById('detailsModal');
        const imgContainer = document.getElementById('modalImages');
        const infoContainer = document.getElementById('modalInfo');
        const footer = document.getElementById('modalFooter');

        // Render Images
        imgContainer.innerHTML = (prop.images || []).map(img => `<img src="${img}" onclick="window.open('${img}', '_blank')">`).join('');
        if (!prop.images || prop.images.length === 0) imgContainer.innerHTML = '<p>No images uploaded</p>';

        // Render Info
        const infoFields = [
            { label: 'Title', value: prop.title },
            { label: 'Type', value: prop.property_type },
            { label: 'Price', value: `₹ ${Number(prop.price).toLocaleString('en-IN')}` },
            { label: 'Location', value: prop.location_text || prop.city },
            { label: 'Owner', value: prop.owner_name },
            { label: 'Description', value: prop.description, full: true }
        ];

        // Add dynamic details
        if (prop.details) {
            Object.entries(prop.details).forEach(([key, val]) => {
                const label = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                infoFields.push({ label, value: Array.isArray(val) ? val.join(', ') : val });
            });
        }

        infoContainer.innerHTML = infoFields.map(f => `
            <div class="info-item" style="${f.full ? 'grid-column: span 2' : ''}">
                <label>${f.label}</label>
                <span>${f.value || 'N/A'}</span>
            </div>
        `).join('');

        // Render Actions
        footer.innerHTML = `
            <button class="modal-btn close" onclick="closeModal()">Close</button>
            ${prop.status === 'pending' ? `
                <button class="modal-btn reject" onclick="updateStatus('${prop.id}', 'rejected'); closeModal();">Reject</button>
                <button class="modal-btn approve" onclick="updateStatus('${prop.id}', 'approved'); closeModal();">Approve</button>
            ` : ''}
        `;

        modal.classList.add('active');
        if (typeof lucide !== 'undefined') lucide.createIcons({ nodes: [footer] });
    };

    window.closeModal = () => {
        document.getElementById('detailsModal').classList.remove('active');
    };

    window.updateStatus = async (id, status) => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/admin/properties/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            
            if (response.ok) {
                fetchProperties(); 
            } else {
                alert("Failed to update status");
            }
        } catch (e) {
            console.error("Update error:", e);
        }
    };

    fetchProperties();
});
