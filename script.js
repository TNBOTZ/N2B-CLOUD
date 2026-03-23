// Check if user is logged in
let user = JSON.parse(sessionStorage.getItem('userData'));

if (!user && !window.location.pathname.includes('login.html')) {
    window.location.href = 'login.html';
}

// --- UPLOAD FUNCTION ---
async function uploadVideo() {
    const fileInput = document.getElementById('videoInput');
    const status = document.getElementById('statusMessage');
    
    if (!fileInput.files[0]) return alert("Select a file!");

    const formData = new FormData();
    formData.append('video', fileInput.files[0]);
    formData.append('username', user.username); // Send username for plan check

    status.textContent = "Processing upload...";

    try {
        const response = await fetch('/api/upload', { method: 'POST', body: formData });
        const result = await response.json();

        if (result.success) {
            status.textContent = "✅ Upload Successful!";
            saveToHistory(result.file_name, result.file_id);
        } else {
            status.textContent = "❌ " + result.error;
        }
    } catch (e) {
        status.textContent = "❌ Server Error";
    }
}

// --- HISTORY LOGIC ---
function saveToHistory(name, id) {
    let history = JSON.parse(localStorage.getItem('myVideos')) || [];
    // Creating the unique link through your server
    const link = `${window.location.origin}/play/${id}`; 
    history.unshift({ name, link, date: new Date().toLocaleDateString() });
    localStorage.setItem('myVideos', JSON.stringify(history));
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem('myVideos')) || [];
    const container = document.getElementById('historyList');
    container.innerHTML = history.map(vid => `
        <li>
            <b>${vid.name}</b> (${vid.date}) 
            <button onclick="window.open('${vid.link}')">Play</button>
        </li>
    `).join('');
}
