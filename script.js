(() => {
    'use strict';

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

    function initActiveNav() {
        const path = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-links a').forEach(a => {
            const href = a.getAttribute('href');
            if (href === path || (path === '' && href === 'index.html')) {
                a.setAttribute('aria-current', 'page');
            }
        });
    }

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
                setFeedback('Opening your email app — the form endpoint isn\'t configured yet.', true);
                mailtoFallback(name, email, message);
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending…';
            }

            try {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: data
                });
                if (res.ok) {
                    setFeedback('Thanks. I\'ll get back to you soon.', true);
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
                    submitBtn.textContent = 'Send';
                }
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        initMobileNav();
        initActiveNav();
        initContactForm();
    });
})();
