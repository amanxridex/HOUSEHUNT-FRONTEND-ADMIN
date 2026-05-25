const fs = require('fs');
const path = require('path');
const dir = 'C:/Users/91836/AARAMBH/HouseHuntMaster/Househunt-Frontend-Admin';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'defense.html');

for(const file of files) {
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');
    const oldSettingsLink = '<a href="settings.html" class="nav-item"><i data-lucide="settings"></i> Settings</a>';
    const newLink = '<a href="defense.html" class="nav-item" style="color: #ef4444;"><i data-lucide="shield-alert"></i> Defense</a>\n                ' + oldSettingsLink;
    content = content.replace(oldSettingsLink, newLink);
    fs.writeFileSync(fullPath, content);
    console.log('Updated ' + file);
}
