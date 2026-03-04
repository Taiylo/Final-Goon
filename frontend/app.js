const app = document.getElementById("app");

let cart = [];

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
        <div class="card">
            <h2>Login</h2>
            <input placeholder="Email">
            <input type="password" placeholder="Password">
            <button class="green-btn">Submit</button>
            <p class="auth-switch">
                <a href="#" onclick="showRegister()">Register Here</a>
            </p>
        </div>
    `;
}

function showRegister() {
    app.innerHTML = `
        <div class="card">
            <h2>Register</h2>
            <input placeholder="Email">
            <input placeholder="Username">
            <input type="password" placeholder="Password">
            <input type="password" placeholder="Confirm Password">
            <button class="green-btn">Submit</button>
        </div>
    `;
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
/* LOAD HOME BY DEFAULT */
/* ========================= */

showHome();