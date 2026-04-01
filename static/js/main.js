document.addEventListener('DOMContentLoaded', function () {
    // Dark mode toggle
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }
    
    function updateThemeIcon(theme) {
        const icon = themeToggle?.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    // Mobile nav toggle
    var navToggle = document.getElementById('navToggle');
    var navLinks = document.getElementById('navLinks');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            navLinks.classList.toggle('active');
            const expanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !expanded);
        });
        document.addEventListener('click', function (e) {
            if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Search autocomplete
    var heroSearch = document.getElementById('heroSearch');
    var searchSuggestions = document.getElementById('searchSuggestions');
    
    if (heroSearch && searchSuggestions) {
        var services = [
            { name: 'Electrician', icon: 'fa-bolt', query: 'electrician' },
            { name: 'Plumber', icon: 'fa-wrench', query: 'plumber' },
            { name: 'Carpenter', icon: 'fa-hammer', query: 'carpenter' },
            { name: 'Painter', icon: 'fa-paint-roller', query: 'painter' },
            { name: 'Cleaner', icon: 'fa-broom', query: 'cleaner' },
            { name: 'Mechanic', icon: 'fa-car', query: 'mechanic' },
            { name: 'Gardener', icon: 'fa-leaf', query: 'gardener' },
            { name: 'AC Repair', icon: 'fa-snowflake', query: 'ac_repair' },
            { name: 'Pest Control', icon: 'fa-bug', query: 'pest_control' },
            { name: 'Mover', icon: 'fa-truck', query: 'mover' }
        ];
        
        var states = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'West Bengal', 'Rajasthan', 'Gujarat', 'Telangana', 'Kerala'];
        
        heroSearch.addEventListener('input', function(e) {
            var query = e.target.value.toLowerCase().trim();
            
            if (query.length < 2) {
                searchSuggestions.classList.remove('active');
                return;
            }
            
            var matches = [];
            
            services.forEach(function(service) {
                if (service.name.toLowerCase().includes(query)) {
                    matches.push({
                        type: 'service',
                        name: service.name,
                        icon: service.icon,
                        url: '/profiles/workers/?service=' + service.query
                    });
                }
            });
            
            states.forEach(function(state) {
                if (state.toLowerCase().includes(query)) {
                    matches.push({
                        type: 'state',
                        name: state,
                        icon: 'fa-map-marker-alt',
                        url: '/profiles/workers/?state=' + state.toLowerCase().replace(' ', '_')
                    });
                }
            });
            
            if (matches.length > 0) {
                searchSuggestions.innerHTML = matches.slice(0, 5).map(function(match) {
                    return '<a href="' + match.url + '" class="search-suggestion">' +
                           '<i class="fas ' + match.icon + '"></i>' +
                           '<span>' + match.name + ' <small>(' + match.type + ')</small></span>' +
                           '</a>';
                }).join('');
                searchSuggestions.classList.add('active');
            } else {
                searchSuggestions.classList.remove('active');
            }
        });
        
        heroSearch.addEventListener('blur', function() {
            setTimeout(function() {
                searchSuggestions.classList.remove('active');
            }, 200);
        });
        
        heroSearch.addEventListener('focus', function() {
            if (heroSearch.value.length >= 2) {
                searchSuggestions.classList.add('active');
            }
        });
    }

    // Scroll-triggered fade-in animations
    var fadeElements = document.querySelectorAll('.fade-in');
    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.style.animationPlayState = 'running';
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );
        fadeElements.forEach(function (el) {
            el.style.animationPlayState = 'paused';
            observer.observe(el);
        });
    }

    // Animated counter for hero stats
    var counters = document.querySelectorAll('.stat-number[data-count]');
    if (counters.length > 0) {
        var counterStarted = false;
        var counterObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting && !counterStarted) {
                        counterStarted = true;
                        counters.forEach(function (counter) {
                            var target = parseInt(counter.getAttribute('data-count'), 10);
                            var duration = 2000;
                            var step = Math.ceil(target / (duration / 16));
                            var current = 0;
                            var suffix = target >= 500 ? '+' : '+';
                            function update() {
                                current += step;
                                if (current >= target) {
                                    current = target;
                                    counter.textContent = current + suffix;
                                    return;
                                }
                                counter.textContent = current + suffix;
                                requestAnimationFrame(update);
                            }
                            requestAnimationFrame(update);
                        });
                    }
                });
            },
            { threshold: 0.5 }
        );
        var heroStats = document.querySelector('.hero-stats');
        if (heroStats) {
            counterObserver.observe(heroStats);
        }
    }

    // Parallax effect on hero background elements
    var hero = document.querySelector('.hero');
    if (hero) {
        var shapes = hero.querySelectorAll('.floating-shape');
        var particles = hero.querySelectorAll('.particle');
        window.addEventListener('scroll', function () {
            var scrollY = window.scrollY;
            var heroHeight = hero.offsetHeight;
            if (scrollY < heroHeight) {
                var ratio = scrollY / heroHeight;
                shapes.forEach(function (shape, i) {
                    var speed = 0.3 + (i * 0.1);
                    shape.style.transform = 'translateY(' + (scrollY * speed) + 'px)';
                });
                particles.forEach(function (p, i) {
                    var speed = 0.1 + (i * 0.05);
                    p.style.transform = 'translateY(' + (scrollY * speed) + 'px)';
                });
            }
        }, { passive: true });
    }

    // Mouse-move parallax on hero for 3D depth effect
    if (hero) {
        var cubes = hero.querySelectorAll('.hero-3d-object');
        var orbitRings = hero.querySelectorAll('.orbit-ring');
        var shapes = hero.querySelectorAll('.floating-shape');
        var particles = hero.querySelectorAll('.particle');
        var nebulas = hero.querySelectorAll('.nebula');
        var tori = hero.querySelectorAll('.torus, .torus-2');
        var spheres = hero.querySelectorAll('.sphere, .sphere-2');
        var octahedrons = hero.querySelectorAll('.octahedron, .octahedron-2');
        var heroContent = hero.querySelector('.hero-content');
        var heroBg = hero.querySelector('.hero-bg-3d');

        hero.addEventListener('mousemove', function (e) {
            var rect = hero.getBoundingClientRect();
            var x = (e.clientX - rect.left) / rect.width - 0.5;
            var y = (e.clientY - rect.top) / rect.height - 0.5;

            cubes.forEach(function (cube, i) {
                var factor = 30 + (i * 15);
                var baseTransform = getComputedStyle(cube).transform;
                cube.style.transform = 'translate(' + (x * factor) + 'px, ' + (y * factor) + 'px)';
            });

            orbitRings.forEach(function (ring, i) {
                var factor = 15 + (i * 8);
                if (!ring._origML) ring._origML = parseInt(getComputedStyle(ring).marginLeft) || -250;
                if (!ring._origMT) ring._origMT = parseInt(getComputedStyle(ring).marginTop) || -250;
                ring.style.marginLeft = (ring._origML + (x * factor)) + 'px';
                ring.style.marginTop = (ring._origMT + (y * factor)) + 'px';
            });

            shapes.forEach(function (shape, i) {
                var factor = 8 + (i * 4);
                shape.style.transform = 'translate(' + (x * factor) + 'px, ' + (y * factor) + 'px)';
            });

            particles.forEach(function (p, i) {
                var factor = 3 + (i * 1.5);
                p.style.transform = 'translate(' + (x * factor) + 'px, ' + (y * factor) + 'px)';
            });

            nebulas.forEach(function (nebula, i) {
                var factor = 20 + (i * 10);
                nebula.style.transform = 'translate(' + (x * factor) + 'px, ' + (y * factor) + 'px)';
            });

            tori.forEach(function (torus, i) {
                var factor = 25 + (i * 12);
                torus.style.transform = 'translate(' + (x * factor) + 'px, ' + (y * factor) + 'px)';
            });

            spheres.forEach(function (sphere, i) {
                var factor = 18 + (i * 8);
                sphere.style.transform = 'translate(' + (x * factor) + 'px, ' + (y * factor) + 'px)';
            });

            octahedrons.forEach(function (oct, i) {
                var factor = 22 + (i * 10);
                oct.style.transform = 'translate(' + (x * factor) + 'px, ' + (y * factor) + 'px)';
            });

            if (heroContent) {
                heroContent.style.transform = 'translate(' + (x * 5) + 'px, ' + (y * 5) + 'px)';
            }

            if (heroBg) {
                heroBg.style.transform = 'rotateY(' + (x * 3) + 'deg) rotateX(' + (-y * 3) + 'deg)';
            }
        });

        hero.addEventListener('mouseleave', function () {
            cubes.forEach(function (cube) {
                cube.style.transform = '';
            });
            orbitRings.forEach(function (ring) {
                if (ring._origML) ring.style.marginLeft = ring._origML + 'px';
                if (ring._origMT) ring.style.marginTop = ring._origMT + 'px';
            });
            shapes.forEach(function (shape) {
                shape.style.transform = '';
            });
            particles.forEach(function (p) {
                p.style.transform = '';
            });
            nebulas.forEach(function (nebula) {
                nebula.style.transform = '';
            });
            tori.forEach(function (torus) {
                torus.style.transform = '';
            });
            spheres.forEach(function (sphere) {
                sphere.style.transform = '';
            });
            octahedrons.forEach(function (oct) {
                oct.style.transform = '';
            });
            if (heroContent) {
                heroContent.style.transform = '';
            }
            if (heroBg) {
                heroBg.style.transform = '';
            }
        });
    }

    // Tilt effect on service cards
    var serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
            var rect = card.getBoundingClientRect();
            var x = (e.clientX - rect.left) / rect.width;
            var y = (e.clientY - rect.top) / rect.height;
            var tiltX = (0.5 - y) * 10;
            var tiltY = (x - 0.5) * 10;
            card.style.transform = 'translateY(-6px) perspective(600px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg)';
        });
        card.addEventListener('mouseleave', function () {
            card.style.transform = '';
        });
    });

    // Auto-dismiss alerts after 5 seconds
    var alerts = document.querySelectorAll('.alert');
    alerts.forEach(function (alert) {
        setTimeout(function () {
            alert.style.opacity = '0';
            alert.style.transform = 'translateY(-10px)';
            setTimeout(function () {
                alert.remove();
            }, 300);
        }, 5000);
    });

    // Filter auto-submit
    var filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(function (sel) {
        sel.addEventListener('change', function () {
            var form = sel.closest('form');
            if (form) form.submit();
        });
    });

    // Chart.js initialization
    if (typeof Chart !== 'undefined') {
        // Service Distribution Chart
        var serviceCtx = document.getElementById('serviceChart');
        if (serviceCtx) {
            new Chart(serviceCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Electrician', 'Plumber', 'Carpenter', 'Painter', 'Cleaner', 'Others'],
                    datasets: [{
                        data: [25, 20, 18, 15, 12, 10],
                        backgroundColor: [
                            '#3b82f6',
                            '#22c55e',
                            '#8b5cf6',
                            '#f97316',
                            '#06b6d4',
                            '#6b7280'
                        ],
                        borderWidth: 0,
                        hoverOffset: 10
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                usePointStyle: true,
                                pointStyle: 'circle',
                                font: { size: 11 }
                            }
                        }
                    },
                    cutout: '60%'
                }
            });
        }

        // Growth Chart
        var growthCtx = document.getElementById('growthChart');
        if (growthCtx) {
            new Chart(growthCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [{
                        label: 'Bookings',
                        data: [120, 190, 280, 350, 420, 520],
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#3b82f6',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(0, 0, 0, 0.05)' }
                        },
                        x: { grid: { display: false } }
                    }
                }
            });
        }
    }
});
