from models import db, Product

from models import db, Product

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

    # Hampers (high value products)
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


def seed_products():
    """Create example coffee products if the table is empty."""
    if Product.query.first():
        return  # Prevent duplicate seeding

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