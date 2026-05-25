/**
 * HouseHunt Admin Security Module
 * Protects against OSINT, scraping, and casual DOM inspection.
 */
(function() {
    // 1. Frame Busting (Prevent Clickjacking / Iframe Loading)
    if (window.top !== window.self) {
        window.top.location = window.self.location;
    }

    // 2. Disable Right-Click (Context Menu) - DISABLED TEMPORARILY
    /*
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });
    */

    // 3. Disable Keyboard Shortcuts (DevTools, View Source, Print, Save) - DISABLED TEMPORARILY
    /*
    document.addEventListener('keydown', function(e) {
        // F12
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
        }
        
        if (e.ctrlKey && e.shiftKey) {
            // Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Element select)
            if (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c') {
                e.preventDefault();
            }
        }

        if (e.ctrlKey) {
            // Ctrl+U (View Source), Ctrl+S (Save), Ctrl+P (Print)
            if (e.key === 'U' || e.key === 'u' || e.key === 'S' || e.key === 's' || e.key === 'P' || e.key === 'p') {
                e.preventDefault();
            }
        }

        // Mac equivalents (Cmd+Option+I etc)
        if (e.metaKey && e.altKey) {
            if (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'U' || e.key === 'u') {
                e.preventDefault();
            }
        }
    });
    */

    // 4. DevTools Trap (Recursive Debugger) - DISABLED TEMPORARILY
    /*
    setInterval(function() {
        const start = performance.now();
        debugger; // The browser halts here if devtools is open
        const end = performance.now();
        // If execution was paused, we know devtools is open. 
        // We could redirect or clear the DOM, but pausing is highly effective for anti-scraping.
    }, 1000);
    */

    // 5. Prevent Dragging (Images, text)
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
    });

    // 6. Disable Text Selection (Optional, makes scraping slightly harder for humans)
    document.addEventListener('selectstart', function(e) {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
    });

    // 7. Inject Auth Headers to all backend fetch calls
    const originalFetch = window.fetch;
    window.fetch = async function() {
        let [resource, config] = arguments;
        if (typeof resource === 'string' && resource.includes('/api/admin/')) {
            if (!config) config = {};
            if (!config.headers) config.headers = {};
            config.headers['x-admin-token'] = 'Aarambhindia-Secret';
        }
        return await originalFetch(resource, config);
    };
})();
