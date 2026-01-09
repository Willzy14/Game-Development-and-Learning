/**
 * Lantern Spirit - Theme Module
 * 
 * Rich painterly visuals for a mystical twilight swamp
 * Inspired by Art Study 007 (Forest Temple) - layered atmospheric depth
 * 
 * Visual Philosophy:
 * - Warm lantern glow vs cool twilight blues (temperature contrast)
 * - Multiple parallax layers for depth
 * - Painterly brush strokes on all elements
 * - Atmospheric particles (fireflies, motes, mist)
 * - Soft edges, no hard outlines
 */

const Theme = {
    // Color palette - twilight swamp with warm lantern accent
    colors: {
        // Sky gradient (top to bottom)
        skyTop: '#1a1a2e',        // Deep night purple
        skyMid: '#16213e',        // Dark blue
        skyBottom: '#0f3460',     // Twilight blue
        
        // Far background
        farMountain: '#1a1a3a',   // Silhouette purple
        midMountain: '#252552',   // Closer purple
        
        // Swamp colors
        waterDeep: '#0a2a3a',     // Dark swamp water
        waterMid: '#0d3d4d',      // Mid water
        waterSurface: '#1a5f6a',  // Surface reflection
        
        // Foliage
        treesDark: '#1a3322',     // Far trees
        treesMid: '#2a4a35',      // Mid trees
        treesNear: '#3a5a45',     // Near trees
        
        // Ground/platforms
        groundDark: '#2a2a1a',    // Deep earth
        groundMid: '#3d3d2a',     // Mid earth
        groundLight: '#4a4a35',   // Surface earth
        moss: '#4a6a45',          // Mossy green
        mossHighlight: '#5a8a55', // Bright moss
        
        // Lantern glow (warm spectrum)
        lanternCore: '#fff8e7',   // White-yellow core
        lanternInner: '#ffcc66',  // Golden inner
        lanternMid: '#ff9933',    // Orange mid
        lanternOuter: '#ff6600',  // Deep orange outer
        lanternFade: '#cc3300',   // Red fade
        
        // Spirit/Player
        spiritCore: '#e8f4f8',    // Pale blue-white
        spiritGlow: '#b8d4e3',    // Soft blue
        spiritTrail: '#6a9ab8',   // Trail blue
        
        // Wisps
        wispCore: '#aaffee',      // Cyan-white
        wispGlow: '#66ddcc',      // Teal glow
        wispOuter: '#44aa99',     // Deep teal
        
        // UI
        textLight: '#e8e8e8',
        textDark: '#aaaaaa',
        uiGlow: '#ffcc66'
    },
    
    // Parallax layer speeds
    parallax: {
        stars: 0.02,
        farMountains: 0.05,
        midMountains: 0.1,
        farTrees: 0.2,
        midTrees: 0.4,
        nearTrees: 0.6,
        mist: 0.15
    },
    
    // Cached canvas elements for performance
    cache: {
        stars: null,
        farMountains: null,
        midMountains: null,
        trees: null
    },
    
    // Particle systems
    particles: {
        fireflies: [],
        motes: [],
        mist: []
    },
    
    time: 0,
    
    /**
     * Initialize theme - create cached background layers
     */
    init(ctx, width, height) {
        this.ctx = ctx;
        this.width = width;
        this.height = height;
        
        this._createStarLayer();
        this._createMountainLayers();
        this._initParticles();
    },
    
    /**
     * Create star field layer (cached)
     */
    _createStarLayer() {
        const cache = document.createElement('canvas');
        cache.width = this.width * 2;
        cache.height = this.height;
        const ctx = cache.getContext('2d');
        
        // Stars with varying brightness and sizes
        for (let i = 0; i < 150; i++) {
            const x = Math.random() * cache.width;
            const y = Math.random() * (this.height * 0.6);
            const size = Math.random() * 2 + 0.5;
            const brightness = Math.random() * 0.5 + 0.3;
            
            // Star glow
            const grd = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
            grd.addColorStop(0, `rgba(255, 255, 255, ${brightness})`);
            grd.addColorStop(0.3, `rgba(200, 220, 255, ${brightness * 0.5})`);
            grd.addColorStop(1, 'rgba(200, 220, 255, 0)');
            
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(x, y, size * 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        this.cache.stars = cache;
    },
    
    /**
     * Create mountain silhouette layers (cached)
     */
    _createMountainLayers() {
        // Far mountains
        const far = document.createElement('canvas');
        far.width = this.width * 3;
        far.height = this.height;
        this._paintMountainRange(far.getContext('2d'), this.colors.farMountain, 0.3, 0.5, far.width);
        this.cache.farMountains = far;
        
        // Mid mountains  
        const mid = document.createElement('canvas');
        mid.width = this.width * 3;
        mid.height = this.height;
        this._paintMountainRange(mid.getContext('2d'), this.colors.midMountain, 0.4, 0.55, mid.width);
        this.cache.midMountains = mid;
    },
    
    /**
     * Paint a mountain range with painterly strokes
     */
    _paintMountainRange(ctx, color, minHeight, maxHeight, width) {
        const baseY = this.height * 0.5;
        
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, this.height);
        
        // Generate mountain peaks using noise-like variation
        let x = 0;
        while (x < width) {
            const peakHeight = this.height * (minHeight + Math.random() * (maxHeight - minHeight));
            const peakWidth = 80 + Math.random() * 120;
            
            // Rising edge with brush variation
            for (let i = 0; i < peakWidth / 2; i += 3) {
                const progress = i / (peakWidth / 2);
                const y = baseY - (peakHeight * progress) + (Math.random() - 0.5) * 8;
                ctx.lineTo(x + i, y);
            }
            
            // Peak
            ctx.lineTo(x + peakWidth / 2, baseY - peakHeight + (Math.random() - 0.5) * 5);
            
            // Falling edge
            for (let i = peakWidth / 2; i < peakWidth; i += 3) {
                const progress = 1 - (i - peakWidth / 2) / (peakWidth / 2);
                const y = baseY - (peakHeight * progress) + (Math.random() - 0.5) * 8;
                ctx.lineTo(x + i, y);
            }
            
            x += peakWidth * 0.7;
        }
        
        ctx.lineTo(width, this.height);
        ctx.closePath();
        ctx.fill();
        
        // Add subtle texture highlights
        ctx.globalAlpha = 0.1;
        for (let i = 0; i < 30; i++) {
            const hx = Math.random() * width;
            const hy = baseY - Math.random() * (this.height * maxHeight);
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(hx, hy, Math.random() * 15 + 5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    },
    
    /**
     * Initialize particle systems
     */
    _initParticles() {
        // Fireflies
        for (let i = 0; i < 25; i++) {
            this.particles.fireflies.push({
                x: Math.random() * this.width * 3,
                y: this.height * 0.3 + Math.random() * (this.height * 0.5),
                baseX: 0,
                baseY: 0,
                phase: Math.random() * Math.PI * 2,
                speed: 0.02 + Math.random() * 0.03,
                radius: Math.random() * 30 + 20,
                brightness: Math.random() * 0.5 + 0.5,
                pulseSpeed: 0.05 + Math.random() * 0.05
            });
        }
        
        // Dust motes
        for (let i = 0; i < 40; i++) {
            this.particles.motes.push({
                x: Math.random() * this.width * 3,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 1,
                speed: 0.2 + Math.random() * 0.3,
                drift: Math.random() * 0.5 - 0.25,
                alpha: Math.random() * 0.3 + 0.1
            });
        }
        
        // Mist patches
        for (let i = 0; i < 15; i++) {
            this.particles.mist.push({
                x: Math.random() * this.width * 3,
                y: this.height * 0.6 + Math.random() * (this.height * 0.3),
                width: 100 + Math.random() * 150,
                height: 30 + Math.random() * 50,
                speed: 0.1 + Math.random() * 0.2,
                alpha: Math.random() * 0.15 + 0.05
            });
        }
    },
    
    /**
     * Main render function - draws everything
     */
    render(gameState) {
        const ctx = this.ctx;
        this.time += 0.016; // ~60fps
        
        const camera = { x: gameState.cameraX || 0, y: 0 };
        
        // Clear and draw sky
        this._drawSky(ctx);
        
        // Draw cached background layers with parallax
        this._drawStars(ctx, camera);
        this._drawMountains(ctx, camera);
        
        // Draw atmospheric elements
        this._drawMist(ctx, camera);
        this._drawFireflies(ctx, camera);
        this._drawMotes(ctx, camera);
        
        // Draw tree silhouettes
        this._drawTrees(ctx, camera);
        
        // Draw game elements
        this._drawPlatforms(ctx, gameState.platforms, camera);
        this._drawWisps(ctx, gameState.collectibles, camera);
        this._drawPlayer(ctx, gameState.player, camera);
        
        // Draw foreground mist
        this._drawForegroundMist(ctx, camera);
        
        // Draw UI
        this._drawUI(ctx, gameState);
    },
    
    /**
     * Draw gradient sky
     */
    _drawSky(ctx) {
        const grd = ctx.createLinearGradient(0, 0, 0, this.height);
        grd.addColorStop(0, this.colors.skyTop);
        grd.addColorStop(0.4, this.colors.skyMid);
        grd.addColorStop(1, this.colors.skyBottom);
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Add subtle aurora effect
        ctx.globalAlpha = 0.03;
        const auroraGrd = ctx.createLinearGradient(0, 0, this.width, this.height * 0.4);
        auroraGrd.addColorStop(0, '#44aa88');
        auroraGrd.addColorStop(0.5, '#6688aa');
        auroraGrd.addColorStop(1, '#8866aa');
        ctx.fillStyle = auroraGrd;
        ctx.fillRect(0, 0, this.width, this.height * 0.4);
        ctx.globalAlpha = 1;
    },
    
    /**
     * Draw star field with parallax
     */
    _drawStars(ctx, camera) {
        if (!this.cache.stars) return;
        
        const offsetX = (camera.x * this.parallax.stars) % this.width;
        ctx.globalAlpha = 0.8 + Math.sin(this.time * 0.5) * 0.2;
        ctx.drawImage(this.cache.stars, -offsetX, 0);
        ctx.globalAlpha = 1;
    },
    
    /**
     * Draw mountain layers with parallax
     */
    _drawMountains(ctx, camera) {
        // Far mountains
        if (this.cache.farMountains) {
            const farOffset = (camera.x * this.parallax.farMountains) % this.width;
            ctx.drawImage(this.cache.farMountains, -farOffset, 0);
        }
        
        // Mid mountains
        if (this.cache.midMountains) {
            const midOffset = (camera.x * this.parallax.midMountains) % this.width;
            ctx.drawImage(this.cache.midMountains, -midOffset, 0);
        }
    },
    
    /**
     * Draw tree silhouettes at different depths
     */
    _drawTrees(ctx, camera) {
        const layers = [
            { color: this.colors.treesDark, parallax: this.parallax.farTrees, count: 12, minY: 0.50, maxY: 0.58, scale: 0.35 },
            { color: this.colors.treesMid, parallax: this.parallax.midTrees, count: 10, minY: 0.55, maxY: 0.62, scale: 0.45 },
            { color: this.colors.treesNear, parallax: this.parallax.nearTrees, count: 6, minY: 0.60, maxY: 0.68, scale: 0.55 }
        ];
        
        layers.forEach(layer => {
            // Use seeded random for consistent trees
            const seed = layer.parallax * 1000;
            const rand = (i) => {
                const x = Math.sin(seed + i * 12.9898) * 43758.5453;
                return x - Math.floor(x);
            };
            
            for (let i = 0; i < layer.count; i++) {
                const baseX = rand(i) * this.width * 2;
                const x = baseX - (camera.x * layer.parallax) % (this.width * 2);
                const y = this.height * (layer.minY + rand(i + 100) * (layer.maxY - layer.minY));
                const height = (80 + rand(i + 200) * 60) * layer.scale;
                const width = (30 + rand(i + 300) * 20) * layer.scale;
                
                this._drawTree(ctx, x, y, width, height, layer.color, layer.scale);
            }
        });
    },
    
    /**
     * Draw a single tree silhouette with painterly style
     */
    _drawTree(ctx, x, y, width, height, color, scale) {
        ctx.fillStyle = color;
        
        // Trunk
        const trunkWidth = width * 0.3;
        const trunkHeight = height * 0.4;
        ctx.fillRect(x - trunkWidth / 2, y, trunkWidth, trunkHeight);
        
        // Foliage - multiple organic circles
        const foliageY = y - height * 0.1;
        const layers = 4;
        
        for (let i = 0; i < layers; i++) {
            const layerY = foliageY - (height * 0.15 * i);
            const layerWidth = width * (1 - i * 0.15);
            const segments = 5 - i;
            
            for (let j = 0; j < segments; j++) {
                const angle = (j / segments) * Math.PI - Math.PI / 2;
                const cx = x + Math.cos(angle) * layerWidth * 0.4;
                const cy = layerY + Math.sin(angle) * layerWidth * 0.2;
                const r = layerWidth * (0.3 + Math.random() * 0.1);
                
                ctx.beginPath();
                ctx.arc(cx, cy, r, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Top point
        ctx.beginPath();
        ctx.arc(x, foliageY - height * 0.5, width * 0.2, 0, Math.PI * 2);
        ctx.fill();
    },
    
    /**
     * Draw mist patches
     */
    _drawMist(ctx, camera) {
        this.particles.mist.forEach(m => {
            m.x += m.speed;
            if (m.x > this.width * 3) m.x = -m.width;
            
            const screenX = m.x - camera.x * this.parallax.mist;
            
            // Draw misty ellipse
            const grd = ctx.createRadialGradient(
                screenX + m.width / 2, m.y,
                0,
                screenX + m.width / 2, m.y,
                m.width / 2
            );
            grd.addColorStop(0, `rgba(180, 200, 220, ${m.alpha})`);
            grd.addColorStop(1, 'rgba(180, 200, 220, 0)');
            
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.ellipse(screenX + m.width / 2, m.y, m.width / 2, m.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();
        });
    },
    
    /**
     * Draw fireflies with glow
     */
    _drawFireflies(ctx, camera) {
        this.particles.fireflies.forEach(f => {
            f.phase += f.speed;
            
            // Orbit around base position
            const orbitX = Math.cos(f.phase) * f.radius;
            const orbitY = Math.sin(f.phase * 0.7) * f.radius * 0.5;
            
            f.baseX += 0.1;
            if (f.baseX > this.width * 3) f.baseX = 0;
            
            const screenX = f.baseX + orbitX - camera.x * 0.3;
            const screenY = f.y + orbitY;
            
            // Pulsing brightness
            const pulse = 0.5 + Math.sin(this.time * f.pulseSpeed * 10) * 0.5;
            const alpha = f.brightness * pulse;
            
            // Outer glow
            const grd = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, 15);
            grd.addColorStop(0, `rgba(255, 240, 150, ${alpha})`);
            grd.addColorStop(0.3, `rgba(255, 200, 100, ${alpha * 0.5})`);
            grd.addColorStop(1, 'rgba(255, 150, 50, 0)');
            
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(screenX, screenY, 15, 0, Math.PI * 2);
            ctx.fill();
            
            // Core
            ctx.fillStyle = `rgba(255, 255, 200, ${alpha})`;
            ctx.beginPath();
            ctx.arc(screenX, screenY, 2, 0, Math.PI * 2);
            ctx.fill();
        });
    },
    
    /**
     * Draw floating dust motes
     */
    _drawMotes(ctx, camera) {
        this.particles.motes.forEach(m => {
            m.x += m.speed;
            m.y += m.drift + Math.sin(this.time + m.x * 0.01) * 0.3;
            
            if (m.x > this.width * 3) m.x = 0;
            if (m.y < 0) m.y = this.height;
            if (m.y > this.height) m.y = 0;
            
            const screenX = m.x - camera.x * 0.25;
            
            ctx.fillStyle = `rgba(255, 255, 255, ${m.alpha})`;
            ctx.beginPath();
            ctx.arc(screenX, m.y, m.size, 0, Math.PI * 2);
            ctx.fill();
        });
    },
    
    /**
     * Draw foreground mist layer
     */
    _drawForegroundMist(ctx, camera) {
        const time = this.time * 0.3;
        ctx.globalAlpha = 0.15;
        
        for (let i = 0; i < 3; i++) {
            const x = (Math.sin(time + i) * 50) - camera.x * 0.05;
            const y = this.height - 80 + i * 20;
            
            const grd = ctx.createLinearGradient(0, y - 40, 0, y + 40);
            grd.addColorStop(0, 'rgba(150, 180, 200, 0)');
            grd.addColorStop(0.5, 'rgba(150, 180, 200, 1)');
            grd.addColorStop(1, 'rgba(150, 180, 200, 0)');
            
            ctx.fillStyle = grd;
            ctx.fillRect(0, y - 40, this.width, 80);
        }
        ctx.globalAlpha = 1;
    },
    
    /**
     * Draw platforms with mossy, earthy painterly style
     */
    _drawPlatforms(ctx, platforms, camera) {
        if (!platforms) return;
        
        platforms.forEach(platform => {
            const x = platform.x - camera.x;
            const y = platform.y;
            const w = platform.width;
            const h = platform.height;
            
            // Skip if off screen
            if (x + w < -50 || x > this.width + 50) return;
            
            // Main platform body - earthy gradient
            const bodyGrd = ctx.createLinearGradient(x, y, x, y + h);
            bodyGrd.addColorStop(0, this.colors.groundLight);
            bodyGrd.addColorStop(0.3, this.colors.groundMid);
            bodyGrd.addColorStop(1, this.colors.groundDark);
            
            // Draw with rounded corners for organic feel
            ctx.fillStyle = bodyGrd;
            this._roundRect(ctx, x, y, w, h, 8);
            ctx.fill();
            
            // Moss layer on top
            ctx.fillStyle = this.colors.moss;
            this._roundRect(ctx, x + 2, y - 1, w - 4, 6, 3);
            ctx.fill();
            
            // Moss highlights (painterly strokes) - smaller and subtler
            ctx.fillStyle = this.colors.mossHighlight;
            for (let i = 0; i < w / 25; i++) {
                const mx = x + 8 + i * 25 + (Math.random() - 0.5) * 6;
                const my = y + (Math.random() - 0.5) * 2;
                const mw = 4 + Math.random() * 3;
                const mh = 2 + Math.random() * 1.5;
                
                ctx.beginPath();
                ctx.ellipse(mx, my, mw, mh, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Texture details - cracks and shadows
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.lineWidth = 1;
            for (let i = 0; i < w / 40; i++) {
                const cx = x + 20 + i * 40 + Math.random() * 20;
                ctx.beginPath();
                ctx.moveTo(cx, y + 10);
                ctx.lineTo(cx + (Math.random() - 0.5) * 10, y + h - 5);
                ctx.stroke();
            }
            
            // Hanging vines/roots on some platforms
            if (platform.width > 100 && Math.sin(platform.x) > 0.3) {
                ctx.strokeStyle = this.colors.treesMid;
                ctx.lineWidth = 2;
                for (let i = 0; i < 3; i++) {
                    const vx = x + 20 + i * (w / 4);
                    const vLength = 15 + Math.random() * 20;
                    ctx.beginPath();
                    ctx.moveTo(vx, y + h);
                    ctx.quadraticCurveTo(
                        vx + (Math.random() - 0.5) * 10,
                        y + h + vLength / 2,
                        vx + (Math.random() - 0.5) * 5,
                        y + h + vLength
                    );
                    ctx.stroke();
                }
            }
            
            // Subtle glow underneath from world light
            ctx.globalAlpha = 0.1;
            const underGlow = ctx.createLinearGradient(x, y + h, x, y + h + 30);
            underGlow.addColorStop(0, this.colors.lanternMid);
            underGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = underGlow;
            ctx.fillRect(x, y + h, w, 30);
            ctx.globalAlpha = 1;
        });
    },
    
    /**
     * Draw helper - rounded rectangle path
     */
    _roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    },
    
    /**
     * Draw collectible wisps with ethereal glow
     */
    _drawWisps(ctx, wisps, camera) {
        if (!wisps) return;
        
        wisps.forEach(wisp => {
            if (wisp.collected) return;
            
            const x = wisp.x - camera.x;
            const y = wisp.y + Math.sin(this.time * 2 + wisp.x * 0.1) * 5;
            
            // Skip if off screen
            if (x < -30 || x > this.width + 30) return;
            
            // Outer glow pulse
            const pulse = 0.7 + Math.sin(this.time * 3 + wisp.x) * 0.3;
            
            // Large outer glow
            const outerGrd = ctx.createRadialGradient(x, y, 0, x, y, 25);
            outerGrd.addColorStop(0, `rgba(102, 221, 204, ${0.3 * pulse})`);
            outerGrd.addColorStop(0.5, `rgba(68, 170, 153, ${0.15 * pulse})`);
            outerGrd.addColorStop(1, 'rgba(68, 170, 153, 0)');
            ctx.fillStyle = outerGrd;
            ctx.beginPath();
            ctx.arc(x, y, 25, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner glow
            const innerGrd = ctx.createRadialGradient(x, y, 0, x, y, 12);
            innerGrd.addColorStop(0, this.colors.wispCore);
            innerGrd.addColorStop(0.4, this.colors.wispGlow);
            innerGrd.addColorStop(1, 'rgba(102, 221, 204, 0)');
            ctx.fillStyle = innerGrd;
            ctx.beginPath();
            ctx.arc(x, y, 12, 0, Math.PI * 2);
            ctx.fill();
            
            // Bright core
            ctx.fillStyle = this.colors.wispCore;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
            
            // Orbiting sparkles
            for (let i = 0; i < 3; i++) {
                const angle = this.time * 2 + (i * Math.PI * 2 / 3) + wisp.x;
                const dist = 10 + Math.sin(this.time * 4 + i) * 3;
                const sx = x + Math.cos(angle) * dist;
                const sy = y + Math.sin(angle) * dist * 0.6;
                
                ctx.fillStyle = `rgba(170, 255, 238, ${0.5 + Math.sin(this.time * 5 + i) * 0.3})`;
                ctx.beginPath();
                ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    },
    
    /**
     * Draw the spirit player with lantern
     */
    _drawPlayer(ctx, player, camera) {
        if (!player) return;
        
        const x = player.x - camera.x;
        const y = player.y;
        const w = player.width;
        const h = player.height;
        
        // Calculate direction for lantern position - use facingRight from state or fallback to vx
        const facingRight = player.facingRight !== undefined ? player.facingRight : (player.vx >= 0);
        const lanternOffsetX = facingRight ? w * 0.7 : w * 0.3;
        const lanternY = y + h * 0.3;
        const lanternX = x + lanternOffsetX;
        
        // Draw lantern glow FIRST (behind player)
        this._drawLanternGlow(ctx, lanternX, lanternY);
        
        // Spirit trail when moving
        if (Math.abs(player.vx || 0) > 0.5 || (player.vy || 0) < -1) {
            this._drawSpiritTrail(ctx, x, y, w, h, player);
        }
        
        // Spirit body - ethereal form
        const bodyGrd = ctx.createRadialGradient(
            x + w / 2, y + h * 0.4,
            0,
            x + w / 2, y + h * 0.4,
            w
        );
        bodyGrd.addColorStop(0, this.colors.spiritCore);
        bodyGrd.addColorStop(0.3, this.colors.spiritGlow);
        bodyGrd.addColorStop(0.7, `rgba(106, 154, 184, 0.3)`);
        bodyGrd.addColorStop(1, 'transparent');
        
        ctx.fillStyle = bodyGrd;
        ctx.beginPath();
        
        // Organic spirit shape - wider at bottom, narrower at top
        const headY = y + h * 0.2;
        const bodyMidY = y + h * 0.5;
        const tailY = y + h * 0.9;
        
        // Head
        ctx.ellipse(x + w / 2, headY, w * 0.35, h * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Body
        ctx.beginPath();
        ctx.moveTo(x + w * 0.2, headY);
        ctx.quadraticCurveTo(x, bodyMidY, x + w * 0.15, tailY);
        ctx.lineTo(x + w * 0.85, tailY);
        ctx.quadraticCurveTo(x + w, bodyMidY, x + w * 0.8, headY);
        ctx.closePath();
        ctx.fill();
        
        // Wispy tail extensions
        const tailWave = Math.sin(this.time * 4) * 5;
        ctx.strokeStyle = `rgba(184, 212, 227, 0.4)`;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        
        for (let i = 0; i < 3; i++) {
            const tx = x + w * (0.3 + i * 0.2);
            ctx.beginPath();
            ctx.moveTo(tx, tailY);
            ctx.quadraticCurveTo(
                tx + tailWave * (i - 1),
                tailY + 10,
                tx + tailWave * (i - 1) * 1.5,
                tailY + 15 + Math.random() * 5
            );
            ctx.stroke();
        }
        
        // Eyes - gentle glow
        const eyeY = headY;
        const eyeSpacing = w * 0.15;
        const eyeX = x + w / 2;
        
        // Eye glow
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.ellipse(eyeX - eyeSpacing, eyeY, 4, 5, 0, 0, Math.PI * 2);
        ctx.ellipse(eyeX + eyeSpacing, eyeY, 4, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye pupils (looking in movement direction)
        const pupilOffset = facingRight ? 1 : -1;
        ctx.fillStyle = '#1a3a4a';
        ctx.beginPath();
        ctx.arc(eyeX - eyeSpacing + pupilOffset, eyeY, 2, 0, Math.PI * 2);
        ctx.arc(eyeX + eyeSpacing + pupilOffset, eyeY, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw lantern (in front)
        this._drawLantern(ctx, lanternX, lanternY, facingRight);
    },
    
    /**
     * Draw the lantern glow effect
     */
    _drawLanternGlow(ctx, x, y) {
        const pulse = 0.85 + Math.sin(this.time * 3) * 0.15;
        const flicker = 1 + (Math.random() - 0.5) * 0.1;
        const intensity = pulse * flicker;
        
        // Very large ambient glow
        const glow1 = ctx.createRadialGradient(x, y, 0, x, y, 200);
        glow1.addColorStop(0, `rgba(255, 150, 50, ${0.15 * intensity})`);
        glow1.addColorStop(0.3, `rgba(255, 100, 30, ${0.08 * intensity})`);
        glow1.addColorStop(1, 'rgba(255, 80, 20, 0)');
        ctx.fillStyle = glow1;
        ctx.beginPath();
        ctx.arc(x, y, 200, 0, Math.PI * 2);
        ctx.fill();
        
        // Medium warm glow
        const glow2 = ctx.createRadialGradient(x, y, 0, x, y, 80);
        glow2.addColorStop(0, `rgba(255, 200, 100, ${0.3 * intensity})`);
        glow2.addColorStop(0.5, `rgba(255, 150, 60, ${0.15 * intensity})`);
        glow2.addColorStop(1, 'rgba(255, 100, 30, 0)');
        ctx.fillStyle = glow2;
        ctx.beginPath();
        ctx.arc(x, y, 80, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner bright glow
        const glow3 = ctx.createRadialGradient(x, y, 0, x, y, 30);
        glow3.addColorStop(0, `rgba(255, 240, 200, ${0.6 * intensity})`);
        glow3.addColorStop(0.5, `rgba(255, 200, 100, ${0.3 * intensity})`);
        glow3.addColorStop(1, 'rgba(255, 150, 50, 0)');
        ctx.fillStyle = glow3;
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.fill();
    },
    
    /**
     * Draw the lantern object
     */
    _drawLantern(ctx, x, y, facingRight) {
        const flip = facingRight ? 1 : -1;
        
        // Handle
        ctx.strokeStyle = '#8b7355';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y - 12, 6, Math.PI, 0, false);
        ctx.stroke();
        
        // Lantern frame
        ctx.fillStyle = '#5a4a3a';
        ctx.fillRect(x - 6, y - 8, 12, 16);
        
        // Glass/glow area
        const glassGrd = ctx.createRadialGradient(x, y, 0, x, y, 8);
        glassGrd.addColorStop(0, this.colors.lanternCore);
        glassGrd.addColorStop(0.3, this.colors.lanternInner);
        glassGrd.addColorStop(0.7, this.colors.lanternMid);
        glassGrd.addColorStop(1, this.colors.lanternOuter);
        ctx.fillStyle = glassGrd;
        ctx.fillRect(x - 4, y - 6, 8, 12);
        
        // Frame details
        ctx.strokeStyle = '#4a3a2a';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 6, y - 8, 12, 16);
        
        // Top and bottom caps
        ctx.fillStyle = '#6b5b4b';
        ctx.fillRect(x - 7, y - 9, 14, 3);
        ctx.fillRect(x - 7, y + 6, 14, 3);
    },
    
    /**
     * Draw spirit trail effect
     */
    _drawSpiritTrail(ctx, x, y, w, h, player) {
        const trailCount = 5;
        const vx = player.vx || 0;
        const vy = player.vy || 0;
        
        for (let i = 0; i < trailCount; i++) {
            const delay = (i + 1) * 0.15;
            const alpha = (1 - (i / trailCount)) * 0.3;
            const offsetX = -vx * delay * 3;
            const offsetY = -vy * delay * 2;
            const scale = 1 - (i * 0.1);
            
            ctx.fillStyle = `rgba(106, 154, 184, ${alpha})`;
            ctx.beginPath();
            ctx.ellipse(
                x + w / 2 + offsetX,
                y + h * 0.4 + offsetY,
                w * 0.3 * scale,
                h * 0.3 * scale,
                0, 0, Math.PI * 2
            );
            ctx.fill();
        }
    },
    
    /**
     * Draw UI elements
     */
    _drawUI(ctx, gameState) {
        // Wisp counter - use data from gameState
        const collected = gameState.collected || 0;
        const total = gameState.totalCollectibles || 0;
        
        // UI background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this._roundRect(ctx, 15, 15, 120, 40, 8);
        ctx.fill();
        
        // Wisp icon
        const iconX = 35;
        const iconY = 35;
        const iconGrd = ctx.createRadialGradient(iconX, iconY, 0, iconX, iconY, 12);
        iconGrd.addColorStop(0, this.colors.wispCore);
        iconGrd.addColorStop(0.5, this.colors.wispGlow);
        iconGrd.addColorStop(1, 'transparent');
        ctx.fillStyle = iconGrd;
        ctx.beginPath();
        ctx.arc(iconX, iconY, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Counter text
        ctx.fillStyle = this.colors.textLight;
        ctx.font = 'bold 20px "Segoe UI", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${collected} / ${total}`, 55, 35);
        
        // Game state messages
        if (gameState.state === 'victory') {
            this._drawMessage(ctx, 'Spirits Gathered!', 'The swamp glows with your light');
        } else if (gameState.state === 'gameover') {
            this._drawMessage(ctx, 'Light Faded...', 'Press R to try again');
        } else if (gameState.state === 'ready') {
            this._drawMessage(ctx, 'Lantern Spirit', 'Press SPACE to begin your journey');
        }
        
        // Double jump indicator
        if (gameState.player && gameState.state === 'playing') {
            const hasDoubleJump = !gameState.player.hasDoubleJumped;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            this._roundRect(ctx, 15, 60, 100, 25, 6);
            ctx.fill();
            
            ctx.fillStyle = hasDoubleJump ? this.colors.wispGlow : this.colors.textDark;
            ctx.font = '12px "Segoe UI", sans-serif';
            ctx.fillText(hasDoubleJump ? '◆ Double Jump' : '◇ Double Jump', 25, 73);
        }
    },
    
    /**
     * Draw centered message overlay
     */
    _drawMessage(ctx, title, subtitle) {
        // Darken background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Message box
        const boxW = 400;
        const boxH = 120;
        const boxX = (this.width - boxW) / 2;
        const boxY = (this.height - boxH) / 2;
        
        ctx.fillStyle = 'rgba(20, 30, 40, 0.9)';
        this._roundRect(ctx, boxX, boxY, boxW, boxH, 15);
        ctx.fill();
        
        // Glow border
        ctx.strokeStyle = this.colors.lanternMid;
        ctx.lineWidth = 2;
        this._roundRect(ctx, boxX, boxY, boxW, boxH, 15);
        ctx.stroke();
        
        // Title
        ctx.fillStyle = this.colors.uiGlow;
        ctx.font = 'bold 28px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(title, this.width / 2, boxY + 45);
        
        // Subtitle
        ctx.fillStyle = this.colors.textLight;
        ctx.font = '16px "Segoe UI", sans-serif';
        ctx.fillText(subtitle, this.width / 2, boxY + 80);
    }
};

// Global reference for game.js
const THEME = Theme;

// Export for use in game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Theme;
}
