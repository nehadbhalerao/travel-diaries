
// Photo Panel, Image Viewer

function openPhotoPanel(properties) {

  // Set the location title
  document.getElementById("panelTitle").innerText = properties.name;

  // Clear old images
  const grid = document.getElementById("photoGrid");
  grid.innerHTML = "";

  // Build the image gallery
  properties.media.forEach(function(imgSrc, index) {

    const img = document.createElement("img");
    img.src = imgSrc;
    img.style.cursor     = "pointer";
    img.style.transition = "transform 0.2s ease";

    // Hover effects
    img.onmouseover = () => img.style.transform = "scale(1.05)";
    img.onmouseout  = () => img.style.transform = "scale(1)";

    // Click → open fullscreen viewer at this image
    img.onclick = () => openFullscreenViewer(properties.media, index);

    grid.appendChild(img);
  });

  // Slide the panel up
  document.getElementById("photoPanel").classList.add("active");
}


// Close panel

function closePhotoPanel() {
  document.getElementById("photoPanel").classList.remove("active");
}


// Fullscreen viewer
// Opens a fullscreen overlay showing the clicked image.
// Left/right arrows + keyboard navigation.
// Click anywhere to close.

function openFullscreenViewer(mediaList, startIndex) {

  let currentIndex = startIndex;

  //Overlay
  const viewer = document.createElement("div");
  viewer.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: rgba(0,0,0,0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  `;

  //Image
  const fullImg = document.createElement("img");
  fullImg.style.cssText = `
    max-width: 90%;
    max-height: 90%;
    border-radius: 10px;
  `;

  //Left arrow
  const leftBtn = document.createElement("div");
  leftBtn.innerHTML = "❮";
  leftBtn.style.cssText = `
    position: absolute;
    left: 20px;
    font-size: 40px;
    color: white;
    cursor: pointer;
    user-select: none;
  `;

  //Right arrow
  const rightBtn = document.createElement("div");
  rightBtn.innerHTML = "❯";
  rightBtn.style.cssText = `
    position: absolute;
    right: 20px;
    font-size: 40px;
    color: white;
    cursor: pointer;
    user-select: none;
  `;

  function updateImage() {
    fullImg.src = mediaList[currentIndex];
  }

  //Mouse Navigation
  leftBtn.onclick = function(e) {
    e.stopPropagation();
    currentIndex = (currentIndex - 1 + mediaList.length) % mediaList.length;
    updateImage();
  };

  rightBtn.onclick = function(e) {
    e.stopPropagation();
    currentIndex = (currentIndex + 1) % mediaList.length;
    updateImage();
  };

  //Keyboard navigation
  function handleKey(e) {
    if (e.key === "ArrowRight") {
      currentIndex = (currentIndex + 1) % mediaList.length;
      updateImage();
    }
    if (e.key === "ArrowLeft") {
      currentIndex = (currentIndex - 1 + mediaList.length) % mediaList.length;
      updateImage();
    }
    if (e.key === "Escape") {
      closeViewer();
    }
  }

  //Close viewer
  function closeViewer() {
    document.removeEventListener("keydown", handleKey);
    viewer.remove();
  }

  viewer.onclick = closeViewer;

  document.addEventListener("keydown", handleKey);
  viewer.appendChild(fullImg);
  viewer.appendChild(leftBtn);
  viewer.appendChild(rightBtn);
  document.body.appendChild(viewer);

  //Show first image
  updateImage();
}


//Photo grid drag to scroll

const grid = document.getElementById("photoGrid");
let isDown   = false;
let startX, scrollLeft;

grid.addEventListener("mousedown", function(e) {
  isDown     = true;
  grid.style.cursor = "grabbing";
  startX     = e.pageX - grid.offsetLeft;
  scrollLeft = grid.scrollLeft;
});

grid.addEventListener("mouseleave", function() {
  isDown = false;
  grid.style.cursor = "grab";
});

grid.addEventListener("mouseup", function() {
  isDown = false;
  grid.style.cursor = "grab";
});

grid.addEventListener("mousemove", function(e) {
  if (!isDown) return;
  e.preventDefault();
  const x    = e.pageX - grid.offsetLeft;
  const walk = (x - startX) * 2;
  grid.scrollLeft = scrollLeft - walk;
});