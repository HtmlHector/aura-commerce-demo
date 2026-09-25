---
slug: checkout-discount-order
title: Promo Discount Must Apply Strictly Before Sales Tax
lane: checkout
sacred: true
---

# Invariant
Promotional discount codes must reduce the gross subtotal **before** the 8.25% sales tax calculation is executed.

## Behavioral Rules
- For a cart with subtotal `$100.00` and a 20% promo code (`AURA20`):
  - Discounted subtotal must be `$80.00`
  - Sales tax (8.25%) must be `$6.60`
  - Total must be `$86.60` (or `$86.60 + shipping` if below free shipping threshold)
- Under no circumstances may sales tax be calculated against the pre-discount subtotal ($8.25 tax) when a valid promo code is active.
