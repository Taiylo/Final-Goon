const app = document.getElementById("app");

let cart = [];
let currentUser = null;
let currentSlide = 0;
let csrfToken = null;

const loremParagraphs = [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
    "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores."
];

function getRandomLoremParagraph() {
    return loremParagraphs[Math.floor(Math.random() * loremParagraphs.length)];
}

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
        const csrf = await fetch("/api/csrf", {
            credentials: "include"
        }).then(r => r.json());

        csrfToken = csrf.csrfToken;

        const me = await fetch("/api/me", {
            credentials: "include"
        }).then(r => r.json());

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
                        <img src="https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80" alt="Coffee image 1">
                    </div>

                    <div class="carousel-slide">
                        <img src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80" alt="Coffee image 2">
                    </div>

                    <div class="carousel-slide">
                        <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80" alt="Coffee image 3">
                    </div>

                    <div class="carousel-slide">
                        <img src="https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80" alt="Coffee image 4">
                    </div>

                    <div class="carousel-slide">
                        <img src="https://images.unsplash.com/photo-1459257868276-5e65389e2722?auto=format&fit=crop&w=800&q=80" alt="Coffee image 5">
                    </div>

                </div>

                <button class="carousel-btn next" onclick="nextSlide()">❯</button>

            </div>

            <div class="carousel-description">
                <p>
                    We are passionate about traditional coffee, premium beans, and creating memorable experiences for every customer.
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
                <input id="restName" value="${currentUser ? escapeHtml(currentUser.name) : ""}" required>

                <label>Email</label>
                <input id="restEmail" type="email" value="${currentUser ? escapeHtml(currentUser.email) : ""}" required>

                <label>Location</label>
                <select id="restLocation" required>
                    <option value="Manchester">Manchester</option>
                    <option value="Lancaster">Lancaster</option>
                    <option value="London">London</option>
                    <option value="Bristol">Bristol</option>
                </select>

                <label>Date</label>
                <input id="restDate" type="date" required>

                <label>Time</label>
                <input id="restTime" type="time" required>

                <label>Guests</label>
                <input id="restGuests" type="number" min="1" max="12" required>

                <button class="green-btn" type="submit">Book Table</button>

            </form>

        </div>
    `;
}

async function bookTable(event) {
    event.preventDefault();

    if (!currentUser) {
        alert("You must login before booking.");
        showLogin();
        return;
    }

    const location = document.getElementById("restLocation").value;
    const date = document.getElementById("restDate").value;
    const time = document.getElementById("restTime").value;
    const guests = parseInt(document.getElementById("restGuests").value, 10);

    if (!date || !time) {
        alert("Please select a date and time.");
        return;
    }

    try {
        await api("/api/bookings", {
            method: "POST",
            body: JSON.stringify({
                location,
                guests,
                bookingTime: `${date}T${time}`
            })
        });

        alert("Table booked successfully!");
        showBookings();
    } catch (err) {
        alert(err.message);
    }
}

/* ========================= */
/* BOOKINGS */
/* ========================= */

async function showBookings() {
    if (!currentUser) {
        alert("Please login first.");
        showLogin();
        return;
    }

    try {
        const res = await api("/api/bookings");
        const bookings = res.bookings || [];

        if (!bookings.length) {
            app.innerHTML = `
                <div class="card">
                    <h2>My Bookings</h2>
                    <p>No bookings yet.</p>
                    <button class="green-btn" onclick="showLogin()">Back to Account</button>
                </div>
            `;
            return;
        }

        const bookingsHTML = bookings.map(b => `
            <div class="booking-card">
                <p><b>Location:</b> ${escapeHtml(b.location)}</p>
                <p><b>Guests:</b> ${b.guests}</p>
                <p><b>Date & Time:</b> ${formatDateTime(b.bookingTime)}</p>
            </div>
        `).join("");

        app.innerHTML = `
            <div class="bookings-page" style="max-width:800px;margin:40px auto;">
                <h2 style="text-align:center;margin-bottom:20px;">My Bookings</h2>
                ${bookingsHTML}
                <div style="text-align:center;margin-top:20px;">
                    <button class="green-btn" onclick="showLogin()">Back to Account</button>
                </div>
            </div>
        `;
    } catch (err) {
        app.innerHTML = `
            <div class="card">
                <h2>Error Loading Bookings</h2>
                <p>${escapeHtml(err.message)}</p>
                <button class="green-btn" onclick="showLogin()">Back</button>
            </div>
        `;
    }
}

/* ========================= */
/* COFFEE LESSONS */
/* ========================= */

async function showLessons() {
    try {
        const res = await api("/api/lessons");
        const lessons = res.lessons || [];

        if (!lessons.length) {
            app.innerHTML = `
                <div class="card">
                    <h2>Coffee Brewing Lessons</h2>
                    <p>No lessons are available right now.</p>
                </div>
            `;
            return;
        }

        const lessonsHTML = lessons.map(lesson => `
            <div class="card" style="margin-bottom:25px;">
                <h2>${escapeHtml(lesson.title)}</h2>
                <p style="margin-bottom:12px;">${escapeHtml(lesson.description || "No description available.")}</p>
                <p><b>Date:</b> ${formatDateTime(lesson.date)}</p>
                <p><b>Spaces Left:</b> ${lesson.spaces}</p>
                <button class="green-btn" onclick="bookLesson(${lesson.id})" ${lesson.spaces <= 0 ? "disabled" : ""}>
                    ${lesson.spaces <= 0 ? "Fully Booked" : "Book Lesson"}
                </button>
            </div>
        `).join("");

        app.innerHTML = `
            <div style="max-width:800px;margin:40px auto;">
                <h2 style="text-align:center;margin-bottom:25px;">Coffee Brewing Lessons</h2>
                ${lessonsHTML}
            </div>
        `;
    } catch (err) {
        app.innerHTML = `
            <div class="card">
                <h2>Error Loading Lessons</h2>
                <p>${escapeHtml(err.message)}</p>
            </div>
        `;
    }
}

async function bookLesson(lessonId) {
    if (!currentUser) {
        alert("You must login before booking a lesson.");
        showLogin();
        return;
    }

    try {
        await api("/api/lessons/book", {
            method: "POST",
            body: JSON.stringify({ lessonId })
        });

        alert("Lesson booked successfully!");
        showLessons();
    } catch (err) {
        alert(err.message);
    }
}

/* ========================= */
/* SHOP */
/* ========================= */

async function showShop() {
    try {
        const res = await api("/api/products");
        const products = res.products || [];

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

function addToCart(id) {
    const products = window.currentProducts || [];
    const product = products.find(p => p.id === id);

    if (!product) {
        alert("Product not found.");
        return;
    }

    if (product.stock <= 0) {
        alert("This item is out of stock.");
        return;
    }

    const existing = cart.find(item => item.id === id);

    if (existing) {
        if (existing.quantity >= product.stock) {
            alert("You cannot add more than the available stock.");
            return;
        }
        existing.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            pricePence: product.pricePence,
            quantity: 1
        });
    }

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
                <button class="green-btn" onclick="showShop()">Go to Shop</button>
            </div>
        `;
        return;
    }

    let totalPence = 0;

    const itemsHTML = cart.map(item => {
        const lineTotal = item.pricePence * item.quantity;
        totalPence += lineTotal;

        return `
            <div class="cart-item">
                <span>${escapeHtml(item.name)} x${item.quantity}</span>
                <span>£${(lineTotal / 100).toFixed(2)}</span>
            </div>
        `;
    }).join("");

    app.innerHTML = `
        <div class="card">
            <h2>Cart</h2>
            ${itemsHTML}
            <h3>Total: £${(totalPence / 100).toFixed(2)}</h3>
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
            <input id="cardHolder" placeholder="Card Holder Name">
            <input id="cardNumber" placeholder="Card Number" maxlength="19">
            <input id="cardExpiry" placeholder="Expiry Date (MM/YY)" maxlength="5">
            <input id="cardCvv" placeholder="CVV" maxlength="4">
            <button class="green-btn" onclick="completePayment()">Pay</button>
        </div>
    `;
}

/* ========================= */
/* PAYMENT */
/* ========================= */

async function completePayment() {
    if (!cart.length) return;

    const cardHolder = document.getElementById("cardHolder")?.value.trim();
    const cardNumber = document.getElementById("cardNumber")?.value.trim();
    const cardExpiry = document.getElementById("cardExpiry")?.value.trim();
    const cardCvv = document.getElementById("cardCvv")?.value.trim();

    if (!cardHolder || !cardNumber || !cardExpiry || !cardCvv) {
        alert("Please complete all card details.");
        return;
    }

    try {
        const items = cart.map(item => ({
            productId: item.id,
            quantity: item.quantity
        }));

        const res = await api("/api/checkout", {
            method: "POST",
            body: JSON.stringify({
                cardNumber,
                expiry: cardExpiry,
                cvc: cardCvv,
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

                    <p><b>Name:</b> ${escapeHtml(currentUser.name)}</p>
                    <p><b>Email:</b> ${escapeHtml(currentUser.email)}</p>
                    
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

                    <label class="auth-label" for="loginEmail">Email</label>
                    <input class="auth-input" type="email" id="loginEmail" required>

                    <label class="auth-label" for="loginPassword">Password</label>
                    <input class="auth-input" type="password" id="loginPassword" required>

                    <a href="#" class="auth-forgot">Forgot password?</a>

                    <button type="submit" class="auth-button">LOGIN</button>

                </form>

                <div class="auth-footer">
                    <a href="#" class="auth-register" onclick="showRegister()">Register Here</a>
                </div>

            </div>

        </section>
    `;
}

/* ========================= */
/* ORDERS */
/* ========================= */

async function showOrders() {
    try {
        const res = await api("/api/orders");
        const orders = res.orders || [];

        if (!orders.length) {
            app.innerHTML = `
                <div class="card">
                    <h2>Your Orders</h2>
                    <p>You haven't placed any orders yet.</p>
                    <button class="green-btn" onclick="showLogin()">Back to Account</button>
                </div>
            `;
            return;
        }

        const ordersHTML = orders.map(order => {
            const items = (order.items || []).map(item => `
                <div class="cart-item">
                    <span>${escapeHtml(item.productName)} x${item.quantity}</span>
                    <span>£${(item.pricePence / 100).toFixed(2)}</span>
                </div>
            `).join("");

            const total = (order.totalPricePence / 100).toFixed(2);

            return `
                <div class="card" style="margin-bottom:25px;">
                    <h3>Order #${order.id}</h3>
                    <p>Status: <b>${escapeHtml(order.status)}</b></p>
                    <p>Date: <b>${formatDateTime(order.createdAt)}</b></p>
                    ${items}
                    <h3>Total: £${total}</h3>
                </div>
            `;
        }).join("");

        app.innerHTML = `
            <div style="max-width:700px;margin:50px auto;">
                <h2 style="text-align:center;margin-bottom:30px;">Your Orders</h2>
                ${ordersHTML}
                <div style="text-align:center;margin-top:20px;">
                    <button class="green-btn" onclick="showLogin()">
                        Back to Account
                    </button>
                </div>
            </div>
        `;
    } catch (err) {
        app.innerHTML = `
            <div class="card">
                <h2>Error Loading Orders</h2>
                <p>${escapeHtml(err.message)}</p>
                <button class="green-btn" onclick="showLogin()">Back</button>
            </div>
        `;
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

                <div class="auth-error" id="registerError" style="display:none;">
                    Registration failed
                </div>

                <form class="auth-form" onsubmit="handleRegister(event)">

                    <label class="auth-label" for="registerName">Name</label>
                    <input class="auth-input" type="text" id="registerName" required>

                    <label class="auth-label" for="registerEmail">Email</label>
                    <input class="auth-input" type="email" id="registerEmail" required>

                    <label class="auth-label" for="registerPassword">Password</label>
                    <input class="auth-input" type="password" id="registerPassword" required>

                    <button type="submit" class="auth-button">
                        REGISTER
                    </button>

                </form>

                <div class="auth-footer">
                    <a href="#" class="auth-register" onclick="showLogin()">Back to Login</a>
                </div>

            </div>

        </section>
    `;
}
async function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value.trim();

    try {
        const res = await api("/api/register", {
            method: "POST",
            body: JSON.stringify({ name, email, password })
        });

        currentUser = res.user;
        alert("Registration successful!");
        showLogin();
    } catch (err) {
        const errorBox = document.getElementById("registerError");
        if (errorBox) {
            errorBox.textContent = err.message;
            errorBox.style.display = "block";
        }
    }
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
    } catch (err) {
        const errorBox = document.getElementById("loginError");
        if (errorBox) {
            errorBox.textContent = err.message;
            errorBox.style.display = "block";
        }
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
/* HELPERS */
/* ========================= */

function getCartItemCount() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function formatDateTime(value) {
    try {
        return new Date(value).toLocaleString("en-GB", {
            dateStyle: "medium",
            timeStyle: "short"
        });
    } catch {
        return value;
    }
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
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

/* Make functions accessible for inline handlers */
window.showHome = showHome;
window.showObjective = showObjective;
window.showShop = showShop;
window.showRestaurant = showRestaurant;
window.showLessons = showLessons;
window.showLocations = showLocations;
window.showLogin = showLogin;
window.showRegister = showRegister;
window.showBookings = showBookings;
window.showOrders = showOrders;
window.showCart = showCart;
window.showCheckout = showCheckout;
window.completePayment = completePayment;
window.bookTable = bookTable;
window.bookLesson = bookLesson;
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;
window.logout = logout;
window.addToCart = addToCart;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;