// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const contactForm = document.getElementById('contact-form');
const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
const navbar = document.querySelector('.navbar');
const shareWebsiteBtn = document.getElementById('share-website-btn');
const shareUrlInput = document.getElementById('share-url');
const copyUrlBtn = document.getElementById('copy-url-btn');
const shareBtns = document.querySelectorAll('.share-btn');

// Global variables
let isDarkTheme = false;

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

// Handle navbar scroll behavior
function handleNavbarScroll() {
    if (window.scrollY > 50) {
        navbar.classList.add('navbar-scrolled');
    } else {
        navbar.classList.remove('navbar-scrolled');
    }
}

// Handle smooth scrolling for anchor links
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
                
                // Update active nav link
                navLinks.forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });
}

// Handle contact form submission
function handleContactForm() {
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');
    
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value;
        const email = document.getElementById('contact-email').value;
        const subject = document.getElementById('subject')?.value || 'Contact Form Submission';
        const message = document.getElementById('message').value;
        
        // In a real application, you would send this data to a server
        console.log('Form submitted:', { name, email, subject, message });
        
        // Show success message with animation
        const formElements = contactForm.querySelectorAll('input, textarea, button');
        
        // Disable form elements
        formElements.forEach(element => {
            element.disabled = true;
        });
        
        // Animate form elements out
        gsapFadeOut(formElements);
        
        // Show success message
        setTimeout(() => {
            formSuccess.classList.add('show');
            
            // Reset form after 3 seconds
            setTimeout(() => {
                // Reset form
                contactForm.reset();
                
                // Hide success message
                formSuccess.classList.remove('show');
                
                // Enable form elements
                formElements.forEach(element => {
                    element.disabled = false;
                });
                
                // Animate form elements back in
                gsapFadeIn(formElements);
            }, 3000);
        }, 500);
    });
}

// GSAP-like fade out animation
function gsapFadeOut(elements) {
    elements.forEach((element, index) => {
        setTimeout(() => {
            element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            element.style.opacity = '0';
            element.style.transform = 'translateY(-10px)';
        }, index * 50);
    });
}

// GSAP-like fade in animation
function gsapFadeIn(elements) {
    elements.forEach((element, index) => {
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

// Update active nav link based on scroll position
function updateActiveNavLink() {
    const scrollPosition = window.scrollY + 100;
    
    document.querySelectorAll('section').forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// Initialize animations
function initAnimations() {
    // Add animation classes to elements when they come into view
    const animateElements = document.querySelectorAll('.feature-card, .pricing-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    animateElements.forEach(element => {
        observer.observe(element);
    });
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
        // Auto-scroll to features or directly go to photo booth
        const startButton = document.querySelector('.start-btn');
        if (startButton) {
            // Highlight the start button with a pulse animation
            startButton.classList.add('pulse-animation');
            
            // Scroll to the button
            startButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Optional: Auto-click after a delay
            setTimeout(() => {
                startButton.click();
            }, 2000); // 2 seconds delay
        }
    }
});

// Handle billing toggle
function setupBillingToggle() {
    const billingToggle = document.getElementById('billingToggle');
    if (!billingToggle) return;
    
    const monthlyPrices = ['₹0', '₹499', '₹999', '₹1,999'];
    const annualPrices = ['₹0', '₹399', '₹799', '₹1,599'];
    const priceElements = document.querySelectorAll('.price');
    
    billingToggle.addEventListener('change', function() {
        const isAnnual = this.checked;
        
        priceElements.forEach((element, index) => {
            if (index === 0) {
                // Skip the free plan
                return;
            }
            
            const priceValue = isAnnual ? annualPrices[index] : monthlyPrices[index];
            const billingPeriod = isAnnual ? '/year' : '/month';
            
            // Update the price text
            element.innerHTML = `${priceValue}<small>${billingPeriod}</small>`;
            
            // Add a "billed annually" note if annual is selected
            const pricingCard = element.closest('.pricing-card');
            let billingNote = pricingCard.querySelector('.billing-note');
            
            if (isAnnual) {
                if (!billingNote) {
                    billingNote = document.createElement('p');
                    billingNote.className = 'billing-note text-muted small mt-1';
                    element.parentNode.insertBefore(billingNote, element.nextSibling);
                }
                billingNote.textContent = `Billed annually at ${priceValue}`;
            } else if (billingNote) {
                billingNote.remove();
            }
        });
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadThemePreference();
    setupSmoothScrolling();
    handleContactForm();
    initAnimations();
    setupBillingToggle();
    
    // Update active nav link on page load
    updateActiveNavLink();
    
    // Website sharing event listeners
    if (shareWebsiteBtn) {
        shareWebsiteBtn.addEventListener('click', showShareWebsiteModal);
    }
    
    if (copyUrlBtn) {
        copyUrlBtn.addEventListener('click', copyShareUrl);
    }
    
    // Social media sharing buttons
    shareBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const platform = btn.dataset.platform;
            shareOnPlatform(platform);
        });
    });
});

themeToggle.addEventListener('click', toggleTheme);
window.addEventListener('scroll', () => {
    handleNavbarScroll();
    updateActiveNavLink();
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

// Toggle QR code display and generate QR code
function toggleQRCode() {
    const qrContainer = document.getElementById('qr-code-container');
    const qrCodeDiv = document.getElementById('qrcode');
    const shareUrl = document.getElementById('share-url').value;
    
    if (qrContainer.style.display === 'none') {
        // Show QR container
        qrContainer.style.display = 'block';
        
        // Clear previous QR code
        qrCodeDiv.innerHTML = '';
        
        // Generate new QR code
        QRCode.toCanvas(qrCodeDiv, shareUrl, {
            width: 200,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        }, function(error) {
            if (error) console.error(error);
        });
        
        // Change button text
        document.getElementById('show-qr-btn').innerHTML = '<i class="fas fa-times"></i> Hide QR Code';
    } else {
        // Hide QR container
        qrContainer.style.display = 'none';
        
        // Change button text back
        document.getElementById('show-qr-btn').innerHTML = '<i class="fas fa-qrcode"></i> Show QR Code';
    }
} 