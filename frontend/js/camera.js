import { send_img } from "./api.js";
import { BASE_URL } from "./config.js";

console.log("camera.js");

const uploadBtn       = document.getElementById("uploadBtn");
const bottomSheet     = document.getElementById("bottomSheet");
const overlay         = document.getElementById("overlay");

const cameraOption    = document.getElementById("cameraOption");
const galleryOption   = document.getElementById("galleryOption");
const cancelOption    = document.getElementById("cancelOption");

const cameraContainer = document.getElementById("cameraContainer");
const video           = document.getElementById("video");
const canvas          = document.getElementById("canvas");

const snapBtn         = document.getElementById("snapBtn");
const closeBtn        = document.getElementById("closeBtn");

const fileInput       = document.getElementById("fileInput");
const previewContainer = document.getElementById("previewContainer");
const previewImage    = document.getElementById("previewImage");

const retakeBtn       = document.getElementById("retakeBtn");
const submitBtn       = document.getElementById("submitBtn");

let selectedImage;
let stream;

function openSheet() {
  bottomSheet.classList.add("show");
  overlay.classList.add("show");
}

function closeSheet() {
  bottomSheet.classList.remove("show");
  overlay.classList.remove("show");
}

// Open sheet
uploadBtn.onclick = () => openSheet();

// Cancel — FIX: was adding "show" instead of removing
cancelOption.onclick = () => closeSheet();
overlay.onclick = () => closeSheet();

// Camera
cameraOption.onclick = async () => {
  closeSheet();
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    video.srcObject = stream;
    cameraContainer.classList.add("show");
  } catch (e) {
    alert("Camera not available: " + e.message);
  }
};

closeBtn.onclick = () => {
  if (stream) stream.getTracks().forEach(t => t.stop());
  cameraContainer.classList.remove("show");
};

snapBtn.onclick = () => {
  canvas.width  = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);

  canvas.toBlob(blob => {
    selectedImage = blob;
    previewImage.src = URL.createObjectURL(blob);
    previewContainer.classList.add("show");
    cameraContainer.classList.remove("show");
    if (stream) stream.getTracks().forEach(t => t.stop());
  }, "image/jpeg", 0.95);
};

// Gallery
galleryOption.onclick = () => {
  closeSheet();
  fileInput.click();
};

fileInput.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  selectedImage = file;
  previewImage.src = URL.createObjectURL(file);
  previewContainer.classList.add("show");
};

// Retake
retakeBtn.onclick = () => {
  previewContainer.classList.remove("show");
  selectedImage = null;
};

// Submit
submitBtn.onclick = async () => {
  if (!selectedImage) return;
  submitBtn.textContent = "Uploading...";
  submitBtn.disabled = true;
  try {
    const data = await send_img(BASE_URL, "/upload", selectedImage);
    if (data.success) {
      alert("Receipt saved! Category: " + (data.category || "Unknown"));
      previewContainer.classList.remove("show");
      // Reload dashboard data
      window.location.reload();
    } else {
      alert("Error: " + data.message);
    }
  } catch (e) {
    alert("Upload failed: " + e.message);
  } finally {
    submitBtn.textContent = "Submit ✓";
    submitBtn.disabled = false;
  }
};
