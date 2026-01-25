// Certificate Slider Functionality
let currentSlide = 0;
let totalSlides = 0;
let maxSlide = 0;
let slidesPerView = 3;
let modal;
let modalImage;
let lastFocusedElement;

function getSlidesPerView() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
}

function initSlider() {
    const slides = document.querySelectorAll('.slide');
    totalSlides = slides.length;
    
    if (totalSlides === 0) return;

    slides.forEach((slide) => {
        const image = slide.querySelector('img');
        if (!image) return;
        slide.setAttribute('role', 'button');
        slide.setAttribute('tabindex', '0');
        slide.addEventListener('click', () => openCertificateModal(image.src, image.alt || 'Certificate'));
        slide.addEventListener('keypress', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openCertificateModal(image.src, image.alt || 'Certificate');
            }
        });
    });
    
    // Calculate maxSlide based on screen size
    slidesPerView = getSlidesPerView();
    maxSlide = totalSlides - slidesPerView;
    
    const dotsContainer = document.getElementById('sliderDots');
    if (dotsContainer) {
        // Clear existing dots
        dotsContainer.innerHTML = '';
        
        // Create dots for each position
        const numDots = Math.ceil(totalSlides / slidesPerView);
        for (let i = 0; i < numDots; i++) {
            const dot = document.createElement('span');
            dot.className = 'dot';
            dot.onclick = () => goToSlide(i * slidesPerView);
            dotsContainer.appendChild(dot);
        }
        updateSlider();
    }
}

function updateSlider() {
    const slides = document.querySelector('.slides');
    const dots = document.querySelectorAll('.dot');
    
    if (slides) {
        // Calculate the exact percentage to translate
        const slideWidth = window.innerWidth <= 768 ? 100 : (window.innerWidth <= 1024 ? 50 : 33.333);
        const translateAmount = currentSlide * slideWidth;
        slides.style.transform = `translateX(-${translateAmount}%)`;
        
        // Update dots - highlight the dot that corresponds to the current position
        dots.forEach((dot, index) => {
            const dotPosition = index * slidesPerView;
            const isActive = currentSlide >= dotPosition && currentSlide < dotPosition + slidesPerView;
            dot.classList.toggle('active', isActive);
        });
    }
}

function moveSlide(direction) {
    currentSlide += direction;
    
    // Loop back to start/end
    if (currentSlide > maxSlide) {
        currentSlide = 0;
    } else if (currentSlide < 0) {
        currentSlide = maxSlide;
    }
    
    updateSlider();
}

function goToSlide(slideIndex) {
    currentSlide = Math.min(slideIndex, maxSlide);
    updateSlider();
}

// Auto play slider
let autoPlayInterval;

function startAutoPlay() {
    stopAutoPlay();
    autoPlayInterval = setInterval(() => {
        moveSlide(1);
    }, 5000);
}

function stopAutoPlay() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    }
}

function openCertificateModal(imageSrc, title) {
    if (!modal || !modalImage) return;
    modalImage.src = imageSrc;
    modalImage.alt = title;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    lastFocusedElement = document.activeElement;
    const closeButton = modal.querySelector('.certificate-modal__close');
    if (closeButton) closeButton.focus();
    document.body.style.overflow = 'hidden';
    stopAutoPlay();
}

function closeCertificateModal() {
    if (!modal || !modalImage) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    modalImage.removeAttribute('src');
    modalImage.alt = '';
    document.body.style.overflow = '';
    if (lastFocusedElement) {
        lastFocusedElement.focus();
        lastFocusedElement = null;
    }
    startAutoPlay();
}

// Pause auto play on hover
document.addEventListener('DOMContentLoaded', () => {
    const sliderContainer = document.querySelector('.certificate-slider');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', stopAutoPlay);
        sliderContainer.addEventListener('mouseleave', startAutoPlay);
    }

    modal = document.getElementById('certificateModal');
    if (modal) {
        modalImage = document.getElementById('certificateModalImage');
        modal.addEventListener('click', (event) => {
            const target = event.target;
            if (target.hasAttribute('data-close-modal') || target === modal) {
                closeCertificateModal();
            }
        });
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    // Recalculate based on new screen size
    slidesPerView = getSlidesPerView();
    maxSlide = totalSlides - slidesPerView;
    
    // Reset to first slide if current slide is out of bounds
    if (currentSlide > maxSlide) {
        currentSlide = maxSlide;
    }
    
    // Reinitialize dots
    const dotsContainer = document.getElementById('sliderDots');
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        const numDots = Math.ceil(totalSlides / slidesPerView);
        for (let i = 0; i < numDots; i++) {
            const dot = document.createElement('span');
            dot.className = 'dot';
            dot.onclick = () => goToSlide(i * slidesPerView);
            dotsContainer.appendChild(dot);
        }
    }
    
    updateSlider();
});

// Initialize slider when DOM is fully loaded
window.addEventListener('load', () => {
    initSlider();
    startAutoPlay();
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal?.classList.contains('is-open')) {
        closeCertificateModal();
    }
});
