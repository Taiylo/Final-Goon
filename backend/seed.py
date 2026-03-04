from models import db, Product

PRODUCTS = [
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
        "name": "Reusable Coffee Cup",
        "description": "Eco-friendly reusable cup. 350ml.",
        "price_pence": 1499,
        "stock": 25,
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