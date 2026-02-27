document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Navbar Scroll Effect ---
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- 2. Mobile Menu Toggle ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links a');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // --- 3. Scroll Reveal Animation ---
    const reveals = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 150;

        reveals.forEach(reveal => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger once on load

    // --- 4. Countdown Timer ---
    // Set the wedding date here (Year, Month (0-indexed), Day, Hour, Minute)
    // Note: Month is 0-indexed in JS, so 2 is March!
    const weddingDate = new Date(2027, 2, 20, 16, 0, 0).getTime();

    const countdownTimer = setInterval(() => {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        // Time calculations
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display results
        document.getElementById("days").innerText = days < 10 ? '0' + days : days;
        document.getElementById("hours").innerText = hours < 10 ? '0' + hours : hours;
        document.getElementById("minutes").innerText = minutes < 10 ? '0' + minutes : minutes;
        document.getElementById("seconds").innerText = seconds < 10 ? '0' + seconds : seconds;

        // If the countdown is over
        if (distance < 0) {
            clearInterval(countdownTimer);
            document.getElementById("countdown").innerHTML = "<h3>Chegou o grande dia!</h3>";
        }
    }, 1000);

    // --- 5. RSVP Form Logic ---
    const rsvpForm = document.getElementById('rsvpForm');
    const attendingSelect = document.getElementById('attending');
    const guestsGroup = document.getElementById('guests-group');
    const formMessage = document.getElementById('formMessage');

    // Show/hide guests input based on attendance
    attendingSelect.addEventListener('change', (e) => {
        if (e.target.value === 'yes') {
            guestsGroup.style.display = 'block';
        } else {
            guestsGroup.style.display = 'none';
            document.getElementById('guests').value = 0; // Reset guests if not attending
        }
    });

    // Handle AJAX form submission via Formspree
    rsvpForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent standard redirect

        const submitBtn = document.getElementById('submitBtn');
        const name = document.getElementById('name').value;
        const originalBtnText = submitBtn.innerText;

        // Basic UI feedback while sending
        submitBtn.innerText = "Enviando...";
        submitBtn.disabled = true;

        const formData = new FormData(rsvpForm);

        try {
            const response = await fetch(rsvpForm.action, {
                method: rsvpForm.method,
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                formMessage.innerText = `Obrigado, ${name}! Sua resposta foi registrada com sucesso.`;
                formMessage.className = 'form-message success';

                // Reset form
                rsvpForm.reset();
                guestsGroup.style.display = 'none';
            } else {
                const data = await response.json();
                if (Object.hasOwn(data, 'errors')) {
                    formMessage.innerText = data["errors"].map(error => error["message"]).join(", ");
                } else {
                    formMessage.innerText = "Oops! Houve um problema ao enviar o formulário.";
                }
                formMessage.className = 'form-message';
                formMessage.style.backgroundColor = '#f8d7da';
                formMessage.style.color = '#721c24';
                formMessage.style.borderColor = '#f5c6cb';
                formMessage.style.display = 'block';
            }
        } catch (error) {
            formMessage.innerText = "Ops! Ocorreu um erro de rede. Tente novamente mais tarde.";
            formMessage.className = 'form-message';
            formMessage.style.backgroundColor = '#f8d7da';
            formMessage.style.color = '#721c24';
            formMessage.style.borderColor = '#f5c6cb';
            formMessage.style.display = 'block';
        }

        // Restore button state
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;

        // Hide message after 5 seconds if successful
        if (formMessage.classList.contains('success')) {
            formMessage.style.display = 'block';
            setTimeout(() => {
                formMessage.style.display = 'none';
                formMessage.className = 'form-message';
            }, 6000);
        }
    });
    // --- 6. Background Music Control ---
    const bgMusic = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-btn');
    let isMusicPlaying = !bgMusic.paused;
    let hasAttemptedAutoplay = false;

    // Sync UI state with audio state
    bgMusic.addEventListener('play', () => {
        isMusicPlaying = true;
        musicBtn.classList.add('playing');
        hasAttemptedAutoplay = true;
    });

    bgMusic.addEventListener('pause', () => {
        isMusicPlaying = false;
        musicBtn.classList.remove('playing');
    });

    // Check if autoplay already worked on load
    if (isMusicPlaying) {
        musicBtn.classList.add('playing');
        hasAttemptedAutoplay = true;
    }

    // Toggle Play/Pause on button click
    musicBtn.addEventListener('click', () => {
        if (isMusicPlaying) {
            bgMusic.pause();
        } else {
            bgMusic.play().catch(e => console.error("Error playing audio:", e));
        }
        hasAttemptedAutoplay = true; // User manually interacted
    });

    // Fallback: Attempt to auto-play on first user interaction if blocked
    const tryAutoplay = () => {
        if (!hasAttemptedAutoplay && !isMusicPlaying) {
            bgMusic.play().then(() => {
                // UI state will be updated by the 'play' event listener
                // Remove listeners once successfully played
                document.removeEventListener('click', tryAutoplay);
                document.removeEventListener('scroll', tryAutoplay);
                document.removeEventListener('touchstart', tryAutoplay);
            }).catch(e => {
                // Autoplay blocked, wait for next interaction
                console.log("Autoplay waiting for user interaction");
            });
        }
    };

    // Listen to various interactions to trigger the autoplay attempt
    document.addEventListener('click', tryAutoplay, { once: true });
    document.addEventListener('scroll', tryAutoplay, { once: true });
    document.addEventListener('touchstart', tryAutoplay, { once: true });
});
