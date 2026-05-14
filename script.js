/* ===========================================================
   William Newkirk — Personal Site
   Shared behavior: nav, theme, reveal, counters, skills, canvas
   =========================================================== */

(() => {
    'use strict';

    /* -------------------------------------------------------
       Theme toggle (persisted in localStorage)
       ------------------------------------------------------- */
    const THEME_KEY = 'wjn-theme';
    const root = document.documentElement;
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
        root.setAttribute('data-theme', savedTheme);
    }

    function setThemeIcon(btn) {
        if (!btn) return;
        const isLight = root.getAttribute('data-theme') === 'light';
        btn.innerHTML = isLight
            ? '<i class="fas fa-moon"></i>'
            : '<i class="fas fa-sun"></i>';
        btn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    }

    function initThemeToggle() {
        const btn = document.getElementById('themeToggle');
        if (!btn) return;
        setThemeIcon(btn);
        btn.addEventListener('click', () => {
            const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            root.setAttribute('data-theme', next);
            localStorage.setItem(THEME_KEY, next);
            setThemeIcon(btn);
        });
    }

    /* -------------------------------------------------------
       Mobile nav toggle
       ------------------------------------------------------- */
    function initMobileNav() {
        const toggle = document.getElementById('menuToggle');
        const navLinks = document.getElementById('navLinks');
        if (!toggle || !navLinks) return;
        toggle.addEventListener('click', () => {
            const open = navLinks.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
        window.addEventListener('resize', () => {
            if (window.innerWidth > 720) navLinks.classList.remove('open');
        });
    }

    /* -------------------------------------------------------
       Scroll progress bar
       ------------------------------------------------------- */
    function initScrollProgress() {
        const bar = document.getElementById('scroll-progress');
        if (!bar) return;
        const update = () => {
            const scrolled = window.scrollY;
            const height = document.documentElement.scrollHeight - window.innerHeight;
            const pct = height > 0 ? (scrolled / height) * 100 : 0;
            bar.style.width = pct + '%';
        };
        update();
        window.addEventListener('scroll', update, { passive: true });
    }

    /* -------------------------------------------------------
       Back-to-top button
       ------------------------------------------------------- */
    function initBackToTop() {
        const btn = document.getElementById('backToTop');
        if (!btn) return;
        const toggle = () => {
            if (window.scrollY > 400) btn.classList.add('show');
            else btn.classList.remove('show');
        };
        toggle();
        window.addEventListener('scroll', toggle, { passive: true });
        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* -------------------------------------------------------
       Reveal-on-scroll using IntersectionObserver
       ------------------------------------------------------- */
    function initReveal() {
        const els = document.querySelectorAll('.reveal');
        if (!els.length || !('IntersectionObserver' in window)) {
            els.forEach(el => el.classList.add('in-view'));
            return;
        }
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        els.forEach(el => io.observe(el));
    }

    /* -------------------------------------------------------
       Animate counters when they scroll into view
       ------------------------------------------------------- */
    function animateCounter(stat) {
        const targetString = stat.getAttribute('data-target') || '0';
        const target = parseFloat(targetString);
        if (Number.isNaN(target)) return;
        const hasDecimal = targetString.includes('.');
        const duration = 1400;
        const start = performance.now();
        function frame(now) {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            const value = target * eased;
            stat.innerText = hasDecimal ? value.toFixed(1) : Math.round(value).toLocaleString();
            if (t < 1) requestAnimationFrame(frame);
            else stat.innerText = hasDecimal ? target.toFixed(1) : Math.round(target).toLocaleString();
        }
        requestAnimationFrame(frame);
    }

    function initCounters() {
        const stats = document.querySelectorAll('.stat-num[data-target]');
        if (!stats.length) return;
        if (!('IntersectionObserver' in window)) {
            stats.forEach(animateCounter);
            return;
        }
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });
        stats.forEach(s => io.observe(s));
    }

    /* -------------------------------------------------------
       Active nav link based on current page
       ------------------------------------------------------- */
    function initActiveNav() {
        const path = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-links a').forEach(a => {
            const href = a.getAttribute('href');
            if (href === path || (path === '' && href === 'index.html')) {
                a.classList.add('active');
            }
        });
    }

    /* -------------------------------------------------------
       Contact form — submits to Formspree via fetch().
       Falls back to a mailto link if the endpoint isn't configured
       yet or the request fails.
       ------------------------------------------------------- */
    function initContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;
        const feedback = document.getElementById('contactFeedback');
        const submitBtn = document.getElementById('contactSubmit');

        function setFeedback(msg, ok) {
            if (!feedback) return;
            feedback.textContent = msg;
            feedback.classList.remove('error');
            if (!ok) feedback.classList.add('error');
            feedback.classList.add('show');
        }

        function mailtoFallback(name, email, message) {
            const subject = encodeURIComponent(`Site contact from ${name}`);
            const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
            window.location.href = `mailto:williamnewkirk2025@gmail.com?subject=${subject}&body=${body}`;
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = new FormData(form);
            const name = (data.get('name') || '').toString().trim();
            const email = (data.get('email') || '').toString().trim();
            const message = (data.get('message') || '').toString().trim();
            if (!name || !email || !message) {
                setFeedback('Please fill in every field before sending.', false);
                return;
            }

            const endpoint = form.getAttribute('action') || '';
            const configured = endpoint && !endpoint.includes('YOUR_FORM_ID');

            if (!configured) {
                setFeedback('Opening your email app as a fallback — the contact form isn\'t hooked up yet.', true);
                mailtoFallback(name, email, message);
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending…';
            }

            try {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: data
                });
                if (res.ok) {
                    setFeedback('Thanks — your message is on its way. I\'ll get back to you soon.', true);
                    form.reset();
                } else {
                    const payload = await res.json().catch(() => ({}));
                    const msg = (payload.errors && payload.errors[0] && payload.errors[0].message)
                        || 'Something went wrong. Opening your email app instead.';
                    setFeedback(msg, false);
                    mailtoFallback(name, email, message);
                }
            } catch (err) {
                setFeedback('Network error. Opening your email app instead.', false);
                mailtoFallback(name, email, message);
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send';
                }
            }
        });
    }

    /* -------------------------------------------------------
       Neural network canvas background
       ------------------------------------------------------- */
    function initCanvas() {
        const canvas = document.getElementById('neural-net');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let particles = [];
        const density = Math.min(80, Math.max(36, Math.floor((window.innerWidth * window.innerHeight) / 30000)));

        function size() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = window.innerWidth + 'px';
            canvas.style.height = window.innerHeight + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        class Particle {
            constructor() {
                this.x = Math.random() * window.innerWidth;
                this.y = Math.random() * window.innerHeight;
                this.vx = (Math.random() - 0.5) * 0.6;
                this.vy = (Math.random() - 0.5) * 0.6;
                this.size = Math.random() * 2 + 0.6;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > window.innerWidth) this.vx *= -1;
                if (this.y < 0 || this.y > window.innerHeight) this.vy *= -1;
            }
            draw(color) {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function init() {
            particles = [];
            for (let i = 0; i < density; i++) particles.push(new Particle());
        }

        function currentAccent() {
            const isLight = root.getAttribute('data-theme') === 'light';
            return {
                dot: isLight ? 'rgba(2, 132, 199, 0.55)' : 'rgba(56, 189, 248, 0.55)',
                line: isLight ? 'rgba(2, 132, 199, ' : 'rgba(56, 189, 248, '
            };
        }

        function tick() {
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            const accent = currentAccent();
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw(accent.dot);
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq < 150 * 150) {
                        const alpha = 0.12 - distSq / (150 * 150) * 0.12;
                        ctx.strokeStyle = accent.line + alpha + ')';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(tick);
        }

        size();
        init();
        tick();

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                size();
                init();
            }, 150);
        });
    }

    /* -------------------------------------------------------
       Init
       ------------------------------------------------------- */
    document.addEventListener('DOMContentLoaded', () => {
        initThemeToggle();
        initMobileNav();
        initActiveNav();
        initScrollProgress();
        initBackToTop();
        initReveal();
        initCounters();
        initContactForm();
        initCanvas();
    });
})();
