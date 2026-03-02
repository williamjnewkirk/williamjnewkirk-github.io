// Data from Resume
// (Legacy terminal effect - no longer used)
const resumeData = [
    {
        cmd: "cat current_role.txt",
        out: "Student-Athlete at Washington University in St. Louis (Class of '29). Joint BS in Business & Computer Science."
    },
    {
        cmd: "run experience --latest",
        out: ">> Bear Cubs Running Club: Volunteer (Sept 2025 - Present)\n>> El Pomar Institute: Web Design Intern (Summer 2023)\n>> Broadmoor Cog Railway: Ticket Agent (Summer 2023)"
    },
    {
        cmd: "check_skills",
        out: "['Java', 'Python', 'HTML/CSS', 'GitHub', 'Leadership', 'Entrepreneurship']"
    }
];

// --- 1. Terminal Typing Effect ---
const terminalContent = document.getElementById('terminal-content');
let lineIndex = 0;
let charIndex = 0;
let isTypingCmd = true;

function typeTerminal() {
    if (lineIndex >= resumeData.length) return;

    const currentLine = resumeData[lineIndex];
    const element = document.createElement('div');
    element.className = 'cmd-line';
    
    // Check if line already exists (for appending chars)
    let currentContainer = terminalContent.lastElementChild;
    if (!currentContainer || !currentContainer.classList.contains('active-line')) {
        currentContainer = document.createElement('div');
        currentContainer.className = 'cmd-line active-line';
        currentContainer.innerHTML = `<span class="prompt">william@washu:~$</span><span class="cmd-text"></span><span class="cursor">_</span>`;
        terminalContent.appendChild(currentContainer);
    }

    const cmdSpan = currentContainer.querySelector('.cmd-text');
    const cursor = currentContainer.querySelector('.cursor');

    if (isTypingCmd) {
        if (charIndex < currentLine.cmd.length) {
            cmdSpan.textContent += currentLine.cmd.charAt(charIndex);
            charIndex++;
            setTimeout(typeTerminal, 50 + Math.random() * 50); // Random typing speed
        } else {
            isTypingCmd = false;
            charIndex = 0;
            cursor.remove(); // Remove cursor from command line
            
            // Create output div
            const outputDiv = document.createElement('div');
            outputDiv.className = 'output';
            outputDiv.innerText = currentLine.out; // Use innerText to preserve newlines
            terminalContent.appendChild(outputDiv);
            
            currentContainer.classList.remove('active-line');
            lineIndex++;
            isTypingCmd = true;
            setTimeout(typeTerminal, 800); // Pause before next command
        }
    }
}

// Start typing when page loads
window.onload = () => {
    animateNumbers();
    // hamburger menu toggle
    const toggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    if(toggle && navLinks) {
        toggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
};

// --- 2. Number Counter Animation ---
function animateNumbers() {
    const stats = document.querySelectorAll('.stat-num');
    stats.forEach(stat => {
        const targetString = stat.getAttribute('data-target');
        const target = parseFloat(targetString);
        const hasDecimal = targetString.includes('.');
        let current = 0;
        const increment = target / 50; // Speed of count
        
        const updateCount = () => {
            if(current < target) {
                current += increment;
                if(hasDecimal) {
                    stat.innerText = current.toFixed(1);
                } else {
                    stat.innerText = Math.ceil(current);
                }
                requestAnimationFrame(updateCount);
            } else {
                if(hasDecimal) {
                    stat.innerText = target.toFixed(1);
                } else {
                    stat.innerText = target;
                }
            }
        };
        updateCount();
    });
}

// --- 3. Neural Network Canvas Background ---
const canvas = document.getElementById('neural-net');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];
const particleCount = 60; // Adjust for density

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 1; // Velocity X
        this.vy = (Math.random() - 0.5) * 1; // Velocity Y
        this.size = Math.random() * 3;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.5)'; // Blue dots
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        // Draw connections
        for (let j = i; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
                ctx.strokeStyle = `rgba(56, 189, 248, ${0.1 - distance/1500})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animateParticles);
}

// Handle resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

initParticles();
animateParticles();