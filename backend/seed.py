from datetime import datetime, timedelta
from models import db, Product, Lesson

PRODUCTS = [
    # Coffee Beans
    {
        "name": "Ethiopian Arabica Beans",
        "description": "Floral aroma with citrus notes. 250g whole beans.",
        "price_pence": 1399,
        "stock": 50,
    },
    {
        "name": "Colombian Supremo",
        "description": "Rich and smooth with chocolate undertones. 250g.",
        "price_pence": 1299,
        "stock": 40,
    },
    {
        "name": "Italian Espresso Blend",
        "description": "Dark roast espresso blend. Strong and bold.",
        "price_pence": 1099,
        "stock": 60,
    },
    {
        "name": "Brazilian Santos",
        "description": "Nutty and low acidity. Perfect everyday coffee.",
        "price_pence": 1199,
        "stock": 35,
    },

    # Drinks / Syrups
    {
        "name": "Cold Brew Concentrate",
        "description": "Ready-to-drink cold brew concentrate. 500ml.",
        "price_pence": 899,
        "stock": 30,
    },
    {
        "name": "Vanilla Latte Syrup",
        "description": "Premium vanilla syrup for lattes and desserts.",
        "price_pence": 599,
        "stock": 75,
    },
    {
        "name": "Caramel Coffee Syrup",
        "description": "Sweet caramel syrup perfect for lattes.",
        "price_pence": 599,
        "stock": 60,
    },

    # Baked Goods
    {
        "name": "Butter Croissant",
        "description": "Flaky all-butter croissant, baked fresh daily.",
        "price_pence": 325,
        "stock": 45,
    },
    {
        "name": "Pain au Chocolat",
        "description": "Laminated pastry with rich dark chocolate filling.",
        "price_pence": 365,
        "stock": 36,
    },
    {
        "name": "Blueberry Muffin",
        "description": "Soft muffin packed with blueberries and a sugar crust.",
        "price_pence": 295,
        "stock": 40,
    },
    {
        "name": "Cinnamon Roll",
        "description": "Swirled sweet dough with cinnamon and vanilla glaze.",
        "price_pence": 375,
        "stock": 30,
    },
    {
        "name": "Lemon Drizzle Loaf Slice",
        "description": "Moist lemon loaf slice topped with zesty drizzle icing.",
        "price_pence": 315,
        "stock": 28,
    },

    # Equipment
    {
        "name": "Reusable Coffee Cup",
        "description": "Eco-friendly reusable cup. 350ml.",
        "price_pence": 1499,
        "stock": 25,
    },
    {
        "name": "French Press Coffee Maker",
        "description": "Classic French press for rich full-bodied coffee.",
        "price_pence": 2499,
        "stock": 20,
    },
    {
        "name": "Manual Coffee Grinder",
        "description": "Adjustable burr grinder for fresh coffee.",
        "price_pence": 2199,
        "stock": 15,
    },

    # Hampers
    {
        "name": "Coffee Starter Hamper",
        "description": "Includes 2 coffee beans, mug, and syrup.",
        "price_pence": 3999,
        "stock": 10,
    },
    {
        "name": "Ultimate Coffee Lovers Hamper",
        "description": "4 specialty beans, syrup, cup, and grinder.",
        "price_pence": 7999,
        "stock": 8,
    },
]

LESSONS = [
    {
        "title": "Espresso Basics",
        "description": "Learn how to pull the perfect espresso shot and understand grind size, extraction, and crema.",
        "lesson_date": datetime.utcnow() + timedelta(days=3, hours=14),
        "spaces": 8,
    },
    {
        "title": "Latte Art Workshop",
        "description": "Practice milk steaming and create classic latte art patterns with expert guidance.",
        "lesson_date": datetime.utcnow() + timedelta(days=7, hours=11),
        "spaces": 6,
    },
    {
        "title": "Advanced Brewing Techniques",
        "description": "Explore brew ratios, pour-over methods, and ways to improve flavour consistency at home.",
        "lesson_date": datetime.utcnow() + timedelta(days=12, hours=16),
        "spaces": 10,
    },
]


def seed_products():
    """Create example coffee products if the table is empty."""
    if Product.query.first():
        return

    for item in PRODUCTS:
        db.session.add(
            Product(
                name=item["name"],
                description=item["description"],
                price_pence=item["price_pence"],
                stock=item["stock"],
            )
        )

    db.session.commit()


def seed_lessons():
    """Create example lessons if the table is empty."""
    if Lesson.query.first():
        return

    for item in LESSONS:
        db.session.add(
            Lesson(
                title=item["title"],
                description=item["description"],
                lesson_date=item["lesson_date"],
                spaces=item["spaces"],
            )
        )

    db.session.commit()