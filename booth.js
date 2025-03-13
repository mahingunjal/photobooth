// DOM Elements
const webcamElement = document.getElementById('webcam');
const webcamContainer = document.getElementById('webcam-container');
const captureBtn = document.getElementById('capture-btn');
const stripBtn = document.getElementById('strip-btn');
const filterBtn = document.getElementById('filter-btn');
const stickerBtn = document.getElementById('sticker-btn');
const textBtn = document.getElementById('text-btn');
const rotateBtn = document.getElementById('rotate-btn');
const downloadBtn = document.getElementById('download-btn');
const emailBtn = document.getElementById('email-btn');
const shareBtn = document.getElementById('share-btn');
const deleteBtn = document.getElementById('delete-btn');
const previewContainer = document.getElementById('preview-container');
const filterOptions = document.querySelector('.filter-options');
const stickersPanel = document.querySelector('.stickers-panel');
const textOverlayPanel = document.querySelector('.text-overlay-panel');
const countdownElement = document.getElementById('countdown');
const stickersOverlay = document.getElementById('stickers-overlay');
const textOverlay = document.getElementById('text-overlay');
const themeToggle = document.getElementById('theme-toggle');
const textInput = document.getElementById('text-input');
const addTextBtn = document.getElementById('add-text-btn');
const textColor = document.getElementById('text-color');
const textSize = document.getElementById('text-size');
const shareWebsiteBtn = document.getElementById('share-website-btn');
const shareUrlInput = document.getElementById('share-url');
const copyUrlBtn = document.getElementById('copy-url-btn');
const shareBtns = document.querySelectorAll('.share-btn');

// Global variables
let stream = null;
let currentFilter = 'normal';
let rotation = 0;
let capturedPhotos = [];
let activeStickers = [];
let activeTexts = [];
let isDarkTheme = false;
let isMirrored = true; // Default to mirrored for webcam view
let filterCanvas = null;
let filterCanvasCtx = null;
let animationFrameId = null;

// Initialize webcam
async function initWebcam() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        });
        webcamElement.srcObject = stream;
        
        // Apply mirror effect to webcam view
        updateMirrorMode();
        
        // Initialize filter canvas
        setupFilterCanvas();
        
        // Start rendering the filtered webcam feed
        startFilterPreview();
    } catch (error) {
        console.error('Error accessing webcam:', error);
        alert('Unable to access webcam. Please make sure you have granted permission.');
    }
}

// Setup filter canvas for real-time preview
function setupFilterCanvas() {
    // Create a canvas element that will be placed over the video
    filterCanvas = document.createElement('canvas');
    filterCanvas.id = 'filter-canvas';
    filterCanvas.style.position = 'absolute';
    filterCanvas.style.top = '0';
    filterCanvas.style.left = '0';
    filterCanvas.style.width = '100%';
    filterCanvas.style.height = '100%';
    filterCanvas.style.objectFit = 'cover';
    filterCanvas.style.borderRadius = '5%';
    filterCanvas.style.display = currentFilter === 'normal' ? 'none' : 'block';
    
    // Add the canvas to the webcam container
    webcamContainer.appendChild(filterCanvas);
    
    // Get the canvas context
    filterCanvasCtx = filterCanvas.getContext('2d');
}

// Start the filter preview animation
function startFilterPreview() {
    // Stop any existing animation
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    
    // Function to render the filtered webcam feed
    function renderFilteredFrame() {
        // Only render if the webcam is ready and a filter is selected
        if (webcamElement.readyState === 4 && currentFilter !== 'normal') {
            // Set canvas dimensions to match video
            if (filterCanvas.width !== webcamElement.videoWidth || 
                filterCanvas.height !== webcamElement.videoHeight) {
                filterCanvas.width = webcamElement.videoWidth;
                filterCanvas.height = webcamElement.videoHeight;
            }
            
            // Draw the current video frame to the canvas
            filterCanvasCtx.save();
            
            // Apply the same transformations as the video element
            if (isMirrored) {
                filterCanvasCtx.scale(-1, 1);
                filterCanvasCtx.translate(-filterCanvas.width, 0);
            }
            
            if (rotation !== 0) {
                filterCanvasCtx.translate(filterCanvas.width / 2, filterCanvas.height / 2);
                filterCanvasCtx.rotate((rotation * Math.PI) / 180);
                filterCanvasCtx.translate(-filterCanvas.width / 2, -filterCanvas.height / 2);
            }
            
            // Draw the video frame
            filterCanvasCtx.drawImage(webcamElement, 0, 0, filterCanvas.width, filterCanvas.height);
            
            // Apply the selected filter
            const imageData = filterCanvasCtx.getImageData(0, 0, filterCanvas.width, filterCanvas.height);
            applyFilter(imageData, currentFilter);
            filterCanvasCtx.putImageData(imageData, 0, 0);
            
            filterCanvasCtx.restore();
            
            // Show the canvas
            filterCanvas.style.display = 'block';
        } else if (currentFilter === 'normal') {
            // Hide the canvas when no filter is applied
            filterCanvas.style.display = 'none';
        }
        
        // Request the next frame
        animationFrameId = requestAnimationFrame(renderFilteredFrame);
    }
    
    // Start the animation
    renderFilteredFrame();
}

// Update mirror mode
function updateMirrorMode() {
    if (isMirrored) {
        webcamElement.style.transform = `scaleX(-1) rotate(${rotation}deg)`;
    } else {
        webcamElement.style.transform = `rotate(${rotation}deg)`;
    }
    
    // Restart filter preview to apply the new transformation
    if (filterCanvas) {
        startFilterPreview();
    }
}

// Toggle mirror mode
function toggleMirrorMode() {
    isMirrored = !isMirrored;
    updateMirrorMode();
}

// Capture photo
async function capturePhoto(withCountdown = true) {
    if (withCountdown) {
        await startCountdown();
    }

    const canvas = document.createElement('canvas');
    canvas.width = webcamElement.videoWidth;
    canvas.height = webcamElement.videoHeight;
    const ctx = canvas.getContext('2d');

    // Apply rotation if needed
    if (rotation !== 0) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }

    // Handle mirroring for the captured photo (unmirror it)
    if (isMirrored) {
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
    }

    // Draw the video frame
    ctx.drawImage(webcamElement, 0, 0);

    // Apply filter
    if (currentFilter !== 'normal') {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        applyFilter(imageData, currentFilter);
        ctx.putImageData(imageData, 0, 0);
    }

    // Draw stickers
    activeStickers.forEach(sticker => {
        const img = new Image();
        img.src = sticker.src;
        const x = (sticker.x / 100) * canvas.width;
        const y = (sticker.y / 100) * canvas.height;
        const width = (sticker.width / 100) * canvas.width;
        const height = (sticker.height / 100) * canvas.height;
        ctx.drawImage(img, x, y, width, height);
    });

    // Draw text overlays
    activeTexts.forEach(text => {
        ctx.font = `${text.size}px Arial`;
        ctx.fillStyle = text.color;
        const x = (text.x / 100) * canvas.width;
        const y = (text.y / 100) * canvas.height;
        ctx.fillText(text.content, x, y);
    });

    // Create preview
    const photoUrl = canvas.toDataURL('image/jpeg');
    capturedPhotos.push(photoUrl);
    createPhotoPreview(photoUrl);

    // Enable buttons
    downloadBtn.disabled = false;
    emailBtn.disabled = false;
    shareBtn.disabled = false;
    deleteBtn.disabled = false;
}

// Countdown function
function startCountdown() {
    return new Promise((resolve) => {
        let count = 3;
        countdownElement.style.display = 'block';
        countdownElement.textContent = count;

        const interval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownElement.textContent = count;
            } else {
                clearInterval(interval);
                countdownElement.style.display = 'none';
                resolve();
            }
        }, 1000);
    });
}

// Create photo preview
function createPhotoPreview(photoUrl, isFilmStrip = false) {
    const previewWrapper = document.createElement('div');
    previewWrapper.classList.add('preview-wrapper');
    
    // Add film strip class if it's a film strip
    if (isFilmStrip) {
        previewWrapper.classList.add('film-strip');
    }
    
    // Create timestamp for the photo
    const timestamp = new Date();
    const formattedDate = timestamp.toLocaleDateString();
    const formattedTime = timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Create image element
    const img = document.createElement('img');
    img.src = photoUrl;
    img.classList.add('preview-image');
    img.setAttribute('data-timestamp', `${formattedDate} ${formattedTime}`);
    img.setAttribute('title', isFilmStrip ? 'Film Strip - Click to view' : `Captured on ${formattedDate} at ${formattedTime}`);
    
    // Add click event to show full screen preview
    img.addEventListener('click', () => {
        showFullScreenPreview(photoUrl, `${formattedDate} ${formattedTime}`, isFilmStrip);
    });
    
    // Create delete button
    const deleteIcon = document.createElement('div');
    deleteIcon.classList.add('delete-preview');
    deleteIcon.innerHTML = '<i class="fas fa-times"></i>';
    deleteIcon.setAttribute('title', 'Delete photo');
    deleteIcon.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering the preview click
        const index = capturedPhotos.indexOf(photoUrl);
        if (index > -1) {
            // Add fade out animation
            previewWrapper.style.opacity = '0';
            previewWrapper.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                capturedPhotos.splice(index, 1);
                previewWrapper.remove();
                
                if (capturedPhotos.length === 0) {
                    downloadBtn.disabled = true;
                    emailBtn.disabled = true;
                    shareBtn.disabled = true;
                    deleteBtn.disabled = true;
                }
            }, 300);
        }
    });
    
    // Add timestamp label (only for regular photos, not film strips)
    if (!isFilmStrip) {
        const timestampLabel = document.createElement('div');
        timestampLabel.classList.add('timestamp-label');
        timestampLabel.textContent = formattedTime;
        previewWrapper.appendChild(timestampLabel);
    }
    
    // Append elements to wrapper
    previewWrapper.appendChild(img);
    previewWrapper.appendChild(deleteIcon);
    
    // Add to container with animation delay based on position
    previewContainer.appendChild(previewWrapper);
    
    // Scroll to the new preview
    previewContainer.scrollLeft = previewContainer.scrollWidth;
}

// Show full screen preview of a photo
function showFullScreenPreview(photoUrl, timestamp, isFilmStrip = false) {
    // Create full screen container
    const fullScreenContainer = document.createElement('div');
    fullScreenContainer.classList.add('fullscreen-preview');
    
    // Add film strip class if it's a film strip
    if (isFilmStrip) {
        fullScreenContainer.classList.add('film-strip');
    }
    
    // Create image element
    const img = document.createElement('img');
    img.src = photoUrl;
    img.classList.add('fullscreen-image');
    
    // Create timestamp display (only for regular photos, not film strips)
    if (!isFilmStrip && timestamp) {
        const timestampDisplay = document.createElement('div');
        timestampDisplay.classList.add('fullscreen-timestamp');
        timestampDisplay.innerHTML = `<i class="far fa-clock"></i> ${timestamp}`;
        fullScreenContainer.appendChild(timestampDisplay);
    }
    
    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.classList.add('fullscreen-close-btn');
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fullScreenContainer.classList.remove('active');
        setTimeout(() => {
            fullScreenContainer.remove();
        }, 300);
    });
    
    // Create action buttons container
    const actionBtns = document.createElement('div');
    actionBtns.classList.add('fullscreen-actions');
    
    // Download button
    const downloadBtn = document.createElement('button');
    downloadBtn.classList.add('btn', 'btn-success', 'me-2');
    downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download';
    downloadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const link = document.createElement('a');
        link.download = isFilmStrip ? 'photo-strip-' + new Date().getTime() + '.jpg' : 'photo-booth-' + new Date().getTime() + '.jpg';
        link.href = photoUrl;
        link.click();
    });
    
    // Share button
    const shareBtn = document.createElement('button');
    shareBtn.classList.add('btn', 'btn-primary', 'me-2');
    shareBtn.innerHTML = '<i class="fas fa-share-alt"></i> Share';
    shareBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (navigator.share) {
            try {
                const response = await fetch(photoUrl);
                const blob = await response.blob();
                const file = new File([blob], isFilmStrip ? 'photo-strip.jpg' : 'photo-booth.jpg', { type: 'image/jpeg' });
                
                await navigator.share({
                    files: [file],
                    title: isFilmStrip ? 'Photo Booth Strip' : 'Photo Booth Picture',
                    text: isFilmStrip ? 'Check out my photo booth strip!' : 'Check out my photo booth picture!'
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            alert('Web Share API is not supported in your browser');
        }
    });
    
    // Email button
    const emailBtn = document.createElement('button');
    emailBtn.classList.add('btn', 'btn-info');
    emailBtn.innerHTML = '<i class="fas fa-envelope"></i> Email';
    emailBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fullScreenContainer.classList.remove('active');
        setTimeout(() => {
            fullScreenContainer.remove();
            showEmailModal();
        }, 300);
    });
    
    // Add buttons to action container
    actionBtns.appendChild(downloadBtn);
    actionBtns.appendChild(shareBtn);
    actionBtns.appendChild(emailBtn);
    
    // Add elements to container
    fullScreenContainer.appendChild(img);
    fullScreenContainer.appendChild(closeBtn);
    fullScreenContainer.appendChild(actionBtns);
    
    // Add click event to close on background click
    fullScreenContainer.addEventListener('click', () => {
        fullScreenContainer.classList.remove('active');
        setTimeout(() => {
            fullScreenContainer.remove();
        }, 300);
    });
    
    // Prevent click on image from closing
    img.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    // Add to body
    document.body.appendChild(fullScreenContainer);
    
    // Trigger animation after a small delay
    setTimeout(() => {
        fullScreenContainer.classList.add('active');
    }, 10);
}

// Apply filters
function applyFilter(imageData, filter) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    switch (filter) {
        case 'grayscale':
            for (let i = 0; i < data.length; i += 4) {
                const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = data[i + 1] = data[i + 2] = gray;
            }
            break;
            
        case 'sepia':
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                data[i] = r * 0.393 + g * 0.769 + b * 0.189;
                data[i + 1] = r * 0.349 + g * 0.686 + b * 0.168;
                data[i + 2] = r * 0.272 + g * 0.534 + b * 0.131;
            }
            break;
            
        case 'invert':
            for (let i = 0; i < data.length; i += 4) {
                data[i] = 255 - data[i];
                data[i + 1] = 255 - data[i + 1];
                data[i + 2] = 255 - data[i + 2];
            }
            break;
            
        case 'vintage':
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                data[i] = r * 0.62 + g * 0.32 + b * 0.06;
                data[i + 1] = r * 0.22 + g * 0.62 + b * 0.16;
                data[i + 2] = r * 0.12 + g * 0.22 + b * 0.66;
            }
            break;
            
        case 'blueprint':
            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                data[i] = Math.min(255, avg);
                data[i + 1] = Math.min(255, avg);
                data[i + 2] = Math.min(255, avg + 50);
            }
            break;
            
        case 'neon':
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, Math.abs(data[i] - 128) * 2);
                data[i + 1] = Math.min(255, Math.abs(data[i + 1] - 128) * 2);
                data[i + 2] = Math.min(255, Math.abs(data[i + 2] - 128) * 2);
            }
            break;
            
        case 'pastel':
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, data[i] + 50);
                data[i + 1] = Math.min(255, data[i + 1] + 50);
                data[i + 2] = Math.min(255, data[i + 2] + 50);
            }
            break;
            
        case 'dramatic':
            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                const contrast = 1.5; // Increase contrast
                data[i] = Math.min(255, Math.max(0, (data[i] - avg) * contrast + avg));
                data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - avg) * contrast + avg));
                data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - avg) * contrast + avg));
            }
            break;
            
        // Fun Snapchat-like filters
        case 'rainbow':
            for (let y = 0; y < height; y++) {
                // Create rainbow gradient based on y position
                const hue = (y / height) * 360;
                const [r, g, b] = hslToRgb(hue / 360, 0.7, 0.5);
                
                for (let x = 0; x < width; x++) {
                    const i = (y * width + x) * 4;
                    // Blend with original image
                    data[i] = (data[i] + r) / 2;
                    data[i + 1] = (data[i + 1] + g) / 2;
                    data[i + 2] = (data[i + 2] + b) / 2;
                }
            }
            break;
            
        case 'pixelate':
            const pixelSize = Math.max(8, Math.floor(width / 60)); // Adjust pixel size based on image width
            
            for (let y = 0; y < height; y += pixelSize) {
                for (let x = 0; x < width; x += pixelSize) {
                    // Get the color of the first pixel in the block
                    const i = (y * width + x) * 4;
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    
                    // Apply the same color to all pixels in the block
                    for (let blockY = 0; blockY < pixelSize && y + blockY < height; blockY++) {
                        for (let blockX = 0; blockX < pixelSize && x + blockX < width; blockX++) {
                            const blockI = ((y + blockY) * width + (x + blockX)) * 4;
                            data[blockI] = r;
                            data[blockI + 1] = g;
                            data[blockI + 2] = b;
                        }
                    }
                }
            }
            break;
            
        case 'cartoon':
            // First pass: Apply edge detection
            const edgeData = new Uint8ClampedArray(data.length);
            for (let i = 0; i < data.length; i++) {
                edgeData[i] = data[i];
            }
            
            // Simple edge detection
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    const i = (y * width + x) * 4;
                    
                    // Check surrounding pixels
                    const leftI = (y * width + (x - 1)) * 4;
                    const rightI = (y * width + (x + 1)) * 4;
                    const topI = ((y - 1) * width + x) * 4;
                    const bottomI = ((y + 1) * width + x) * 4;
                    
                    // Calculate differences
                    const diffX = Math.abs(data[leftI] - data[rightI]) + 
                                 Math.abs(data[leftI + 1] - data[rightI + 1]) + 
                                 Math.abs(data[leftI + 2] - data[rightI + 2]);
                    
                    const diffY = Math.abs(data[topI] - data[bottomI]) + 
                                 Math.abs(data[topI + 1] - data[bottomI + 1]) + 
                                 Math.abs(data[topI + 2] - data[bottomI + 2]);
                    
                    // If there's a significant difference, mark as edge
                    if (diffX > 100 || diffY > 100) {
                        edgeData[i] = edgeData[i + 1] = edgeData[i + 2] = 0; // Black edge
                    } else {
                        // Quantize colors for cartoon effect
                        edgeData[i] = Math.floor(data[i] / 40) * 40;
                        edgeData[i + 1] = Math.floor(data[i + 1] / 40) * 40;
                        edgeData[i + 2] = Math.floor(data[i + 2] / 40) * 40;
                    }
                }
            }
            
            // Copy edge data back to original
            for (let i = 0; i < data.length; i++) {
                data[i] = edgeData[i];
            }
            break;
            
        case 'thermal':
            for (let i = 0; i < data.length; i += 4) {
                const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                
                // Create thermal color mapping
                if (avg < 64) {
                    // Dark blue to purple
                    data[i] = avg;
                    data[i + 1] = 0;
                    data[i + 2] = avg * 2;
                } else if (avg < 128) {
                    // Purple to red
                    data[i] = (avg - 64) * 4;
                    data[i + 1] = 0;
                    data[i + 2] = 255 - (avg - 64) * 4;
                } else if (avg < 192) {
                    // Red to yellow
                    data[i] = 255;
                    data[i + 1] = (avg - 128) * 4;
                    data[i + 2] = 0;
                } else {
                    // Yellow to white
                    data[i] = 255;
                    data[i + 1] = 255;
                    data[i + 2] = (avg - 192) * 4;
                }
            }
            break;
            
        case 'mirror':
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width / 2; x++) {
                    const leftI = (y * width + x) * 4;
                    const rightI = (y * width + (width - 1 - x)) * 4;
                    
                    // Copy right half to left half
                    data[leftI] = data[rightI];
                    data[leftI + 1] = data[rightI + 1];
                    data[leftI + 2] = data[rightI + 2];
                }
            }
            break;
            
        case 'glitch':
            // Create random glitch blocks
            const numGlitches = 10;
            for (let g = 0; g < numGlitches; g++) {
                const glitchHeight = Math.floor(Math.random() * 20) + 10;
                const y = Math.floor(Math.random() * (height - glitchHeight));
                const offset = Math.floor(Math.random() * 30) - 15;
                
                // Shift a horizontal strip of the image
                for (let glitchY = 0; glitchY < glitchHeight; glitchY++) {
                    for (let x = 0; x < width; x++) {
                        const sourceX = Math.max(0, Math.min(width - 1, x + offset));
                        const sourceI = ((y + glitchY) * width + sourceX) * 4;
                        const targetI = ((y + glitchY) * width + x) * 4;
                        
                        // Only copy if within bounds
                        if (sourceI >= 0 && sourceI < data.length - 3) {
                            data[targetI] = data[sourceI];
                            data[targetI + 1] = data[sourceI + 1];
                            data[targetI + 2] = data[sourceI + 2];
                        }
                    }
                }
                
                // Add color shift to some glitches
                if (Math.random() > 0.5) {
                    const colorShift = Math.floor(Math.random() * 3);
                    for (let glitchY = 0; glitchY < glitchHeight; glitchY++) {
                        for (let x = 0; x < width; x++) {
                            const i = ((y + glitchY) * width + x) * 4;
                            data[i + colorShift] = Math.min(255, data[i + colorShift] + 50);
                        }
                    }
                }
            }
            break;
    }
}

// Helper function to convert HSL to RGB
function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Photo strip capture
async function capturePhotoStrip() {
    // Disable buttons during capture
    captureBtn.disabled = true;
    stripBtn.disabled = true;
    
    // Create an array to store the individual photos for the strip
    const stripPhotos = [];
    
    // Take 4 photos with a countdown between each
    for (let i = 0; i < 5; i++) {
        // Show a message indicating which photo is being taken
        const notification = document.createElement('div');
        notification.className = 'photo-count-notification';
        notification.textContent = `Photo ${i + 1} of 5`;
        document.body.appendChild(notification);
        
        // Take the photo
        await capturePhoto(true);
        
        // Store the latest photo URL
        stripPhotos.push(capturedPhotos[capturedPhotos.length - 1]);
        
        // Remove the notification
        notification.remove();
        
        // Wait before taking the next photo (except for the last one)
        if (i < 3) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    // Create the film strip image
    createFilmStrip(stripPhotos);
    
    // Re-enable buttons
    captureBtn.disabled = false;
    stripBtn.disabled = false;
}

// Create a film strip from multiple photos
function createFilmStrip(photoUrls) {
    if (photoUrls.length === 0) return;
    
    // Create a canvas to combine the photos
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Load all images first
    const loadImages = photoUrls.map(url => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = url;
        });
    });
    
    // Once all images are loaded, create the film strip
    Promise.all(loadImages).then(images => {
        // Get dimensions from the first image
        const imgWidth = images[0].width;
        const imgHeight = images[0].height;
        
        // Set canvas size for the film strip (add some padding between photos)
        const padding = 20;
        const borderWidth = 40; // Film strip border width
        const holeRadius = 15; // Film strip hole radius
        
        canvas.width = imgWidth + (borderWidth * 2);
        canvas.height = (imgHeight * images.length) + (padding * (images.length - 1)) + (borderWidth * 2);
        
        // Fill with black background for the film strip
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw film strip holes on both sides
        ctx.fillStyle = '#333'; // Darker color for the holes
        
        // Draw the film strip holes
        for (let i = 0; i <= images.length; i++) {
            // Left side holes
            ctx.beginPath();
            ctx.arc(borderWidth / 2, borderWidth + (i * (imgHeight + padding)), holeRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Right side holes
            ctx.beginPath();
            ctx.arc(canvas.width - (borderWidth / 2), borderWidth + (i * (imgHeight + padding)), holeRadius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw each image on the canvas
        images.forEach((img, index) => {
            const y = borderWidth + (index * (imgHeight + padding));
            ctx.drawImage(img, borderWidth, y, imgWidth, imgHeight);
            
            // Add a timestamp to each photo
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = '16px Arial';
            const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            ctx.fillText(timestamp, borderWidth + 10, y + imgHeight - 10);
        });
        
        // Add a title at the top
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PHOTO BOOTH STRIP', canvas.width / 2, 25);
        
        // Convert the canvas to an image URL
        const stripUrl = canvas.toDataURL('image/jpeg');
        
        // Add the film strip to captured photos
        capturedPhotos.push(stripUrl);
        
        // Create a preview for the film strip
        createPhotoPreview(stripUrl, true);
        
        // Enable download button
        downloadBtn.disabled = false;
        emailBtn.disabled = false;
        shareBtn.disabled = false;
        deleteBtn.disabled = false;
        
        // Show a notification that the strip is ready
        const notification = document.createElement('div');
        notification.className = 'strip-ready-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <span>Photo strip created! Click to view or download.</span>
                <button class="close-notification"><i class="fas fa-times"></i></button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Show with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 300);
        
        // Add close button functionality
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    });
}

// Download photo
function downloadPhoto() {
    if (capturedPhotos.length === 0) return;
    
    const link = document.createElement('a');
    link.download = 'photo-booth-' + new Date().getTime() + '.jpg';
    link.href = capturedPhotos[capturedPhotos.length - 1];
    link.click();
}

// Email photo
function showEmailModal() {
    // Set default email if not already set
    if (!document.getElementById('email').value) {
        document.getElementById('email').value = 'gunjalmahin@gmail.com';
    }
    
    // Show the modal
    const emailModal = new bootstrap.Modal(document.getElementById('emailModal'));
    emailModal.show();
}

// Handle email form submission
document.getElementById('email-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('email-message').value;
    
    if (capturedPhotos.length === 0) {
        alert('No photos to send. Please capture a photo first.');
        return;
    }
    
    const photoUrl = capturedPhotos[capturedPhotos.length - 1];
    
    try {
        // Show sending indicator
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        // Simulate sending email (in a real app, this would be a server request)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Show success message
        alert(`Photo successfully sent to ${email}!\n\nNote: This is a frontend demo. In a production environment, this would connect to a backend service to actually send the email.`);
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Close modal
        const emailModal = bootstrap.Modal.getInstance(document.getElementById('emailModal'));
        emailModal.hide();
        
        // Log the action (for demo purposes)
        console.log(`Email would be sent to: ${email}`);
        console.log(`Subject: ${subject}`);
        console.log(`Message: ${message}`);
        console.log(`With photo: ${photoUrl}`);
        
    } catch (error) {
        console.error('Error sending email:', error);
        alert('Failed to send email. Please try again.');
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// Share photo
async function sharePhoto() {
    if (capturedPhotos.length === 0) return;

    if (navigator.share) {
        try {
            const response = await fetch(capturedPhotos[capturedPhotos.length - 1]);
            const blob = await response.blob();
            const file = new File([blob], 'photo-booth.jpg', { type: 'image/jpeg' });
            
            await navigator.share({
                files: [file],
                title: 'Photo Booth Picture',
                text: 'Check out my photo booth picture!'
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    } else {
        alert('Web Share API is not supported in your browser');
    }
}

// Delete all photos
function deleteAllPhotos() {
    if (capturedPhotos.length === 0) return;
    
    if (confirm('Are you sure you want to delete all photos?')) {
        capturedPhotos = [];
        previewContainer.innerHTML = '';
        downloadBtn.disabled = true;
        emailBtn.disabled = true;
        shareBtn.disabled = true;
        deleteBtn.disabled = true;
    }
}

// Add sticker
function addSticker(stickerSrc, stickerId) {
    const sticker = document.createElement('img');
    sticker.src = stickerSrc;
    sticker.classList.add('sticker-container');
    sticker.dataset.sticker = stickerId;
    
    // Set initial position (center of webcam)
    const stickerObj = {
        id: 'sticker-' + Date.now(),
        src: stickerSrc,
        x: 40,
        y: 40,
        width: 20,
        height: 20
    };
    
    sticker.style.left = stickerObj.x + '%';
    sticker.style.top = stickerObj.y + '%';
    sticker.style.width = stickerObj.width + '%';
    sticker.style.height = 'auto';
    
    // Make sticker draggable
    let isDragging = false;
    let offsetX, offsetY;
    
    sticker.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - sticker.getBoundingClientRect().left;
        offsetY = e.clientY - sticker.getBoundingClientRect().top;
        sticker.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const webcamRect = webcamContainer.getBoundingClientRect();
        const x = e.clientX - webcamRect.left - offsetX;
        const y = e.clientY - webcamRect.top - offsetY;
        
        // Convert to percentage
        const xPercent = (x / webcamRect.width) * 100;
        const yPercent = (y / webcamRect.height) * 100;
        
        sticker.style.left = xPercent + '%';
        sticker.style.top = yPercent + '%';
        
        // Update sticker object
        stickerObj.x = xPercent;
        stickerObj.y = yPercent;
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            sticker.style.cursor = 'grab';
        }
    });
    
    // Add delete button
    const deleteBtn = document.createElement('div');
    deleteBtn.classList.add('sticker-delete');
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    deleteBtn.addEventListener('click', () => {
        sticker.remove();
        const index = activeStickers.findIndex(s => s.id === stickerObj.id);
        if (index > -1) {
            activeStickers.splice(index, 1);
        }
    });
    
    sticker.appendChild(deleteBtn);
    stickersOverlay.appendChild(sticker);
    activeStickers.push(stickerObj);
}

// Add text overlay
function addTextOverlay() {
    const content = textInput.value.trim();
    if (!content) return;
    
    const textElement = document.createElement('div');
    textElement.classList.add('text-container', 'sticker-container');
    textElement.style.color = textColor.value;
    textElement.style.fontSize = textSize.value + 'px';
    textElement.textContent = content;
    
    // Set initial position (center of webcam)
    const textObj = {
        id: 'text-' + Date.now(),
        content: content,
        color: textColor.value,
        size: parseInt(textSize.value),
        x: 40,
        y: 40
    };
    
    textElement.style.left = textObj.x + '%';
    textElement.style.top = textObj.y + '%';
    
    // Make text draggable
    let isDragging = false;
    let offsetX, offsetY;
    
    textElement.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - textElement.getBoundingClientRect().left;
        offsetY = e.clientY - textElement.getBoundingClientRect().top;
        textElement.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const webcamRect = webcamContainer.getBoundingClientRect();
        const x = e.clientX - webcamRect.left - offsetX;
        const y = e.clientY - webcamRect.top - offsetY;
        
        // Convert to percentage
        const xPercent = (x / webcamRect.width) * 100;
        const yPercent = (y / webcamRect.height) * 100;
        
        textElement.style.left = xPercent + '%';
        textElement.style.top = yPercent + '%';
        
        // Update text object
        textObj.x = xPercent;
        textObj.y = yPercent;
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            textElement.style.cursor = 'grab';
        }
    });
    
    // Add delete button
    const deleteBtn = document.createElement('div');
    deleteBtn.classList.add('sticker-delete');
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
    deleteBtn.addEventListener('click', () => {
        textElement.remove();
        const index = activeTexts.findIndex(t => t.id === textObj.id);
        if (index > -1) {
            activeTexts.splice(index, 1);
        }
    });
    
    textElement.appendChild(deleteBtn);
    textOverlay.appendChild(textElement);
    activeTexts.push(textObj);
    
    // Clear input
    textInput.value = '';
}

// Toggle dark/light theme
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    isDarkTheme = !isDarkTheme;
    
    if (isDarkTheme) {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
    
    // Save preference
    localStorage.setItem('darkTheme', isDarkTheme);
}

// Load saved theme preference
function loadThemePreference() {
    const savedTheme = localStorage.getItem('darkTheme');
    if (savedTheme === 'true') {
        toggleTheme();
    }
}

// Share Website Functions
function showShareWebsiteModal() {
    // Set the current URL with a direct start parameter
    const currentUrl = new URL(window.location.href);
    
    // Add auto-start parameter to URL
    currentUrl.searchParams.set('autostart', 'true');
    
    // Set the URL in the input field
    document.getElementById('share-url').value = currentUrl.toString();
    
    // Check if Web Share API is available (for mobile devices)
    const webShareAvailable = navigator && navigator.share;
    const mobileShareBtn = document.getElementById('mobile-share-btn');
    
    if (mobileShareBtn) {
        if (webShareAvailable) {
            mobileShareBtn.style.display = 'block';
        } else {
            mobileShareBtn.style.display = 'none';
        }
    }
    
    // Show the modal
    const shareModal = new bootstrap.Modal(document.getElementById('shareWebsiteModal'));
    shareModal.show();
}

function copyShareUrl() {
    // Select the URL text
    shareUrlInput.select();
    shareUrlInput.setSelectionRange(0, 99999); // For mobile devices
    
    // Copy to clipboard
    document.execCommand('copy');
    
    // Change button text temporarily
    const originalText = copyUrlBtn.innerHTML;
    copyUrlBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    
    // Reset button text after 2 seconds
    setTimeout(() => {
        copyUrlBtn.innerHTML = originalText;
    }, 2000);
}

function shareOnPlatform(platform) {
    const shareUrl = document.getElementById('share-url').value;
    let shareLink = '';
    
    switch(platform) {
        case 'facebook':
            shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
            break;
        case 'twitter':
            shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Check out this amazing photo booth website!')}`;
            break;
        case 'whatsapp':
            shareLink = `https://api.whatsapp.com/send?text=${encodeURIComponent('Check out this amazing photo booth website: ' + shareUrl)}`;
            break;
        case 'linkedin':
            shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
            break;
        case 'email':
            shareLink = `mailto:?subject=${encodeURIComponent('Check out this amazing photo booth website!')}&body=${encodeURIComponent('I found this awesome photo booth web app. Try it out: ' + shareUrl)}`;
            break;
    }
    
    if (shareLink) {
        window.open(shareLink, '_blank');
    }
}

// Check for autostart parameter when page loads
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('autostart') === 'true') {
        // Auto-initialize webcam
        initWebcam();
        
        // Show a welcome toast or notification
        showAutoStartNotification();
    }
});

// Show notification for auto-started session
function showAutoStartNotification() {
    // Create a toast notification
    const notification = document.createElement('div');
    notification.className = 'auto-start-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-info-circle"></i>
            <span>Photo booth started automatically from a shared link!</span>
            <button class="close-notification"><i class="fas fa-times"></i></button>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 300);
    
    // Add close button functionality
    notification.querySelector('.close-notification').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initWebcam();
    loadThemePreference();
    
    // Add mirror mode button to controls
    const controlsDiv = document.querySelector('.controls .col-12');
    const mirrorBtn = document.createElement('button');
    mirrorBtn.id = 'mirror-btn';
    mirrorBtn.className = 'btn btn-secondary me-2';
    mirrorBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Mirror';
    mirrorBtn.addEventListener('click', toggleMirrorMode);
    controlsDiv.appendChild(mirrorBtn);
});

captureBtn.addEventListener('click', () => capturePhoto(true));
stripBtn.addEventListener('click', capturePhotoStrip);
filterBtn.addEventListener('click', () => {
    filterOptions.style.display = filterOptions.style.display === 'none' ? 'flex' : 'none';
    stickersPanel.style.display = 'none';
    textOverlayPanel.style.display = 'none';
});

stickerBtn.addEventListener('click', () => {
    stickersPanel.style.display = stickersPanel.style.display === 'none' ? 'flex' : 'none';
    filterOptions.style.display = 'none';
    textOverlayPanel.style.display = 'none';
});

textBtn.addEventListener('click', () => {
    textOverlayPanel.style.display = textOverlayPanel.style.display === 'none' ? 'block' : 'none';
    filterOptions.style.display = 'none';
    stickersPanel.style.display = 'none';
});

rotateBtn.addEventListener('click', () => {
    rotation = (rotation + 90) % 360;
    updateMirrorMode();
    
    // This will also update the filter preview since it's called in updateMirrorMode
});

downloadBtn.addEventListener('click', downloadPhoto);
emailBtn.addEventListener('click', showEmailModal);
shareBtn.addEventListener('click', sharePhoto);
deleteBtn.addEventListener('click', deleteAllPhotos);
themeToggle.addEventListener('click', toggleTheme);
addTextBtn.addEventListener('click', addTextOverlay);

// Website sharing event listeners
shareWebsiteBtn.addEventListener('click', showShareWebsiteModal);
copyUrlBtn.addEventListener('click', copyShareUrl);

// Social media sharing buttons
shareBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const platform = btn.dataset.platform;
        shareOnPlatform(platform);
    });
});

// Filter option buttons
document.querySelectorAll('.filter-options button').forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        document.querySelectorAll('.filter-options button').forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Set current filter
        currentFilter = button.dataset.filter;
        
        // Update the filter preview
        if (filterCanvas) {
            if (currentFilter === 'normal') {
                filterCanvas.style.display = 'none';
            } else {
                filterCanvas.style.display = 'block';
                startFilterPreview();
            }
        }
    });
});

// Sticker option buttons
document.querySelectorAll('.sticker-item').forEach(item => {
    item.addEventListener('click', () => {
        addSticker(item.src, item.dataset.sticker);
    });
});

// Share using native mobile share functionality
function shareWithNative() {
    const shareUrl = document.getElementById('share-url').value;
    const shareTitle = 'Check out this amazing Photo Booth!';
    const shareText = 'I found this awesome photo booth web app. Try it out!';
    
    if (navigator && navigator.share) {
        navigator.share({
            title: shareTitle,
            text: shareText,
            url: shareUrl
        })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing:', error));
        
        // Close the modal after sharing
        const shareModal = bootstrap.Modal.getInstance(document.getElementById('shareWebsiteModal'));
        if (shareModal) {
            shareModal.hide();
        }
    } else {
        alert('Web Share API is not supported in your browser. Please use the other sharing options.');
    }
} 