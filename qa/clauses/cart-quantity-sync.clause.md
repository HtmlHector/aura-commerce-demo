---
slug: cart-quantity-sync
title: Cart Item Quantity Mutation and Line Item Totals
lane: cart
sacred: false
---

# Invariant
Incrementing and decrementing cart item quantity mutates subtotal and line item total in real-time.

## Behavioral Rules
- Clicking `+` increases quantity by 1 and updates the item total to `price * quantity`.
- Decrementing to `0` removes the item from the cart.
- When cart is emptied, the empty state is displayed and Checkout CTA is disabled.
