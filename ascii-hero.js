// Optimized ASCII Effect - Spaceship Command Theme
// Performance-focused refactor with same visual output

(function () {
    'use strict';

    function waitForThree(callback) {
        if (typeof THREE !== 'undefined') callback();
        else setTimeout(() => waitForThree(callback), 50);
    }

    waitForThree(() => {
        function initAscii() {
            const container = document.getElementById('ascii-container');
            const video = document.getElementById('hero-video');
            
            if (!container || !video) {
                console.warn('ASCII: Container or video not found');
                return;
            }

            // Performance: Cap pixel ratio and use lower internal resolution
            const maxPixelRatio = 1.5;
            const scale = Math.min(window.devicePixelRatio, maxPixelRatio);
            const width = container.offsetWidth;
            const height = container.offsetHeight;
            const renderWidth = Math.floor(width * scale);
            const renderHeight = Math.floor(height * scale);
            const aspect = width / height;
            const videoAspect = 16 / 9;

            // Scene setup - minimal
            const scene = new THREE.Scene();
            const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
            
            // Renderer with performance flags
            const renderer = new THREE.WebGLRenderer({ 
                antialias: false,
                alpha: false,
                powerPreference: 'high-performance',
                stencil: false,
                depth: false,
                preserveDrawingBuffer: false
            });
            renderer.setSize(width, height);
            renderer.setPixelRatio(scale);
            renderer.domElement.style.width = '100%';
            renderer.domElement.style.height = '100%';
            container.appendChild(renderer.domElement);

            // Video texture - disable mipmaps
            const videoTexture = new THREE.VideoTexture(video);
            videoTexture.minFilter = THREE.LinearFilter;
            videoTexture.magFilter = THREE.LinearFilter;
            videoTexture.generateMipmaps = false;
            videoTexture.format = THREE.RGBFormat;
            
            // Render target - reduced resolution
            const renderTarget = new THREE.WebGLRenderTarget(renderWidth, renderHeight, {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.LinearFilter,
                format: THREE.RGBFormat,
                generateMipmaps: false,
                stencilBuffer: false,
                depthBuffer: false
            });
            
            // Video plane - sized to cover viewport
            let planeWidth = 2, planeHeight = 2;
            if (aspect > videoAspect) {
                planeHeight = (2 / aspect) * videoAspect;
            } else {
                planeWidth = 2 * aspect / videoAspect;
            }
            const coverScale = Math.max(2 / planeWidth, 2 / planeHeight);
            planeWidth *= coverScale;
            planeHeight *= coverScale;
            
            const videoScene = new THREE.Scene();
            const videoPlane = new THREE.Mesh(
                new THREE.PlaneGeometry(planeWidth, planeHeight),
                new THREE.MeshBasicMaterial({ map: videoTexture })
            );
            videoScene.add(videoPlane);

            // Optimized ASCII shader - consolidated calculations, removed branching where possible
            const asciiMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    tDiffuse: { value: null },
                    cellSize: { value: 5.0 },
                    time: { value: 0.0 },
                    resolution: { value: new THREE.Vector2(renderWidth, renderHeight) }
                },
                vertexShader: `
                    varying vec2 vUv;
                    void main() {
                        vUv = uv;
                        gl_Position = vec4(position.xy, 0.0, 1.0);
                    }
                `,
                fragmentShader: `
                    precision mediump float;
                    
                    uniform sampler2D tDiffuse;
                    uniform float cellSize;
                    uniform float time;
                    uniform vec2 resolution;
                    varying vec2 vUv;

                    void main() {
                        // Cell coordinates
                        vec2 cellCount = resolution / cellSize;
                        vec2 cellCoord = floor(vUv * cellCount);
                        vec2 cellUV = (cellCoord + 0.5) / cellCount;
                        vec2 localUV = fract(vUv * cellCount);
                        
                        // Sample and compute brightness
                        vec3 color = texture2D(tDiffuse, cellUV).rgb;
                        float brightness = dot(color, vec3(0.299, 0.587, 0.114));
                        brightness = clamp((brightness - 0.5) * 1.3 + 0.55, 0.0, 1.0);
                        
                        // ASCII pattern using smoothstep for GPU-friendly branching
                        vec2 grid = floor(localUV * 4.0);
                        float gx = grid.x;
                        float gy = grid.y;
                        
                        // Center check (1-2 range)
                        float inCenterX = step(0.5, gx) * step(gx, 2.5);
                        float inCenterY = step(0.5, gy) * step(gy, 2.5);
                        float inCenter = inCenterX * inCenterY;
                        
                        // Edge check
                        float onEdge = 1.0 - inCenter;
                        
                        // Pattern based on brightness (using mix instead of branches)
                        float pattern;
                        float b = brightness;
                        
                        // Level 1: dots (b < 0.2)
                        float p1 = inCenter * 0.3;
                        // Level 2: horizontal bars (b < 0.4)
                        float p2 = inCenterY * 0.8;
                        // Level 3: cross (b < 0.6)
                        float p3 = mix(0.5, 1.0, onEdge);
                        // Level 4: checker (b < 0.8)
                        float checker = mod(gx + gy, 2.0);
                        float p4 = mix(0.6, 1.0, step(0.5, checker));
                        // Level 5: solid
                        float p5 = 1.0;
                        
                        // Blend between patterns based on brightness
                        pattern = mix(p1, p2, smoothstep(0.15, 0.25, b));
                        pattern = mix(pattern, p3, smoothstep(0.35, 0.45, b));
                        pattern = mix(pattern, p4, smoothstep(0.55, 0.65, b));
                        pattern = mix(pattern, p5, smoothstep(0.75, 0.85, b));
                        
                        // Custom background
                        vec3 bgColor = vec3(0.14, 0.13, 0.16); 
                        vec3 charColor = vec3(0.909, 0.894, 0.854);
                        
                        // Mix between background and character color based on pattern
                        vec3 finalColor = mix(bgColor, charColor, brightness * pattern);
                        
                        // Scanlines (subtle)
                        finalColor -= sin(vUv.y * 471.0) * 0.0;
                        
                        // Subtle vignette
                        vec2 vig = vUv - 0.5;
                        finalColor -= dot(vig, vig) * 0.2;
                        
                        // Minimal noise
                        float noise = fract(sin(dot(vUv + time * 0.1, vec2(12.9898, 78.233))) * 43758.5453);
                        finalColor += (noise - 0.5) * 0.015;
                        
                        gl_FragColor = vec4(max(finalColor, 0.0), 1.0);
                    }
                `,
                depthTest: false,
                depthWrite: false
            });

            const asciiQuad = new THREE.Mesh(
                new THREE.PlaneGeometry(2, 2),
                asciiMaterial
            );
            scene.add(asciiQuad);

            // Debounced resize
            let resizeTimeout;
            const baseWidth = planeWidth;
            const baseHeight = planeHeight;
            
            function onResize() {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    const w = container.offsetWidth;
                    const h = container.offsetHeight;
                    const s = Math.min(window.devicePixelRatio, maxPixelRatio);
                    const rw = Math.floor(w * s);
                    const rh = Math.floor(h * s);
                    const a = w / h;
                    
                    renderer.setSize(w, h);
                    renderer.setPixelRatio(s);
                    renderTarget.setSize(rw, rh);
                    asciiMaterial.uniforms.resolution.value.set(rw, rh);
                    
                    // Update video plane
                    let pw = 2, ph = 2;
                    if (a > videoAspect) {
                        ph = (2 / a) * videoAspect;
                    } else {
                        pw = 2 * a / videoAspect;
                    }
                    const cs = Math.max(2 / pw, 2 / ph);
                    videoPlane.scale.set((pw * cs) / baseWidth, (ph * cs) / baseHeight, 1);
                }, 150);
            }
            
            window.addEventListener('resize', onResize);

            // Animation with visibility checks and frame limiting
            let time = 0;
            let lastFrame = 0;
            let animationId = null;
            let isVisible = true;
            
            const targetFPS = 30;
            const frameInterval = 1000 / targetFPS;
            
            // Pause when tab hidden
            document.addEventListener('visibilitychange', () => {
                isVisible = !document.hidden;
                if (isVisible && !animationId) {
                    lastFrame = performance.now();
                    animationId = requestAnimationFrame(animate);
                }
            });
            
            // Pause when scrolled out of view
            const observer = new IntersectionObserver((entries) => {
                const wasVisible = isVisible;
                isVisible = entries[0].isIntersecting && !document.hidden;
                if (isVisible && !wasVisible && !animationId) {
                    lastFrame = performance.now();
                    animationId = requestAnimationFrame(animate);
                }
            }, { threshold: 0.05 });
            observer.observe(container);
            
            function animate(timestamp) {
                if (!isVisible) {
                    animationId = null;
                    return;
                }
                
                animationId = requestAnimationFrame(animate);
                
                // Frame rate limiting
                const delta = timestamp - lastFrame;
                if (delta < frameInterval) return;
                lastFrame = timestamp - (delta % frameInterval);
                
                time += 0.016;
                asciiMaterial.uniforms.time.value = time;
                
                // Render video to texture
                renderer.setRenderTarget(renderTarget);
                renderer.render(videoScene, camera);
                
                // Render ASCII
                asciiMaterial.uniforms.tDiffuse.value = renderTarget.texture;
                renderer.setRenderTarget(null);
                renderer.render(scene, camera);
            }

            // Start video and animation
            const startAnimation = () => {
                lastFrame = performance.now();
                animationId = requestAnimationFrame(animate);
            };
            
            video.play().then(startAnimation).catch(startAnimation);
                
            // Cleanup on unload
            window.addEventListener('beforeunload', () => {
                observer.disconnect();
                if (animationId) cancelAnimationFrame(animationId);
                renderer.dispose();
                renderTarget.dispose();
                videoTexture.dispose();
                asciiMaterial.dispose();
            });
        }

        // Initialize
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initAscii);
        } else {
            initAscii();
        }
    });
})();