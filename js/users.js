document.addEventListener('DOMContentLoaded', async () => {
    const BACKEND_URL = 'https://househunt-backend-h19r.onrender.com';
    const usersTableBody = document.querySelector('.admin-table tbody');

    async function fetchUsers() {
        try {
            const response = await fetch(`${BACKEND_URL}/api/admin/users`);
            const users = await response.json();
            
            if (users && users.length > 0) {
                renderUsers(users);
            } else {
                usersTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #666;">No users found</td></tr>';
            }
        } catch (e) {
            console.error("Error fetching users:", e);
            usersTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #ef4444;">Failed to load users. Please check if the backend is running.</td></tr>';
        }
    }

    function renderUsers(users) {
        usersTableBody.innerHTML = ''; // Clear hardcoded data
        
        users.forEach(user => {
            const row = document.createElement('tr');
            const joinDate = new Date(user.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric'
            });

            row.innerHTML = `
                <td class="user-td">
                    <img src="${user.avatar_url || 'assets/profile.png'}" alt="${user.full_name || 'User'}">
                    ${user.full_name || 'Unnamed User'}
                </td>
                <td><span class="role-badge ${user.role || 'buyer'}">${user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Buyer'}</span></td>
                <td>${user.email}</td>
                <td>${joinDate}</td>
                <td>-</td>
                <td><span class="badge active">Active</span></td>
                <td class="actions-td">
                    <button class="act-btn edit" title="Edit User"><i data-lucide="edit-3"></i></button>
                    <button class="act-btn delete" title="Suspend User"><i data-lucide="slash"></i></button>
                </td>
            `;
            usersTableBody.appendChild(row);
        });

        // Re-initialize Lucide icons for dynamically added elements
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    fetchUsers();
});
