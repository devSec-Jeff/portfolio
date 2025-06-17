document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    const carouselContainer = document.querySelector('.carousel-container');
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevButton = document.querySelector('.carousel-control.prev');
    const nextButton = document.querySelector('.carousel-control.next');
    
    // Theme Toggle
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // Carousel Functionality
    let currentSlide = 0;
    let slideInterval;
    let isTransitioning = false;
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    let isSwiping = false;

    // Function to show a specific slide
    function showSlide(index) {
        if (isTransitioning || !slides.length) return;
        isTransitioning = true;

        // Remove active class from all slides and indicators
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));

        // Add active class to current slide and indicator
        slides[index].classList.add('active');
        if (indicators[index]) {
            indicators[index].classList.add('active');
        }
        currentSlide = index;

        // Reset transition flag after animation
        setTimeout(() => {
            isTransitioning = false;
        }, 500);
    }

    // Function to show next slide
    function nextSlide() {
        if (!slides.length) return;
        let next = currentSlide + 1;
        if (next >= slides.length) {
            next = 0;
        }
        showSlide(next);
    }

    // Function to show previous slide
    function prevSlide() {
        if (!slides.length) return;
        let prev = currentSlide - 1;
        if (prev < 0) {
            prev = slides.length - 1;
        }
        showSlide(prev);
    }

    // Start automatic slideshow
    function startSlideshow() {
        stopSlideshow();
        const isMobile = window.innerWidth <= 768;
        const interval = isMobile ? 4000 : 5000;
        slideInterval = setInterval(nextSlide, interval);
    }

    // Stop automatic slideshow
    function stopSlideshow() {
        if (slideInterval) {
            clearInterval(slideInterval);
        }
    }

    // Event listeners for controls
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            stopSlideshow();
            nextSlide();
            startSlideshow();
        });
    }

    if (prevButton) {
        prevButton.addEventListener('click', () => {
            stopSlideshow();
            prevSlide();
            startSlideshow();
        });
    }

    // Event listeners for indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            stopSlideshow();
            showSlide(index);
            startSlideshow();
        });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            stopSlideshow();
            prevSlide();
            startSlideshow();
        } else if (e.key === 'ArrowRight') {
            stopSlideshow();
            nextSlide();
            startSlideshow();
        }
    });

    // Touch events for mobile
    if (carouselContainer) {
        carouselContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
            isSwiping = true;
        });

        carouselContainer.addEventListener('touchmove', (e) => {
            if (!isSwiping) return;
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            
            const deltaX = Math.abs(touchEndX - touchStartX);
            const deltaY = Math.abs(touchEndY - touchStartY);
            
            if (deltaX > deltaY) {
                e.preventDefault();
            }
        });

        carouselContainer.addEventListener('touchend', (e) => {
            if (!isSwiping) return;
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
            isSwiping = false;
        });
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        const deltaX = touchEndX - touchStartX;
        const deltaY = Math.abs(touchEndY - touchStartY);
        
        if (Math.abs(deltaX) > deltaY) {
            if (deltaX < -swipeThreshold) {
                stopSlideshow();
                nextSlide();
                startSlideshow();
            } else if (deltaX > swipeThreshold) {
                stopSlideshow();
                prevSlide();
                startSlideshow();
            }
        }
    }

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            startSlideshow();
        }, 250);
    });

    // Start the slideshow if carousel exists
    if (carouselContainer && slides.length > 0) {
        startSlideshow();

        // Pause slideshow when hovering over carousel
        carouselContainer.addEventListener('mouseenter', stopSlideshow);
        carouselContainer.addEventListener('mouseleave', startSlideshow);
    }

    // Form Handling
    const proposalForm = document.getElementById('proposalForm');
    const fileUpload = document.querySelector('.file-upload');
    const fileInput = document.getElementById('projectFiles');

    if (proposalForm && fileUpload && fileInput) {
        // File Upload Handling
        fileUpload.addEventListener('click', () => fileInput.click());
        
        fileUpload.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUpload.classList.add('dragover');
        });

        fileUpload.addEventListener('dragleave', () => {
            fileUpload.classList.remove('dragover');
        });

        fileUpload.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUpload.classList.remove('dragover');
            fileInput.files = e.dataTransfer.files;
            updateFileList();
        });

        fileInput.addEventListener('change', updateFileList);

        function updateFileList() {
            const fileList = fileInput.files;
            const fileUploadInfo = fileUpload.querySelector('.file-upload-info');
            
            if (fileList.length > 0) {
                let fileNames = Array.from(fileList).map(file => file.name).join(', ');
                fileUploadInfo.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    <p>${fileList.length} file(s) selected</p>
                    <p class="file-types">${fileNames}</p>
                `;
            } else {
                fileUploadInfo.innerHTML = `
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>Drag & drop files here or click to browse</p>
                    <p class="file-types">Accepted formats: PDF, DOC, DOCX, TXT, MD, ZIP, RAR</p>
                `;
            }
        }

        // Form Validation
        proposalForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!validateForm()) {
                return;
            }

            const submitButton = this.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.classList.add('loading');
                submitButton.disabled = true;
            }

            try {
                const formData = new FormData(this);
                await simulateFormSubmission(formData);
                showNotification('Proposal submitted successfully!', 'success');
                proposalForm.reset();
                updateFileList();
            } catch (error) {
                showNotification('Error submitting proposal. Please try again.', 'error');
            } finally {
                if (submitButton) {
                    submitButton.classList.remove('loading');
                    submitButton.disabled = false;
                }
            }
        });

        function validateForm() {
            const requiredFields = proposalForm.querySelectorAll('[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('invalid');
                } else {
                    field.classList.remove('invalid');
                }
            });

            const startDate = new Date(document.getElementById('startDate')?.value);
            const endDate = new Date(document.getElementById('endDate')?.value);
            
            if (startDate && endDate && startDate > endDate) {
                showNotification('End date must be after start date', 'error');
                isValid = false;
            }

            return isValid;
        }
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    async function simulateFormSubmission(formData) {
        return new Promise((resolve) => {
            setTimeout(resolve, 1500);
        });
    }
}); 