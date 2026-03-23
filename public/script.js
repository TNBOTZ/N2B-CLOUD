// --- UPLOAD FUNCTION ---
async function uploadVideo() {
    const fileInput = document.getElementById('videoInput');
    const status = document.getElementById('statusMsg');
    const progBar = document.getElementById('progBar');
    const progCont = document.getElementById('progCont');

    if (!fileInput.files[0]) return alert("Select a file!");

    const formData = new FormData();
    formData.append('video', fileInput.files[0]);

    progCont.style.display = 'block';
    status.textContent = "Uploading to Telegram Cloud...";

    try {
        const response = await fetch('/api/upload', { method: 'POST', body: formData });
        const result = await response.json();

        if (result.success) {
            status.textContent = "✅ Upload Successful!";
            saveToHistory(result.file_name, result.file_id);
            setTimeout(() => switchTab('historyTab'), 1500);
        } else {
            status.textContent = "❌ Error: " + result.error;
        }
    } catch (e) {
        status.textContent = "❌ Server Connection Error";
    }
}

function saveToHistory(name, id) {
    let history = JSON.parse(localStorage.getItem('myVideos')) || [];
    history.unshift({ 
        name, 
        fileId: id, 
        date: new Date().toLocaleDateString() 
    });
    localStorage.setItem('myVideos', JSON.stringify(history));
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem('myVideos')) || [];
    const container = document.getElementById('historyList');
    
    container.innerHTML = history.map(vid => `
        <li class="history-item">
            <b>${vid.name}</b>
            <a href="player.html?id=${vid.fileId}&name=${encodeURIComponent(vid.name)}" class="btn-play">
                Play / Download
            </a>
        </li>
    `).join('');
}

// Initial Load
document.addEventListener('DOMContentLoaded', renderHistory);
