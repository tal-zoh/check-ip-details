// content.js
// Purpose: Injected into the page to create and display the IP details popup

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "SHOW_IP_DETAILS_POPUP") {
    const existingPopup = document.getElementById('ip-location-popup');
    if (existingPopup) existingPopup.remove(); // Remove previous popup if open
    createPopup(request.ip); // Show new popup
  }
});

function createPopup(ip) {
  const popup = document.createElement('div');
  popup.id = 'ip-location-popup';
  popup.className = 'ip-popup';
  popup.innerHTML = `<div class="ip-popup-loader"></div><p>Fetching location...</p>`;
  document.body.appendChild(popup);

  const closePopup = () => popup.remove();

  // Use ipwho.is which supports direct HTTPS and CORS
  fetch(`https://ipwho.is/${ip}`)
    .then(response => {
      if (!response.ok) throw new Error(`Fetch failed (${response.status})`);
      return response.json();
    })
    .then(location => {
      if (!location.success) {
        throw new Error(location.message || "Location data not found");
      }
      buildPopup(popup, location, ip, closePopup);
    })
    .catch(error => {
      console.error('API Fetch Error:', error);
      popup.innerHTML = `
        <button class="ip-popup-close-btn">&times;</button>
        <h2 class="ip-popup-title">Error</h2>
        <p class="ip-popup-error">Failed to fetch IP details. ${error.toString()}</p>`;
      popup.querySelector('.ip-popup-close-btn').onclick = closePopup;
    });
}

function buildPopup(popup, location, ip, closeCallback) {
  while (popup.firstChild) popup.removeChild(popup.firstChild);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'ip-popup-close-btn';
  closeBtn.innerHTML = '&times;';
  closeBtn.onclick = closeCallback;

  const section = document.createElement('div');
  section.className = 'ip-popup-section';

  section.innerHTML = `
    <h2 class="ip-popup-title">Location Details</h2>
    <div class="ip-popup-details">
      <div class="ip-popup-row">
        <span>IP Address:</span>
        <span>${location.ip || 'N/A'} <button class="copy-btn" data-value="${location.ip}">📋</button></span>
      </div>
      <div class="ip-popup-row"><span>Country:</span><span>${location.country || 'N/A'} <button class="copy-btn" data-value="${location.country}">📋</button></span></div>
      <div class="ip-popup-row"><span>Region:</span><span>${location.region || 'N/A'}</span></div>
      <div class="ip-popup-row"><span>City:</span><span>${location.city || 'N/A'}</span></div>
      <div class="ip-popup-row"><span>ISP:</span><span>${location.connection?.isp || 'N/A'}</span></div>
    </div>
    <a href="https://www.virustotal.com/gui/ip-address/${ip}" target="_blank" class="vt-link-button">View on VirusTotal</a>
    <a href="https://www.abuseipdb.com/check/${ip}" target="_blank" class="abuse-link-button">View on AbuseIPDB</a>
    <a href="https://who.is/whois-ip/ip-address/${ip}" target="_blank" class="whois-link-button">WHOIS Lookup</a>
  `;

  popup.appendChild(closeBtn);
  popup.appendChild(section);

  popup.querySelectorAll('.copy-btn').forEach(btn => {
    btn.onclick = () => {
      navigator.clipboard.writeText(btn.getAttribute('data-value'));
      btn.innerText = '✅';
      setTimeout(() => (btn.innerText = '📋'), 1500);
    };
  });
}
