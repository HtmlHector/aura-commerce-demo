# Aura Commerce — Spec-Driven Demo Store

A modern performance apparel e-commerce demo application designed to demonstrate the **Traceback V2 Spec-Driven Quality Plane**.

## Architecture & Features
- **Storefront**: Responsive product catalog with micro-mesh aesthetics.
- **State & Pricing Engine**: Real-time cart calculation, quantity mutation, promo code discount engine (`AURA20`, `SAVE10`, `SPRING15`), dynamic state tax (8.25%), and free shipping threshold ($75.00).
- **Checkout & Confirmation**: 1-click test checkout and confirmation receipt.

## Traceback Spec Quality Plane (`qa/`)
- `qa/surface.yaml`: Defines repository surface, lanes (`catalog`, `cart`, `checkout`), and preview configuration.
- `qa/policy.yaml`: Quality gate safety policy, sacred invariant blocking rules, and self-healing parameters.
- `qa/clauses/`:
  - `checkout-discount-order.clause.md` (**SACRED**): Ensures promotional discounts apply strictly before sales tax.
  - `free-shipping-threshold.clause.md` (**SACRED**): Ensures free shipping triggers only at or above $75.00.
  - `cart-quantity-sync.clause.md`: Real-time quantity mutations and empty state handling.
  - `responsive-catalog.clause.md`: Adaptive multi-column grid across Desktop and Mobile viewports.
- `qa/journeys/`:
  - `checkout-promo-order.journey.yaml`: E2E journey verifying checkout with promo code.
  - `cart-threshold-shipping.journey.yaml`: Quantity adjustments flipping shipping between $7.00 and FREE.
  - `mobile-navigation-smoke.journey.yaml`: Responsive mobile layout verification on 390x844.

## Quick Start
```bash
npm start
# Server boots at http://localhost:3000
```
