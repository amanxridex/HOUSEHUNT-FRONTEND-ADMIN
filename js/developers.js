const BACKEND_URL = 'https://backend.househunt.live';

// Global variable to keep developers in memory for easy editing
let allDevelopers = [];

document.addEventListener('DOMContentLoaded', () => {
    loadDevelopers();

    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('devLogo');
    const dropText = document.getElementById('dropZoneText');
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        
        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            updateDropZoneText();
        }
    });

    // Add paste support
    document.addEventListener('paste', (e) => {
        // Only trigger if modal is open
        if (!document.getElementById('addDeveloperModal').classList.contains('active')) return;
        
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (let index in items) {
            const item = items[index];
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                const blob = item.getAsFile();
                
                // Create a DataTransfer to simulate file input change
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(blob);
                fileInput.files = dataTransfer.files;
                
                updateDropZoneText();
                e.preventDefault();
                break;
            }
        }
    });

    
    fileInput.addEventListener('change', updateDropZoneText);
    
    function updateDropZoneText() {
        if (fileInput.files.length > 0) {
            dropText.textContent = fileInput.files[0].name;
            dropText.style.color = '#0066ff';
            dropText.style.fontWeight = '600';
            
            // Preview it instantly
            const reader = new FileReader();
            reader.onload = function(e) {
                const preview = document.getElementById('currentLogoPreview');
                preview.style.display = 'flex';
                preview.querySelector('img').src = e.target.result;
            }
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            dropText.textContent = 'Drag, Drop, Paste (Ctrl+V) logo here or click to browse';
            dropText.style.color = '';
            dropText.style.fontWeight = '';
        }
    }


    const form = document.getElementById('addDeveloperForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = document.getElementById('submitBtn');
        const oldText = btn.textContent;
        btn.textContent = 'Saving...';
        btn.disabled = true;

        try {
            const devId = document.getElementById('devId').value;
            let logo_url = null;
            
            // Check if existing logo is there and keep it by default
            if (devId) {
                const existingDev = allDevelopers.find(d => d.id === devId);
                if (existingDev) logo_url = existingDev.logo_url;
            }

            // Handle file upload
            const fileInput = document.getElementById('devLogo');
            if (fileInput.files.length > 0) {
                const formData = new FormData();
                formData.append('images', fileInput.files[0]);
                
                const uploadRes = await fetch(`${BACKEND_URL}/api/upload`, {
                    method: 'POST',
                    body: formData
                });
                
                if (!uploadRes.ok) {
                    const errText = await uploadRes.text();
                    throw new Error('Failed to upload logo image. Backend returned: ' + errText);
                }
                const uploadData = await uploadRes.json();
                if (uploadData.urls && uploadData.urls.length > 0) {
                    logo_url = uploadData.urls[0];
                }
            }

            const payload = {
                name: document.getElementById('devName').value,
                short_code: document.getElementById('devCode').value.toUpperCase(),
                link: document.getElementById('devLink').value || null,
                logo_url: logo_url
            };

            const method = devId ? 'PUT' : 'POST';
            const endpoint = devId ? `/api/admin/developers/${devId}` : '/api/admin/developers';

            const res = await fetch(`${BACKEND_URL}${endpoint}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to save developer');
            
            closeAddModal();
            loadDevelopers();
        } catch (error) {
            alert('Error saving developer: ' + error.message + '\n\nNote: Make sure your new backend code is deployed to https://backend.househunt.live!');
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
        allDevelopers = await res.json();
        
        tbody.innerHTML = '';
        
        if (allDevelopers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No developers found. Add one above!</td></tr>';
            return;
        }

        allDevelopers.forEach(dev => {
            const tr = document.createElement('tr');
            
            const dateStr = new Date(dev.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            
            const logoHtml = dev.logo_url 
                ? `<img src="${dev.logo_url}" alt="${dev.name}" style="width: 40px; height: 40px; border-radius: 8px; object-fit: contain; background: #fff; border: 1px solid #e2e8f0;">`
                : `<div class="dev-logo-preview" style="display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: #f3f4f6; color: #0066ff; font-weight: 700; font-size: 0.8rem; border-radius: 10px;">${dev.short_code}</div>`;

            tr.innerHTML = `
                <td>
                    <div class="dev-name-cell" style="display: flex; align-items: center; gap: 10px;">
                        ${logoHtml}
                        <span>${dev.name}</span>
                    </div>
                </td>
                <td style="font-weight: bold; color: #64748b;">${dev.short_code}</td>
                <td>${dev.link ? `<a href="${dev.link}" target="_blank" style="color: #0066ff;">Visit Link</a>` : '<span style="color: #94a3b8;">None</span>'}</td>
                <td>${dateStr}</td>
                <td class="actions-td">
                    <button class="act-btn edit" onclick="editDeveloper('${dev.id}')" title="Edit Developer">
                        <i data-lucide="edit-3"></i>
                    </button>
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
    document.getElementById('addDeveloperForm').reset();
    document.getElementById('devId').value = '';
    document.getElementById('modalTitle').textContent = 'Add New Developer';
    document.getElementById('currentLogoPreview').style.display = 'none';
    document.getElementById('addDeveloperModal').classList.add('active');
}

function editDeveloper(id) {
    const dev = allDevelopers.find(d => d.id === id);
    if (!dev) return;
    
    document.getElementById('devId').value = dev.id;
    document.getElementById('devName').value = dev.name;
    document.getElementById('devCode').value = dev.short_code;
    document.getElementById('devLink').value = dev.link || '';
    
    const preview = document.getElementById('currentLogoPreview');
    if (dev.logo_url) {
        preview.style.display = 'block';
        preview.querySelector('img').src = dev.logo_url;
    } else {
        preview.style.display = 'none';
    }
    
    document.getElementById('modalTitle').textContent = 'Edit Developer';
    document.getElementById('addDeveloperModal').classList.add('active');
}

function closeAddModal() {
    document.getElementById('addDeveloperModal').classList.remove('active');
    document.getElementById('addDeveloperForm').reset();
}


function removeLogo() {
    document.getElementById('devLogo').value = '';
    
    const devId = document.getElementById('devId').value;
    if (devId) {
        const existingDev = allDevelopers.find(d => d.id === devId);
        if (existingDev) {
            existingDev.logo_url = null; // Remove it from memory so save doesn't use it
        }
    }
    
    const preview = document.getElementById('currentLogoPreview');
    preview.style.display = 'none';
    preview.querySelector('img').src = '';
    
    const dropText = document.getElementById('dropZoneText');
    dropText.textContent = 'Drag & Drop logo here or click to browse';
    dropText.style.color = '';
    dropText.style.fontWeight = '';
}
