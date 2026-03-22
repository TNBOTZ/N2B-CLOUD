async function loadFiles(userId) {
  const { data } = await supabaseClient
    .from("files")
    .select("*")
    .eq("user_id", userId);

  fileList.innerHTML = "";

  data.forEach(f => {
    const div = document.createElement("div");
    div.className = "file";
    div.innerText = f.file_name || f.file_url;

    div.onclick = () => openFile(f);

    fileList.appendChild(div);
  });
}

// SEARCH
function searchFile() {
  const query = search.value.toLowerCase();
  const items = document.querySelectorAll(".file");

  items.forEach(item => {
    item.style.display =
      item.innerText.toLowerCase().includes(query) ? "block" : "none";
  });
}

// OPEN FILE
function openFile(file) {
  if (file.file_type && file.file_type.startsWith("video")) {
    localStorage.setItem("video", file.file_url);
    window.location.href = "player.html";
  } else {
    window.open(file.file_url);
  }
}
