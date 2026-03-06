const app = document.getElementById("app");

let cart = [];
let currentUser = null;
let currentSlide = 0;

let csrfToken = null;

/* ========================= */
/* API HELPER */
/* ========================= */

async function api(path, options = {}) {

    options.headers = options.headers || {};
    options.headers["Content-Type"] = "application/json";

    if (csrfToken) {
        options.headers["X-CSRF-Token"] = csrfToken;
    }

    options.credentials = "include";

    const res = await fetch(path, options);

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data.error || "Request failed");
    }

    return data;
}

/* ========================= */
/* AUTH INIT */
/* ========================= */

async function initAuth() {

    try {

        const csrf = await fetch("/api/csrf", { credentials: "include" }).then(r => r.json());
        csrfToken = csrf.csrfToken;

        const me = await fetch("/api/me", { credentials: "include" }).then(r => r.json());

        if (me.loggedIn) {
            currentUser = me.user;
        }

    } catch (err) {
        console.error("Auth init failed", err);
    }

}

/* ========================= */
/* NAVBAR */
/* ========================= */

const navButtons = document.querySelectorAll(".nav-btn");

navButtons.forEach(button => {

    button.addEventListener("click", function () {

        navButtons.forEach(btn => btn.classList.remove("active"));
        this.classList.add("active");

        const page = this.dataset.page;

        if (page === "home") showHome();
        if (page === "objective") showObjective();
        if (page === "shop") showShop();
        if (page === "restaurant") showRestaurant();
        if (page === "lessons") showLessons();
        if (page === "locations") showLocations();
        if (page === "login") showLogin();

    });

});

/* ========================= */
/* HOME */
/* ========================= */

function showHome() {

    app.innerHTML = `
        <main class="banner-page">
            <section class="hero">
                <div class="hero-overlay"></div>

                <div class="logo-badge">
                    <div class="logo-ring">
                        <div class="logo-core">
                            <span class="logo-icon">☕</span>
                            <span class="logo-text">FRESHLY BREWED</span>
                        </div>
                    </div>
                </div>

                <h1 class="title">Shop Now</h1>
            </section>

            <section class="content">
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
/* OBJECTIVE */
/* ========================= */

function showObjective() {

    app.innerHTML = `
        <div class="carousel-container">

            <h1 class="carousel-title">We Brew Traditional Coffee</h1>

            <div class="carousel-section">

                <button class="carousel-btn prev" onclick="prevSlide()">❮</button>

                <div class="carousel-wrapper" id="carouselWrapper">

                    <div class="carousel-slide center">
                        <img src="https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80">
                    </div>

                    <div class="carousel-slide">
                        <img src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80">
                    </div>

                    <div class="carousel-slide">
                        <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80">
                    </div>

                    <div class="carousel-slide">
                        <img src="https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80">
                    </div>

                    <div class="carousel-slide">
                        <img src="https://images.unsplash.com/photo-1459257868276-5e65389e2722?auto=format&fit=crop&w=800&q=80">
                    </div>

                </div>

                <button class="carousel-btn next" onclick="nextSlide()">❯</button>

            </div>

            <div class="carousel-description">
                <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
            </div>

        </div>
    `;

    currentSlide = 0;
    setTimeout(updateCarouselPosition, 50);

}

/* ========================= */
/* CAROUSEL */
/* ========================= */

function updateCarouselPosition() {

    const wrapper = document.getElementById("carouselWrapper");

    if (!wrapper) return;

    const slides = document.querySelectorAll(".carousel-slide");

    if (!slides.length) return;

    const targetSlide = slides[currentSlide];

    const slideWidth = targetSlide.offsetWidth;
    const targetLeft = targetSlide.offsetLeft;

    const desired = targetLeft - (wrapper.clientWidth - slideWidth) / 2;

    const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;

    const scrollLeft = Math.max(0, Math.min(desired, maxScroll));

    wrapper.scrollTo({
        left: scrollLeft,
        behavior: "smooth"
    });

    slides.forEach((slide, index) => {
        slide.classList.toggle("center", index === currentSlide);
    });

}

function nextSlide() {

    const slides = document.querySelectorAll(".carousel-slide");

    if (!slides.length) return;

    currentSlide = (currentSlide + 1) % slides.length;

    updateCarouselPosition();

}

function prevSlide() {

    const slides = document.querySelectorAll(".carousel-slide");

    if (!slides.length) return;

    currentSlide = (currentSlide - 1 + slides.length) % slides.length;

    updateCarouselPosition();

}

/* ========================= */
/* RESTAURANT BOOKING */
/* ========================= */

function showRestaurant() {

    app.innerHTML = `
        <div class="card">

            <h2>Book a Table</h2>

            <form class="booking-form" onsubmit="bookTable(event)">

                <label>Name</label>
                <input id="restName" required>

                <label>Email</label>
                <input id="restEmail" type="email" required>

                <label>Date</label>
                <input id="restDate" type="date" required>

                <label>Time</label>
                <input id="restTime" type="time" required>

                <label>Guests</label>
                <input id="restGuests" type="number" min="1" max="12" required>

                <button class="green-btn">Book Table</button>

            </form>

        </div>
    `;
}


function bookTable(event) {

    event.preventDefault();

    const booking = {
        type: "Restaurant",
        name: document.getElementById("restName").value,
        date: document.getElementById("restDate").value,
        time: document.getElementById("restTime").value,
        guests: document.getElementById("restGuests").value
    };

    const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
    bookings.push(booking);
    localStorage.setItem("bookings", JSON.stringify(bookings));

    alert("Table booked successfully!");

    showHome();
}

/* ========================= */
/* COFFEE LESSONS */
/* ========================= */

function showLessons() {

    app.innerHTML = `
        <div class="card">

            <h2>Coffee Brewing Lessons</h2>

            <p>Learn from our expert baristas.</p>

            <form class="booking-form" onsubmit="bookLesson(event)">

                <label>Name</label>
                <input id="lessonName" required>

                <label>Email</label>
                <input id="lessonEmail" type="email" required>

                <label>Lesson Type</label>

                <select id="lessonType">
                    <option value="espresso">Espresso Basics</option>
                    <option value="latte">Latte Art</option>
                    <option value="advanced">Advanced Brewing</option>
                </select>

                <label>Date</label>
                <input id="lessonDate" type="date" required>

                <button class="green-btn">Book Lesson</button>

            </form>

        </div>
    `;
}

function bookLesson(event) {

    event.preventDefault();

    const lesson = {
        type: "Lesson",
        lessonType: document.getElementById("lessonType").value,
        date: document.getElementById("lessonDate").value
    };

    const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
    bookings.push(lesson);
    localStorage.setItem("bookings", JSON.stringify(bookings));

    alert("Lesson booked successfully!");

    showHome();
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

function addToCart(id, name, price) {

    cart.push({ id, name, price });

    alert("Added to cart!");

}

/* ========================= */
/* CART */
/* ========================= */

function showCart() {

    if (!cart.length) {

        app.innerHTML = `
            <div class="card">
                <h2>Cart</h2>
                <p>Cart is empty</p>
            </div>
        `;

        return;
    }

    let total = 0;

    const itemsHTML = cart.map(item => {

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
            ${itemsHTML}
            <h3>Total: £${total.toFixed(2)}</h3>
            <button class="green-btn" onclick="showCheckout()">Checkout</button>
        </div>
    `;
}

/* ========================= */
/* CHECKOUT */
/* ========================= */

function showCheckout() {

    if (!cart.length) {
        alert("Cart is empty");
        return;
    }

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

/* ========================= */
/* PAYMENT */
/* ========================= */

async function completePayment() {

    if (!cart.length) return;

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
function showBookings() {

    const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");

    const html = bookings.map(b => {

        if (b.type === "Restaurant") {
            return `
                <div class="booking-item">
                    <h4>Restaurant Booking</h4>
                    <p>Date: ${b.date}</p>
                    <p>Time: ${b.time}</p>
                    <p>Guests: ${b.guests}</p>
                </div>
            `;
        }

        if (b.type === "Lesson") {
            return `
                <div class="booking-item">
                    <h4>Coffee Lesson</h4>
                    <p>Lesson: ${b.lessonType}</p>
                    <p>Date: ${b.date}</p>
                </div>
            `;
        }

    }).join("");

    app.innerHTML = `
        <div class="account-section">

            <h2 class="account-title">My Bookings</h2>

            <div class="booking-history">
                ${html || "<p>No bookings yet</p>"}
            </div>

        </div>
    `;
}

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

                    <button class="green-btn" onclick="showBookings()">
                        My Bookings
                    </button>

                    <button class="auth-button" onclick="logout()">Logout</button>

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

                    <button type="submit" class="auth-button">LOGIN</button>

                </form>

                <div class="auth-footer">
                    <a href="#" onclick="showRegister()">Register Here</a>
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

    } catch {

        document.getElementById("loginError").style.display = "block";

    }

}

/* ========================= */
/* LOGOUT */
/* ========================= */

async function logout() {

    try {

        await api("/api/logout", { method: "POST" });

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

    const cookieNotice = document.getElementById("cookieNotice");
    const acceptBtn = document.getElementById("acceptCookies");

    if (!cookieNotice || !acceptBtn) return;

    if (!localStorage.getItem("cookiesAccepted")) {
        cookieNotice.classList.add("show");
    }

    acceptBtn.addEventListener("click", () => {

        localStorage.setItem("cookiesAccepted", "true");

        cookieNotice.classList.remove("show");

    });

}

/* ========================= */
/* START APP */
/* ========================= */

async function startApp() {

    await initAuth();

    showHome();

    const homeBtn = document.querySelector('[data-page="home"]');
    if (homeBtn) homeBtn.classList.add("active");

    checkCookieConsent();

}

startApp();