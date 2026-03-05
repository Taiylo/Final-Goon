const app = document.getElementById("app");

let cart = [];
let currentUser = null;
let currentSlide = 0;

let csrfToken = null;

async function api(path, options = {}) {
    options.headers = options.headers || {};
    options.headers["Content-Type"] = "application/json";

    if (csrfToken) {
        options.headers["X-CSRF-Token"] = csrfToken;
    }

    const res = await fetch(path, options);
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || "Request failed");
    }

    return data;
}

async function initAuth() {
    const csrf = await fetch("/api/csrf").then(r => r.json());
    csrfToken = csrf.csrfToken;

    const me = await fetch("/api/me").then(r => r.json());

    if (me.loggedIn) {
        currentUser = me.user;
    }
}

/* ========================= */
/* NAVBAR EVENT LISTENERS */
/* ========================= */

const navButtons = document.querySelectorAll(".nav-btn");

navButtons.forEach(button => {
    button.addEventListener("click", function () {

        // Remove active from all
        navButtons.forEach(btn => btn.classList.remove("active"));

        // Add active to clicked
        this.classList.add("active");

        const page = this.dataset.page;

        if (page === "home") showHome();
        if (page === "shop") showShop();
        if (page === "locations") showLocations();
        if (page === "login") showLogin();
    });
});

/* ========================= */
/* HOME PAGE */
/* ========================= */

function showHome() {
    app.innerHTML = `
        <main class="banner-page">
            <section class="hero" aria-label="Coffee hero">
                <div class="hero-overlay"></div>

                <div class="logo-badge" aria-hidden="true">
                    <div class="logo-ring">
                        <div class="logo-core">
                            <span class="logo-icon">☕</span>
                            <span class="logo-text">FRESHLY BREWED</span>
                        </div>
                    </div>
                </div>

                <h1 class="title">Shop Now</h1>
            </section>

            <section class="content" aria-label="Promotional copy">
                <div class="text-column">
                    <p>
                        We brew traditional coffee using ethically sourced beans,
                        roasted to perfection for bold flavour and smooth finish.
                    </p>
                </div>
                <div class="text-column">
                    <p>
                        Discover premium Arabica and Robusta blends crafted
                        for true coffee lovers. Experience quality in every cup.
                    </p>
                </div>
            </section>
        </main>
    `;
}

/* ========================= */
/* OUR OBJECTIVE PAGE */
/* ========================= */

function showObjective() {
    app.innerHTML = `
        <div class="carousel-container">
            <h1 class="carousel-title">We Brew Traditional Coffee</h1>
            
            <div class="carousel-section">
                <button class="carousel-btn prev" onclick="prevSlide()">❮</button>
                
                <div class="carousel-wrapper" id="carouselWrapper">
                    <div class="carousel-slide center">
                        <img src="https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80" alt="Coffee shop storefront">
                    </div>
                    <div class="carousel-slide">
                        <img src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80" alt="Coffee brewing process">
                    </div>
                    <div class="carousel-slide">
                        <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80" alt="Barista team">
                    </div>
                    <div class="carousel-slide">
                        <img src="https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80" alt="Coffee beans and cup">
                    </div>
                    <div class="carousel-slide">
                        <img src="https://images.unsplash.com/photo-1459257868276-5e65389e2722?auto=format&fit=crop&w=800&q=80" alt="Latte art pour">
                    </div>
                </div>
                
                <button class="carousel-btn next" onclick="nextSlide()">❯</button>
            </div>

            <div class="carousel-description">
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehen</p>
            </div>
        </div>
    `;
    currentSlide = 0;
    updateCarouselPosition();
}

/* ========================= */
/* CAROUSEL FUNCTIONS */
/* ========================= */

function updateCarouselPosition() {
    const wrapper = document.getElementById('carouselWrapper');
    const slides = document.querySelectorAll('.carousel-slide');
    
    if (wrapper && slides.length > 0) {
        const style = getComputedStyle(wrapper);
        const gap = parseFloat(style.columnGap || style.gap || 0);

        const targetSlide = slides[currentSlide];
        const slideWidth = targetSlide.offsetWidth;
        const targetLeft = targetSlide.offsetLeft;

        // Center the active slide while keeping neighbors visible
        const desired = targetLeft - (wrapper.clientWidth - slideWidth) / 2;
        const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;
        const scrollLeft = Math.max(0, Math.min(desired, maxScroll));

        wrapper.scrollTo({ left: scrollLeft, behavior: 'smooth' });

        slides.forEach((slide, index) => {
            slide.classList.toggle('center', index === currentSlide);
        });
    }
}

function nextSlide() {
    const slides = document.querySelectorAll('.carousel-slide');
    currentSlide = (currentSlide + 1) % slides.length;
    updateCarouselPosition();
}

function prevSlide() {
    const slides = document.querySelectorAll('.carousel-slide');
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateCarouselPosition();
}

/* ========================= */
/* SHOP */
/* ========================= */

function showShop() {
    app.innerHTML = `
        <div class="shop-grid">
            <div class="product">
                <h3>Arabica Beans</h3>
                <p>£13.99</p>
                <button onclick="addToCart(1,'Arabica Beans',13.99)">Add to Cart</button>
            </div>
            <div class="product">
                <h3>Robusta Beans</h3>
                <p>£10.99</p>
                <button onclick="addToCart(2,'Robusta Beans',10.99)">Add to Cart</button>
            </div>
        </div>

        <div class="shop-actions">
            <button class="green-btn" onclick="showCart()">View Cart</button>
        </div>
    `;
}

function addToCart(id, name, pricePence) {

    cart.push({
        id,
        name,
        price: pricePence
    });

    alert("Added to cart!");
}

/* ========================= */
/* CART */
/* ========================= */

function showCart() {
    let total = 0;

    let itemsHTML = cart.map(item => {
        total += item.price;
        return `
            <div class="cart-item">
                <span>${item.name}</span>
                <span>£${item.price.toFixed(2)}</span>
            </div>
        `;
    }).join("");

    app.innerHTML = `
        <div class="card">
            <h2>Cart</h2>
            ${itemsHTML || "<p>Cart is empty</p>"}
            <h3>Total: £${total.toFixed(2)}</h3>
            <button class="green-btn" onclick="showCheckout()">Checkout</button>
        </div>
    `;
}

/* ========================= */
/* CHECKOUT */
/* ========================= */

function showCheckout() {

    if (!currentUser) {
        alert("You must login before checkout");
        showLogin();
        return;
    }

    app.innerHTML = `
        <div class="card">
            <h2>Card Details</h2>
            <input placeholder="Card Holder Name">
            <input placeholder="Card Number">
            <input placeholder="Expiry Date">
            <input placeholder="CVV">
            <button class="green-btn" onclick="completePayment()">Pay</button>
        </div>
    `;
}

async function showOrders() {

    try {

        const res = await api("/api/orders");

        const ordersHTML = res.orders.map(o => {

            const items = o.items.map(i => `
                <li>${i.productName} x${i.quantity}</li>
            `).join("");

            return `
                <div class="card">
                    <h3>Order #${o.id}</h3>
                    <p>Status: ${o.status}</p>
                    <ul>${items}</ul>
                </div>
            `;

        }).join("");

        app.innerHTML = `
            <h2>My Orders</h2>
            ${ordersHTML || "<p>No orders yet</p>"}
        `;

    } catch (err) {
        alert(err.message);
    }
}

async function completePayment() {

    if (!currentUser) {
        alert("Please login first");
        showLogin();
        return;
    }

    try {

        const items = cart.map(item => ({
            productId: item.id,
            quantity: 1
        }));

        const res = await api("/api/checkout", {
            method: "POST",
            body: JSON.stringify({
                cardNumber: "4242424242424242",
                expiry: "12/30",
                cvc: "123",
                items
            })
        });

        cart = [];

        alert("Payment Successful! Order #" + res.orderId);

        showHome();

    } catch (err) {
        alert(err.message);
    }
}

/* ========================= */
/* LOGIN */
/* ========================= */

function showLogin() {

    if (currentUser) {

        app.innerHTML = `
            <section class="auth-section">
                <div class="auth-card">

                    <h1 class="auth-title">Account</h1>

                    <p><b>Name:</b> ${currentUser.name}</p>
                    <p><b>Email:</b> ${currentUser.email}</p>

                    <button class="green-btn" onclick="showOrders()">
                        View Orders
                    </button>

                    <button class="auth-button" onclick="logout()">
                        Logout
                    </button>

                </div>
            </section>
        `;

        return;
    }

    app.innerHTML = `
        <section class="auth-section">
            <div class="auth-card">
                <h1 class="auth-title">LOGIN</h1>

                <div class="auth-error" id="loginError" style="display:none;">
                    Invalid email or password.
                </div>

                <form class="auth-form" onsubmit="handleLogin(event)">
                    <label>Email</label>
                    <input type="email" id="loginEmail" required>

                    <label>Password</label>
                    <input type="password" id="loginPassword" required>

                    <button type="submit" class="auth-button">
                        LOGIN
                    </button>
                </form>

                <div class="auth-footer">
                    <a href="#" onclick="showRegister()">
                        Register Here
                    </a>
                </div>

            </div>
        </section>
    `;
}

async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    try {
        const res = await api("/api/login", {
            method: "POST",
            body: JSON.stringify({ email, password })
        });

        currentUser = res.user;

        alert("Login successful!");

        showHome();

        navButtons.forEach(btn => btn.classList.remove("active"));
        document.querySelector('[data-page="home"]').classList.add("active");

    } catch (err) {
        document.getElementById("loginError").style.display = "block";
    }
}

/* ========================= */
/* REGISTER */
/* ========================= */

function showRegister() {
    app.innerHTML = `
        <section class="auth-section">
            <div class="auth-card">
                <h1 class="auth-title">REGISTER</h1>

                <form class="auth-form" onsubmit="handleRegister(event)">
                    <label class="auth-label">Email</label>
                    <input class="auth-input" type="email" required>

                    <label class="auth-label">Username</label>
                    <input class="auth-input" required>

                    <label class="auth-label">Password</label>
                    <input class="auth-input" type="password" required>

                    <label class="auth-label">Confirm Password</label>
                    <input class="auth-input" type="password" required>

                    <button type="submit" class="auth-button">
                        SUBMIT
                    </button>
                </form>

                <div class="auth-footer">
                    <a href="#" class="auth-register" onclick="showLogin()">
                        Back to Login
                    </a>
                </div>
            </div>
        </section>
    `;
}

/* ========================= */
/* LOGOUT */
/* ========================= */
async function handleRegister(event) {
    event.preventDefault();

    const inputs = document.querySelectorAll(".auth-input");

    const email = inputs[0].value.trim();
    const name = inputs[1].value.trim();
    const password = inputs[2].value.trim();
    const confirm = inputs[3].value.trim();

    if (password !== confirm) {
        alert("Passwords do not match");
        return;
    }

    try {
        const res = await api("/api/register", {
            method: "POST",
            body: JSON.stringify({
                email,
                name,
                password
            })
        });

        currentUser = res.user;

        alert("Account created!");

        showHome();

    } catch (err) {
        alert(err.message);
    }
}
async function logout() {

    try {

        await api("/api/logout", {
            method: "POST"
        });

        currentUser = null;

        alert("Logged out");

        showHome();

    } catch (err) {
        alert(err.message);
    }
}

/* ========================= */
/* LOCATIONS */
/* ========================= */

function showLocations() {
    app.innerHTML = `
        <div class="location-grid">
            <div class="location-card">
                <h3>Manchester</h3>
                <p>21 King Street</p>
                <p>0161 123 4567</p>
            </div>
            <div class="location-card">
                <h3>Lancaster</h3>
                <p>11 Queen's Square</p>
                <p>01524 765432</p>
            </div>
            <div class="location-card">
                <h3>London</h3>
                <p>14 Regent St</p>
                <p>020 9876 5432</p>
            </div>
            <div class="location-card">
                <h3>Bristol</h3>
                <p>9 Castle Road</p>
                <p>0117 222 3333</p>
            </div>
        </div>
    `;
}

/* ========================= */
/* COOKIE NOTICE */
/* ========================= */

function checkCookieConsent() {
    const cookieNotice = document.getElementById('cookieNotice');
    const acceptBtn = document.getElementById('acceptCookies');

    if (!localStorage.getItem('cookiesAccepted')) {
        cookieNotice.classList.add('show');
    }

    acceptBtn.addEventListener('click', function() {
        localStorage.setItem('cookiesAccepted', 'true');
        cookieNotice.classList.remove('show');
    });
}

/* ========================= */
/* INITIAL LOAD */
/* ========================= */

async function startApp() {
    await initAuth();

    showHome();
    document.querySelector('[data-page="home"]').classList.add("active");
    checkCookieConsent();
}

startApp();