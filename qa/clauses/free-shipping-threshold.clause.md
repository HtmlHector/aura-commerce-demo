---
slug: free-shipping-threshold
title: Free Shipping Rule Threshold at $75
lane: cart
sacred: true
---

# Invariant
Orders with a net discounted subtotal greater than or equal to `$75.00` qualify for free shipping ($0.00).

## Behavioral Rules
- If net subtotal < $75.00: standard shipping fee of `$7.00` is applied.
- If net subtotal >= $75.00: shipping fee is `$0.00` and UI displays `FREE`.
- Modifying cart quantities to drop below $75.00 must immediately restore the $7.00 shipping fee.
