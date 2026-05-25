const BACKEND_URL = 'https://backend.househunt.live';

document.addEventListener('DOMContentLoaded', () => {
    loadDevelopers();

    const form = document.getElementById('addDeveloperForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = document.getElementById('submitBtn');
        const oldText = btn.textContent;
        btn.textContent = 'Saving...';
        btn.disabled = true;

        const payload = {
            name: document.getElementById('devName').value,
            short_code: document.getElementById('devCode').value.toUpperCase(),
            link: document.getElementById('devLink').value || null
        };

        try {
            const res = await fetch(`${BACKEND_URL}/api/admin/developers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to add developer');
            
            closeAddModal();
            loadDevelopers();
            form.reset();
        } catch (error) {
            alert('Error adding developer. Make sure you are logged in as admin.');
            console.error(error);
        } finally {
            btn.textContent = oldText;
            btn.disabled = false;
        }
    });

    document.getElementById('searchInput').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('#developersTableBody tr').forEach(row => {
            const name = row.querySelector('.dev-name-cell')?.textContent?.toLowerCase() || '';
            row.style.display = name.includes(term) ? '' : 'none';
        });
    });
});

async function loadDevelopers() {
    const tbody = document.getElementById('developersTableBody');
    
    try {
        const res = await fetch(`${BACKEND_URL}/api/developers`);
        if (!res.ok) throw new Error('Failed to fetch developers');
        const data = await res.json();
        
        tbody.innerHTML = '';
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No developers found. Add one above!</td></tr>';
            return;
        }

        data.forEach(dev => {
            const tr = document.createElement('tr');
            
            // Format date
            const dateStr = new Date(dev.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            
            tr.innerHTML = `
                <td>
                    <div class="dev-name-cell" style="display: flex; align-items: center; gap: 10px;">
                        <div class="dev-logo-preview" style="display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: #f3f4f6; color: #0066ff; font-weight: 700; font-size: 0.8rem; border-radius: 10px;">${dev.short_code}</div>
                        <span>${dev.name}</span>
                    </div>
                </td>
                <td style="font-weight: bold; color: #64748b;">${dev.short_code}</td>
                <td>${dev.link ? `<a href="${dev.link}" target="_blank" style="color: #0066ff;">Visit Link</a>` : '<span style="color: #94a3b8;">None</span>'}</td>
                <td>${dateStr}</td>
                <td class="actions-td">
                    <button class="act-btn delete" onclick="deleteDeveloper('${dev.id}')" title="Delete Developer">
                        <i data-lucide="trash-2"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        if (window.lucide) window.lucide.createIcons();

    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red; padding: 20px;">Error loading developers: ${error.message}</td></tr>`;
    }
}

async function deleteDeveloper(id) {
    if (!confirm('Are you sure you want to remove this developer from the home page?')) return;
    
    try {
        const res = await fetch(`${BACKEND_URL}/api/admin/developers/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (!res.ok) throw new Error('Failed to delete');
        loadDevelopers();
    } catch (error) {
        alert('Error deleting developer. Make sure you are logged in as admin.');
        console.error(error);
    }
}

function openAddModal() {
    document.getElementById('addDeveloperModal').classList.add('active');
}

function closeAddModal() {
    document.getElementById('addDeveloperModal').classList.remove('active');
    document.getElementById('addDeveloperForm').reset();
}
