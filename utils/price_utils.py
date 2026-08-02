def apply_coupon(amount: int, coupon: dict) -> int:
    """Returns discount amount (integer VND)."""
    if coupon['discount_type'] == 'PERCENT':
        return min(amount, int(amount * coupon['discount_value'] / 100))
    return min(amount, coupon['discount_value'])


def fare_total(base_price: int, tax: int, fees: int) -> int:
    return base_price + tax + fees


def booking_total(fares: list) -> int:
    """fares: list of dicts with base_price, tax, fees, quantity."""
    return sum(fare_total(f['base_price'], f['tax'], f['fees']) * f.get('quantity', 1) for f in fares)
