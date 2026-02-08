// ===== AgentFlow Landing Page - Interactive Animations =====

document.addEventListener('DOMContentLoaded', () => {
    initAnimationSequence();
    initButtonEffects();
});

// ===== Main Animation Sequence Orchestrator =====
function initAnimationSequence() {
    const sequence = [
        // Customer message arrives
        { time: 500, action: () => showMessage('msg1') },
        { time: 600, action: () => activateNode('node-trigger') },
        { time: 800, action: () => showBadge('stat-query') },

        // AI processing starts
        {
            time: 1200, action: () => {
                deactivateNode('node-trigger');
                activateNode('node-intent');
                activateLine('line-1');
            }
        },
        { time: 1400, action: () => showBadge('stat-confidence') },

        // Database query
        {
            time: 1800, action: () => {
                deactivateNode('node-intent');
                activateNode('node-database');
                activateLine('line-2');
            }
        },

        // Format response
        {
            time: 2200, action: () => {
                deactivateNode('node-database');
                activateNode('node-format');
                activateLine('line-3');
            }
        },

        // Send message
        {
            time: 2600, action: () => {
                deactivateNode('node-format');
                activateNode('node-send');
                activateLine('line-4');
            }
        },
        { time: 2800, action: () => showBadge('stat-response') },

        // AI response appears
        {
            time: 3000, action: () => {
                showMessage('msg2');
                deactivateNode('node-send');
                showBadge('stat-automated');
            }
        },

        // Hide first set of badges
        {
            time: 3500, action: () => {
                hideBadge('stat-query');
                hideBadge('stat-confidence');
            }
        },

        // Customer follow-up
        { time: 4000, action: () => showMessage('msg3') },
        { time: 4100, action: () => activateNode('node-trigger') },

        // Processing second message
        {
            time: 4500, action: () => {
                deactivateNode('node-trigger');
                activateNode('node-intent');
            }
        },

        {
            time: 4900, action: () => {
                deactivateNode('node-intent');
                activateNode('node-database');
            }
        },

        {
            time: 5300, action: () => {
                deactivateNode('node-database');
                activateNode('node-format');
            }
        },

        // Show typing indicator
        {
            time: 5500, action: () => {
                showTyping();
                deactivateNode('node-format');
                activateNode('node-send');
            }
        },

        // Final response
        {
            time: 7000, action: () => {
                hideTyping();
                showMessage('msg4');
                deactivateNode('node-send');
            }
        },

        // Hide remaining badges
        {
            time: 7500, action: () => {
                hideBadge('stat-response');
                hideBadge('stat-automated');
            }
        },

        // Reset and loop
        { time: 10000, action: () => resetSequence() }
    ];

    function runSequence() {
        sequence.forEach(step => {
            setTimeout(step.action, step.time);
        });
    }

    function resetSequence() {
        // Reset all messages
        ['msg1', 'msg2', 'msg3', 'msg4'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.animation = 'none';
            }
        });

        // Reset typing
        const typing = document.getElementById('typing');
        if (typing) typing.style.opacity = '0';

        // Reset all nodes
        document.querySelectorAll('.workflow-node').forEach(node => {
            node.classList.remove('active');
        });

        // Reset all lines
        document.querySelectorAll('.workflow-line-path').forEach(line => {
            line.classList.remove('active');
        });

        // Reset all badges
        document.querySelectorAll('.stat-badge').forEach(badge => {
            badge.classList.remove('show', 'hide');
            badge.style.opacity = '0';
        });

        // Restart sequence
        setTimeout(runSequence, 100);
    }

    // Start the sequence
    runSequence();
}

// ===== Animation Helper Functions =====
function showMessage(id) {
    const el = document.getElementById(id);
    if (el) {
        el.style.animation = 'messageAppear 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
    }
}

function showTyping() {
    const el = document.getElementById('typing');
    if (el) {
        el.style.opacity = '1';
        el.style.animation = 'messageAppear 0.3s ease forwards';
    }
}

function hideTyping() {
    const el = document.getElementById('typing');
    if (el) {
        el.style.opacity = '0';
    }
}

function activateNode(nodeId) {
    const node = document.getElementById(nodeId);
    if (node) {
        node.classList.add('active');
    }
}

function deactivateNode(nodeId) {
    const node = document.getElementById(nodeId);
    if (node) {
        node.classList.remove('active');
    }
}

function activateLine(lineId) {
    const line = document.getElementById(lineId);
    if (line) {
        line.classList.add('active');
        // Remove active class after animation
        setTimeout(() => line.classList.remove('active'), 800);
    }
}

function showBadge(badgeId) {
    const badge = document.getElementById(badgeId);
    if (badge) {
        badge.classList.remove('hide');
        badge.classList.add('show');
    }
}

function hideBadge(badgeId) {
    const badge = document.getElementById(badgeId);
    if (badge) {
        badge.classList.remove('show');
        badge.classList.add('hide');
    }
}

// ===== Button Micro-interactions =====
function initButtonEffects() {
    const ctaButton = document.querySelector('.cta-button');

    if (ctaButton) {
        // Ripple effect on click
        ctaButton.addEventListener('click', (e) => {
            const rect = ctaButton.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                width: 100px;
                height: 100px;
                background: rgba(255,255,255,0.3);
                border-radius: 50%;
                transform: translate(-50%, -50%) scale(0);
                animation: ripple 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
            `;

            ctaButton.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });

        // Add ripple animation to stylesheet
        if (!document.getElementById('ripple-animation')) {
            const style = document.createElement('style');
            style.id = 'ripple-animation';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: translate(-50%, -50%) scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// ===== How It Works Section - Scroll Animations =====
function initHowItWorks() {
    const steps = document.querySelectorAll('.how-step');

    // Intersection Observer for scroll-triggered animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Trigger typing animation for step 1
                if (entry.target.dataset.step === '1') {
                    setTimeout(() => typeText(), 500);
                }

                // Trigger counter animation for step 3
                if (entry.target.dataset.step === '3') {
                    setTimeout(() => animateCounter(), 1000);
                }
            }
        });
    }, {
        threshold: 0.3
    });

    steps.forEach(step => observer.observe(step));
}

// Typing animation for Step 1
function typeText() {
    const text = "Handle order tracking questions, process refunds automatically, and answer FAQs about shipping and returns";
    const typedElement = document.getElementById('typed-text');

    if (!typedElement || typedElement.textContent.length > 0) return;

    let index = 0;

    function type() {
        if (index < text.length) {
            typedElement.textContent += text.charAt(index);
            index++;
            setTimeout(type, 30 + Math.random() * 40); // Variable speed for realism
        }
    }

    type();
}

// Counter animation for Step 3
function animateCounter() {
    const counterElement = document.getElementById('live-counter');
    if (!counterElement) return;

    let count = 0;
    const target = 47;
    const duration = 2000;
    const increment = target / (duration / 16);

    function updateCounter() {
        count += increment;
        if (count < target) {
            counterElement.textContent = Math.floor(count);
            requestAnimationFrame(updateCounter);
        } else {
            counterElement.textContent = target;
        }
    }

    updateCounter();
}

// Initialize on load
if (document.querySelector('.how-it-works-section')) {
    initHowItWorks();
}

// ===== Smooth Scroll for any anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== Features Section - Tab Switching =====
function initFeatures() {
    const tabs = document.querySelectorAll('.feature-tab');
    const contents = document.querySelectorAll('.feature-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;

            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update active content with morph transition
            contents.forEach(content => {
                content.classList.remove('active');
                if (content.dataset.content === targetTab) {
                    setTimeout(() => content.classList.add('active'), 50);

                    // Trigger specific animations
                    if (targetTab === 'intelligent') {
                        initParticles();
                    } else if (targetTab === 'monitoring') {
                        animateMonitoringStats();
                        drawMonitoringChart();
                    }
                }
            });
        });
    });

    // Initialize first tab
    initParticles();
}

// Particle effect for intent detection
function initParticles() {
    const canvas = document.getElementById('intent-particles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = [];
    const queryElements = document.querySelectorAll('.intent-query');
    const resultElement = document.querySelector('.intent-result');

    if (!resultElement) return;

    // Create particles from queries to result
    queryElements.forEach((query, index) => {
        const rect = query.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        const resultRect = resultElement.getBoundingClientRect();

        setTimeout(() => {
            for (let i = 0; i < 3; i++) {
                particles.push({
                    x: rect.left - canvasRect.left + rect.width,
                    y: rect.top - canvasRect.top + rect.height / 2,
                    targetX: resultRect.left - canvasRect.left,
                    targetY: resultRect.top - canvasRect.top + resultRect.height / 2,
                    progress: 0,
                    speed: 0.02 + Math.random() * 0.01
                });
            }
        }, 800 + index * 200);
    });

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p, index) => {
            p.progress += p.speed;

            if (p.progress >= 1) {
                particles.splice(index, 1);
                return;
            }

            const x = p.x + (p.targetX - p.x) * p.progress;
            const y = p.y + (p.targetY - p.y) * p.progress;

            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 217, 255, ${1 - p.progress})`;
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }

    animate();
}

// Animate monitoring stats
function animateMonitoringStats() {
    const statElements = document.querySelectorAll('[data-monitor-value]');

    statElements.forEach(el => {
        const target = parseFloat(el.dataset.monitorValue);
        let current = 0;
        const increment = target / 60;

        function update() {
            current += increment;
            if (current < target) {
                el.textContent = target % 1 === 0 ? Math.floor(current) : current.toFixed(1);
                requestAnimationFrame(update);
            } else {
                el.textContent = target % 1 === 0 ? target : target.toFixed(1);
            }
        }

        update();
    });
}

// Draw monitoring chart
function drawMonitoringChart() {
    const canvas = document.getElementById('monitor-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Sample data
    const data = [20, 35, 30, 45, 40, 55, 50, 65, 60, 70];
    const max = Math.max(...data);

    ctx.clearRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = (height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    // Draw line chart
    ctx.beginPath();
    ctx.strokeStyle = '#00D9FF';
    ctx.lineWidth = 2;

    data.forEach((value, index) => {
        const x = (width / (data.length - 1)) * index;
        const y = height - (value / max) * height;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();

    // Draw gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(0, 217, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 217, 255, 0)');

    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
}

// Initialize features on load
if (document.querySelector('.features-section')) {
    initFeatures();
}

// ===== Final CTA - Floating Particles =====
function initCTAParticles() {
    const canvas = document.getElementById('cta-particles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 50;

    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5 + 0.2
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            // Update position
            p.x += p.speedX;
            p.y += p.speedY;

            // Wrap around edges
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            // Draw particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 217, 255, ${p.opacity})`;
            ctx.fill();
        });

        requestAnimationFrame(animate);
    }

    animate();

    // Resize handler
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Enhanced ripple effect for CTA button
function initCTAButton() {
    const button = document.getElementById('final-cta-btn');
    if (!button) return;

    button.addEventListener('click', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Create multiple ripples
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const ripple = document.createElement('span');
                ripple.style.cssText = `
                    position: absolute;
                    width: 150px;
                    height: 150px;
                    background: radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%);
                    border-radius: 50%;
                    transform: translate(-50%, -50%) scale(0);
                    animation: megaRipple 1s cubic-bezier(0.4, 0, 0.2, 1);
                    left: ${x}px;
                    top: ${y}px;
                    pointer-events: none;
                `;

                button.appendChild(ripple);

                setTimeout(() => ripple.remove(), 1000);
            }, i * 100);
        }
    });

    // Add mega ripple animation
    if (!document.getElementById('mega-ripple-animation')) {
        const style = document.createElement('style');
        style.id = 'mega-ripple-animation';
        style.textContent = `
            @keyframes megaRipple {
                to {
                    transform: translate(-50%, -50%) scale(5);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize CTA section
if (document.querySelector('.final-cta-section')) {
    initCTAParticles();
    initCTAButton();
}



