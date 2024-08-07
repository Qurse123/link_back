document.addEventListener('DOMContentLoaded', function() {
    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    const sessionIdElement = document.getElementById('session-id');
    const copyButton = document.getElementById('copy-session-id');

    if (sessionId) {
        sessionIdElement.textContent = sessionId;
    } else {
        sessionIdElement.textContent = 'No session ID found';
    }

    copyButton.addEventListener('click', function() {
        navigator.clipboard.writeText(sessionIdElement.textContent).then(function() {
            copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            setTimeout(function() {
                copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
            }, 2000);
        }).catch(function(err) {
            console.error('Failed to copy text: ', err);
        });
    });
});