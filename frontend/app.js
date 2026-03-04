const app = document.getElementById("app");

let cart = [];
let currentUser = null;

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
/* SHOP */
/* ========================= */

function showShop() {
    app.innerHTML = `
        <div class="shop-grid">
            <div class="product">
                <h3>Arabica Beans</h3>
                <p>£13.99</p>
                <button onclick="addToCart('Arabica Beans', 13.99)">Add to Cart</button>
            </div>
            <div class="product">
                <h3>Robusta Beans</h3>
                <p>£10.99</p>
                <button onclick="addToCart('Robusta Beans', 10.99)">Add to Cart</button>
            </div>
        </div>

        <div class="shop-actions">
            <button class="green-btn" onclick="showCart()">View Cart</button>
        </div>
    `;
}

function addToCart(name, price) {
    cart.push({ name, price });
    alert("Added to cart!");
}

/* ========================= */
/* CART */
/* ========================= */

function showCart() {
    let total = 0;

    let itemsHTML = cart.map(item => {
        total += item.price;
        return `<p>${item.name} - £${item.price.toFixed(2)}</p>`;
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

function completePayment() {
    cart = [];
    alert("Payment Successful!");
    showHome();
}

/* ========================= */
/* LOGIN */
/* ========================= */

function showLogin() {
    app.innerHTML = `
        <section class="auth-section">

            <div class="auth-card">

                <h1 class="auth-title">LOGIN</h1>

                <div class="auth-error" id="loginError" style="display:none;">
                    Invalid email or password.
                </div>

                <form class="auth-form" onsubmit="handleLogin(event)">

                    <label class="auth-label">Email</label>
                    <input class="auth-input" type="email" id="loginEmail" required>

                    <label class="auth-label">Password</label>
                    <input class="auth-input" type="password" id="loginPassword" required>

                    <a href="#" class="auth-forgot">Forgot Password?</a>

                    <button type="submit" class="auth-button">
                        SUBMIT
                    </button>

                </form>

                <div class="auth-footer">
                    <a href="#" class="auth-register" onclick="showRegister()">
                        Register Here
                    </a>
                </div>

            </div>

        </section>
    `;
}

function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (email === "admin@example.com" && password === "password") {
        currentUser = email;
        alert("Login successful!");
        showHome();
    } else {
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

function handleRegister(event) {
    event.preventDefault();
    alert("Registration successful!");
    showLogin();
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
/* COOKIE NOTICE - Added by Raees */
/* ========================= */
/* Checks if user has accepted cookies using localStorage */
/* Shows banner on first visit, hides after user clicks Accept */

function checkCookieConsent() {
    const cookieNotice = document.getElementById('cookieNotice');
    const acceptBtn = document.getElementById('acceptCookies');
    
    // Check if user has already accepted cookies
    if (!localStorage.getItem('cookiesAccepted')) {
        cookieNotice.classList.add('show');
    }
    
    // Handle accept button click
    acceptBtn.addEventListener('click', function() {
        localStorage.setItem('cookiesAccepted', 'true');
        cookieNotice.classList.remove('show');
    });
}

/* ========================= */
/* LOAD HOME BY DEFAULT */
/* ========================= */

showHome();
checkCookieConsent();