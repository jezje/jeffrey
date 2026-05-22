document.addEventListener('DOMContentLoaded', () => {
    // ========== OPTIMISED CANVAS BACKGROUND ==========
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let w, h;

    const NODE_COUNT = 35;
    const MAX_DIST = 220;
    const PARTICLE_COUNT = 50;
    
    let nodes = [];
    let particles = [];
    let lightRays = [];

    function resizeCanvas() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        initNodes();
        initParticles();
        initLightRays();
    }

    function initNodes() {
        nodes = [];
        for (let i = 0; i < NODE_COUNT; i++) {
            nodes.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                radius: 2 + Math.random() * 2.5,
                phase: Math.random() * Math.PI * 2,
                speedPhase: 0.005 + Math.random() * 0.015,
                color: `hsl(${180 + Math.random() * 40}, 85%, 65%)`,
                glow: 6 + Math.random() * 10
            });
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                targetX: Math.random() * w,
                targetY: Math.random() * h,
                progress: Math.random(),
                speed: 0.003 + Math.random() * 0.008,
                size: 1 + Math.random() * 2,
                trail: []
            });
        }
    }

    function initLightRays() {
        lightRays = [];
        for (let i = 0; i < 8; i++) {
            lightRays.push({
                x: Math.random() * w,
                y: Math.random() * h,
                angle: Math.random() * Math.PI * 2,
                length: 70 + Math.random() * 120,
                speed: 0.004 + Math.random() * 0.01,
                offset: Math.random() * Math.PI * 2
            });
        }
    }

    function updateNodes() {
        for (let node of nodes) {
            node.x += node.vx;
            node.y += node.vy;
            if (node.x < 20) { node.x = 20; node.vx *= -0.97; }
            if (node.x > w - 20) { node.x = w - 20; node.vx *= -0.97; }
            if (node.y < 20) { node.y = 20; node.vy *= -0.97; }
            if (node.y > h - 20) { node.y = h - 20; node.vy *= -0.97; }
            
            if (Math.random() < 0.015) {
                node.vx += (Math.random() - 0.5) * 0.08;
                node.vy += (Math.random() - 0.5) * 0.08;
                let maxSpeed = 0.7;
                node.vx = Math.min(maxSpeed, Math.max(-maxSpeed, node.vx));
                node.vy = Math.min(maxSpeed, Math.max(-maxSpeed, node.vy));
            }
            node.phase += node.speedPhase;
        }
    }
    
    function updateParticles() {
        for (let p of particles) {
            if (p.progress >= 1) {
                let randNode = nodes[Math.floor(Math.random() * nodes.length)];
                p.targetX = randNode.x;
                p.targetY = randNode.y;
                let startNode = nodes[Math.floor(Math.random() * nodes.length)];
                p.x = startNode.x;
                p.y = startNode.y;
                p.progress = 0;
                p.speed = 0.003 + Math.random() * 0.008;
                p.trail = [];
            } else {
                p.progress += p.speed;
                let dx = p.targetX - p.x;
                let dy = p.targetY - p.y;
                p.trail.push({ x: p.x, y: p.y, alpha: 0.7 });
                if (p.trail.length > 6) p.trail.shift();
                p.x += dx * p.speed;
                p.y += dy * p.speed;
            }
        }
    }

    function updateLightRays() {
        for (let ray of lightRays) {
            ray.offset += ray.speed;
            let rad = ray.offset % (Math.PI * 2);
            let driftX = Math.sin(rad) * 8;
            let driftY = Math.cos(rad * 0.7) * 5;
            ray.x += driftX * 0.02;
            ray.y += driftY * 0.02;
            if (ray.x < -100) ray.x = w + 50;
            if (ray.x > w + 100) ray.x = -50;
            if (ray.y < -100) ray.y = h + 50;
            if (ray.y > h + 100) ray.y = -50;
        }
    }

    function draw() {
        if (!ctx) return;
        const grad = ctx.createLinearGradient(0, 0, w*0.6, h);
        grad.addColorStop(0, '#010518');
        grad.addColorStop(0.4, '#030b1f');
        grad.addColorStop(1, '#00020c');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        
        ctx.globalCompositeOperation = 'lighter';
        for (let node of nodes) {
            let radialGrd = ctx.createRadialGradient(node.x, node.y, 2, node.x, node.y, node.glow);
            radialGrd.addColorStop(0, `rgba(0, 200, 255, 0.12)`);
            radialGrd.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = radialGrd;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.glow, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
        
        for (let ray of lightRays) {
            ctx.beginPath();
            let endX = ray.x + Math.cos(ray.angle) * ray.length;
            let endY = ray.y + Math.sin(ray.angle) * ray.length;
            ctx.moveTo(ray.x, ray.y);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = `rgba(0, 180, 255, 0.1)`;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 4;
            ctx.shadowColor = '#0af';
            ctx.stroke();
        }
        ctx.shadowBlur = 0;
        
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i+1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < MAX_DIST) {
                    const opacity = 0.18 * (1 - dist / MAX_DIST);
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.strokeStyle = `rgba(0, 224, 255, ${opacity + 0.06})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
        
        for (let p of particles) {
            for (let i = 0; i < p.trail.length; i++) {
                let t = p.trail[i];
                let life = i / p.trail.length;
                ctx.beginPath();
                ctx.arc(t.x, t.y, p.size * 0.4 * life, 0, Math.PI*2);
                ctx.fillStyle = `rgba(255, 80, 200, ${0.25 * life})`;
                ctx.fill();
            }
        }
        
        for (let p of particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 0.6, 0, Math.PI*2);
            ctx.fillStyle = `rgba(255, 150, 240, 0.8)`;
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#ff66cc';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 0.3, 0, Math.PI*2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        }
        
        for (let node of nodes) {
            const pulse = 0.7 + 0.3 * Math.sin(node.phase * 1.5);
            const rad = node.radius * pulse;
            ctx.beginPath();
            ctx.arc(node.x, node.y, rad, 0, Math.PI*2);
            ctx.fillStyle = node.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00ffff';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(node.x, node.y, rad * 0.5, 0, Math.PI*2);
            ctx.fillStyle = 'white';
            ctx.fill();
        }
        ctx.shadowBlur = 0;
    }
    
    function animate() {
        if (!w || !h) return;
        updateNodes();
        updateParticles();
        updateLightRays();
        draw();
        requestAnimationFrame(animate);
    }
    
    window.addEventListener('resize', () => {
        resizeCanvas();
    });
    resizeCanvas();
    animate();

    // ========== INTERACTIONS ==========
    const nameStr = "Jeffrey";
    document.getElementById("logo-name").textContent = nameStr;
    document.getElementById("footer-name").textContent = `© 2026 ${nameStr} | Network Support Technician`;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => e.isIntersecting && e.target.classList.add("active"));
    }, { threshold: 0.2 });
    document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

    const typeTarget = document.getElementById("typewriterTarget");
    if (typeTarget && !typeTarget.dataset.typed) {
        const original = typeTarget.innerText;
        typeTarget.innerText = "";
        let idx = 0;
        function type() {
            if (idx < original.length) {
                typeTarget.innerText += original[idx];
                idx++;
                setTimeout(type, 35);
            } else typeTarget.dataset.typed = "true";
        }
        type();
    }

    const toggle = document.getElementById("navToggleBtn");
    const navMenu = document.getElementById("mainNav");
    if (toggle && navMenu) {
        toggle.addEventListener("click", () => {
            navMenu.classList.toggle("active");
            const icon = toggle.querySelector("i");
            if (icon) icon.className = navMenu.classList.contains("active") ? "bx bx-x" : "bx bx-menu";
        });
        navMenu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("active");
                if (toggle.querySelector("i")) toggle.querySelector("i").className = "bx bx-menu";
            });
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function(e) {
            const targetId = this.getAttribute("href");
            if (targetId === "#") return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });

    // Image enlarge modal
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    function openModal(src) {
        modal.style.display = 'flex';
        modalImg.src = src;
    }
    modal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    const clickableImages = [
        document.getElementById('mainPortraitImg'),
        document.getElementById('smallAvatarImg'),
        document.getElementById('certBadgeImg')
    ];
    clickableImages.forEach(img => {
        if (img) {
            img.style.cursor = 'pointer';
            img.addEventListener('click', () => openModal(img.src));
        }
    });
});