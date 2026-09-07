def apply_coupon(amount: int, coupon: dict) -> int:
    """Returns discount amount (integer VND), clamped to [0, amount] regardless of
    how discount_value was stored — a safety net against a bad/negative value slipping
    past admin-side validation and inflating the customer's total instead of reducing it."""
    if coupon['discount_type'] == 'PERCENT':
        discount = int(amount * coupon['discount_value'] / 100)
    else:
        discount = coupon['discount_value']
    return max(0, min(amount, discount))


def fare_total(base_price: int, tax: int, fees: int) -> int:
    return base_price + tax + fees


def booking_total(fares: list) -> int:
    """fares: list of dicts with base_price, tax, fees, quantity."""
    return sum(fare_total(f['base_price'], f['tax'], f['fees']) * f.get('quantity', 1) for f in fares)
