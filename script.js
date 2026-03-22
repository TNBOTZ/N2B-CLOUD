// --- Global State ---
let videoHistory = JSON.parse(localStorage.getItem('videoHistory')) || [];

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Show the upload tab by default on page load
    showTab('uploadTab');
});

/**
 * Handles Tab Switching Logic
 * @param {string} tabId - The ID of the div to show
 */
function showTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.style.display = 'none';
    });

    // Show the selected tab
    const target = document.getElementById(tabId);
    if (target) {
        target.classList.add('active');
        target.style.display = 'block';
    }

    // If switching to history, refresh the list
    if (tabId === 'historyTab') {
        renderHistory(videoHistory);
    }
}

/**
 * Handles the 2GB Video Upload via the Node.js Backend
 */
async function uploadVideo() {
    const fileInput = document.getElementById('videoInput');
    const statusMessage = document.getElementById('statusMessage');
    const uploadBtn = document.getElementById('uploadBtn');

    // 1. Validation
    if (!fileInput.files[0]) {
        statusMessage.textContent = "❌ Please select a file first.";
        statusMessage.style.color = "red";
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('video', file);

    // 2. UI Update
    uploadBtn.disabled = true;
    statusMessage.textContent = "⏳ Uploading to server (Large file support enabled)...";
    statusMessage.style.color = "#0088cc";

    try {
        // 3. Send to your Node.js Backend (NOT directly to Telegram)
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            // 4. Create the "Unique Link" using your server as a proxy
            // Note: This requires a /stream/:file_id route on your backend
            const uniqueLink = `${window.location.origin}/stream/${data.file_id}`;
            
            // 5. Update Local History
            const newEntry = {
                name: file.name,
                url: uniqueLink,
                date: new Date().toLocaleString(),
                fileId: data.file_id
            };

            videoHistory.unshift(newEntry); // Add to start of array
            localStorage.setItem('videoHistory', JSON.stringify(videoHistory));

            statusMessage.textContent = "✅ Success! Video stored on Telegram.";
            statusMessage.style.color = "green";
            
            // Redirect to history after a brief delay
            setTimeout(() => {
                fileInput.value = "";
                showTab('historyTab');
            }, 2000);

        } else {
            throw new Error(data.error || "Server rejected the upload.");
        }
    } catch (error) {
        statusMessage.textContent = "❌ Error: " + error.message;
        statusMessage.style.color = "red";
        console.error("Upload Error:", error);
    } finally {
        uploadBtn.disabled = false;
    }
}

/**
 * Renders the list of uploaded videos
 * @param {Array} videos - The array of video objects to display
 */
function renderHistory(videos) {
    const list = document.getElementById('historyList');
    
    if (videos.length === 0) {
        list.innerHTML = '<li style="text-align:center; padding:20px; color:#888;">No videos found.</li>';
        return;
    }

    list.innerHTML = ''; // Clear current list
    
    videos.forEach((vid) => {
        const li = document.createElement('li');
        li.className = "history-item"; // Assumes CSS styling for history items
        
        li.innerHTML = `
            <div class="video-info">
                <strong>${vid.name}</strong><br>
                <small>${vid.date}</small>
            </div>
            <div class="video-actions">
                <button onclick="playVideo('${vid.url}')" class="play-btn">Play</button>
                <button onclick="copyToClipboard('${vid.url}')" class="copy-btn">Link</button>
            </div>
        `;
        list.appendChild(li);
    });
}

/**
 * Search functionality for the history tab
 */
function searchVideos() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = videoHistory.filter(v => 
        v.name.toLowerCase().includes(query)
    );
    renderHistory(filtered);
}

/**
 * Loads a video into the player and switches tabs
 * @param {string} url - The unique streaming URL
 */
function playVideo(url) {
    showTab('playerTab');
    const player = document.getElementById('videoPlayer');
    const shareLink = document.getElementById('shareableLink');
    
    player.src = url;
    player.load(); // Ensure the player updates to the new source
    player.play().catch(e => console.log("Auto-play blocked or failed:", e));

    if (shareLink) {
        shareLink.innerHTML = `<strong>Unique Link:</strong> <input type="text" readonly value="${url}" onclick="this.select()">`;
    }
}

/**
 * Helper to copy the generated link to clipboard
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("Link copied to clipboard!");
    });
}
