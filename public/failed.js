document.addEventListener('DOMContentLoaded', function() {
    const errorCode = new URLSearchParams(window.location.search).get('error_code') || 'Unknown';
    const errorCodeElement = document.getElementById('error-code');
    const copyButton = document.getElementById('copy-error-code');
    const tryAgainButton = document.getElementById('try-again');

    errorCodeElement.textContent = errorCode;

    copyButton.addEventListener('click', function() {
        navigator.clipboard.writeText(errorCodeElement.textContent).then(function() {
            copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            setTimeout(function() {
                copyButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
            }, 2000);
        }).catch(function(err) {
            console.error('Failed to copy text: ', err);
        });
    });

    tryAgainButton.addEventListener('click', function() {
        // Redirect to payment page or refresh
        window.location.href = 'index.html'; // Replace with your actual payment page URL
    });
});