document.addEventListener('DOMContentLoaded', async () => {
    const BACKEND_URL = 'https://backend.househunt.live';
    const ticketListEl = document.getElementById('ticketList');
    const chatViewport = document.getElementById('chatViewport');
    
    let allTickets = [];
    let currentTicketId = null;
    let chatInterval = null;

    async function loadTickets() {
        try {
            const res = await fetch(`${BACKEND_URL}/api/admin/tickets`);
            allTickets = await res.json();
            renderTicketList();
        } catch (err) {
            console.error("Failed to load tickets", err);
            ticketListEl.innerHTML += `<p style="padding: 20px; color: red;">Error loading tickets.</p>`;
        }
    }

    function renderTicketList() {
        // Keep the header
        ticketListEl.innerHTML = `
            <div class="inbox-header">
                <h2>Support Tickets</h2>
                <i data-lucide="edit"></i>
            </div>
        `;

        if (allTickets.length === 0) {
            ticketListEl.innerHTML += `<p style="padding: 20px; text-align: center; color: #666;">No tickets found.</p>`;
        }

        allTickets.forEach(ticket => {
            const item = document.createElement('div');
            item.className = `ticket-item ${ticket.id === currentTicketId ? 'active' : ''}`;
            
            const isOpen = ticket.status !== 'resolved';
            
            item.innerHTML = `
                <div class="ticket-info">
                    <h4 style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;">${ticket.issue_text}</h4>
                    <p>User: ${ticket.user_id ? ticket.user_id.substring(0,6) + '...' : 'Guest'} • ${ticket.ticket_id}</p>
                </div>
                <span class="ticket-status ${isOpen ? 'open' : 'closed'}"></span>
            `;
            
            item.addEventListener('click', () => {
                currentTicketId = ticket.id;
                renderTicketList(); // Re-render to update active class
                renderChatArea(ticket);
            });
            
            ticketListEl.appendChild(item);
        });
        
        lucide.createIcons();
    }

    function renderChatArea(ticket) {
        if (chatInterval) clearInterval(chatInterval);
        const isOpen = ticket.status !== 'resolved';
        
        chatViewport.innerHTML = `
            <div class="chat-header">
                <div class="user-meta">
                    <div style="width:40px; height:40px; border-radius:50%; background:#e0e7ff; display:flex; align-items:center; justify-content:center; color:#4f46e5; font-weight:700;">
                        ${ticket.user_id ? ticket.user_id.substring(0,2).toUpperCase() : 'G'}
                    </div>
                    <div>
                        <h4>User: ${ticket.user_id || 'Guest'}</h4>
                        <span>Ticket ${ticket.ticket_id} • ${ticket.issue_text}</span>
                    </div>
                </div>
                ${isOpen ? `<button class="resolve-btn" id="resolveBtn" data-id="${ticket.id}">Resolve Ticket</button>` : `<span style="color:#10b981; font-weight:600;"><i data-lucide="check-circle" style="vertical-align: middle;"></i> Resolved</span>`}
            </div>
            <div class="chat-messages" id="chatMessagesContainer" style="padding: 20px; overflow-y: auto; flex: 1; display: flex; flex-direction: column;">
                <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 0.85rem;">
                    <em>User submitted an issue regarding <b>${ticket.issue_text}</b> on ${new Date(ticket.created_at).toLocaleString()}</em><br>
                </div>
            </div>
            <div class="chat-input" ${!isOpen ? 'style="opacity: 0.5; pointer-events: none;"' : ''}>
                <input type="text" id="chatInput" placeholder="${isOpen ? 'Type a message...' : 'Ticket resolved...'}" ${!isOpen ? 'disabled' : ''}>
                <button class="send-btn" id="sendBtn" ${!isOpen ? 'disabled' : ''}><i data-lucide="send"></i></button>
            </div>
        `;
        
        lucide.createIcons();

        const resolveBtn = document.getElementById('resolveBtn');
        if (resolveBtn) {
            resolveBtn.addEventListener('click', async (e) => {
                const btn = e.target;
                btn.disabled = true;
                btn.textContent = "Resolving...";
                
                try {
                    await fetch(`${BACKEND_URL}/api/admin/tickets/${ticket.id}`, {
                        method: 'PATCH',
                        headers: { 
                            'Content-Type': 'application/json',
                            'x-admin-token': 'Aarambhindia-Secret'
                        },
                        body: JSON.stringify({ status: 'resolved' })
                    });
                    
                    // Update local state
                    ticket.status = 'resolved';
                    renderTicketList();
                    renderChatArea(ticket);
                } catch(err) {
                    console.error("Error resolving ticket", err);
                    alert("Failed to resolve ticket.");
                    btn.disabled = false;
                    btn.textContent = "Resolve Ticket";
                }
            });
        }

        // Live Chat Logic
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');
        const chatContainer = document.getElementById('chatMessagesContainer');

        async function fetchMessages() {
            try {
                const res = await fetch(`${BACKEND_URL}/api/tickets/${ticket.id}/messages`);
                const msgs = await res.json();
                
                let html = `
                    <div style="text-align: center; margin-bottom: 20px; color: #9ca3af; font-size: 0.85rem;">
                        <em>User submitted an issue regarding <b>${ticket.issue_text}</b> on ${new Date(ticket.created_at).toLocaleString()}</em>
                    </div>
                `;
                msgs.forEach(m => {
                    if (m.sender_role === 'admin') {
                        html += `<div style="display:flex; justify-content:flex-end; margin-bottom:10px;">
                                    <div style="background:#0066ff; color:white; padding:10px 15px; border-radius:15px 15px 0 15px; max-width:70%; font-size: 0.95rem;">${m.message}</div>
                                 </div>`;
                    } else {
                        html += `<div style="display:flex; justify-content:flex-start; margin-bottom:10px;">
                                    <div style="background:#f1f5f9; color:#333; padding:10px 15px; border-radius:15px 15px 15px 0; max-width:70%; font-size: 0.95rem;">${m.message}</div>
                                 </div>`;
                    }
                });
                chatContainer.innerHTML = html;
            } catch(err) {
                console.error("Error fetching messages", err);
            }
        }

        async function sendMessage() {
            const text = chatInput.value.trim();
            if(!text) return;
            
            chatInput.value = '';
            chatInput.disabled = true;
            sendBtn.disabled = true;

            try {
                await fetch(`${BACKEND_URL}/api/tickets/${ticket.id}/messages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sender_role: 'admin', message: text })
                });
                await fetchMessages();
                chatContainer.scrollTop = chatContainer.scrollHeight;
            } catch(err) {
                console.error("Send error", err);
            } finally {
                chatInput.disabled = false;
                sendBtn.disabled = false;
                chatInput.focus();
            }
        }

        if (sendBtn) {
            sendBtn.addEventListener('click', sendMessage);
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') sendMessage();
            });
        }

        if (isOpen) {
            fetchMessages();
            chatInterval = setInterval(fetchMessages, 2000);
        } else {
            fetchMessages(); // fetch once if closed
        }
    }

    loadTickets();
});
