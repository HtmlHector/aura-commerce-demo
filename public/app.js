// Aura Commerce State & Pricing Engine
const PRODUCTS = [
  {
    id: "aura-aero-tee",
    name: "Aura Aero Performance Tee",
    price: 48.00,
    category: "apparel",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60",
    description: "Ultra-breathable micro-mesh athletic tee with moisture-wicking technology."
  },
  {
    id: "aura-stride-shorts",
    name: "Aura Stride 7\" Running Shorts",
    price: 64.00,
    category: "apparel",
    image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&auto=format&fit=crop&q=60",
    description: "Lightweight 4-way stretch shorts with built-in compression liner and zip pocket."
  },
  {
    id: "aura-cloud-hoodie",
    name: "Aura CloudKnit Oversized Hoodie",
    price: 98.00,
    category: "outerwear",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=60",
    description: "Heavyweight organic cotton fleece with brushed interior for post-workout comfort."
  },
  {
    id: "aura-velocity-bottle",
    name: "Aura Velocity 32oz Insulated Flask",
    price: 36.00,
    category: "accessories",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=60",
    description: "Double-walled vacuum insulated stainless steel bottle with leakproof sport cap."
  }
];

const PROMO_CODES = {
  "SAVE10": { type: "percent", value: 10, label: "10% Off" },
  "AURA20": { type: "percent", value: 20, label: "20% Off" },
  "SPRING15": { type: "fixed", value: 15.00, label: "$15 Off" }
};

const TAX_RATE = 0.0825; // 8.25% state sales tax
const FREE_SHIPPING_THRESHOLD = 75.00;
const STANDARD_SHIPPING_RATE = 7.00;

class AuraStore {
  constructor() {
    this.cart = this.loadCart();
    this.appliedPromo = localStorage.getItem("aura_promo") || null;
    this.init();
  }

  loadCart() {
    try {
      return JSON.parse(localStorage.getItem("aura_cart")) || [];
    } catch {
      return [];
    }
  }

  saveCart() {
    localStorage.setItem("aura_cart", JSON.stringify(this.cart));
    if (this.appliedPromo) {
      localStorage.setItem("aura_promo", this.appliedPromo);
    } else {
      localStorage.removeItem("aura_promo");
    }
    this.renderCartUI();
  }

  addToCart(productId, quantity = 1) {
    const item = this.cart.find(i => i.id === productId);
    if (item) {
      item.quantity += quantity;
    } else {
      const prod = PRODUCTS.find(p => p.id === productId);
      if (prod) {
        this.cart.push({ ...prod, quantity });
      }
    }
    this.saveCart();
    this.openDrawer();
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(i => i.id !== productId);
    this.saveCart();
  }

  updateQuantity(productId, delta) {
    const item = this.cart.find(i => i.id === productId);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        this.removeFromCart(productId);
        return;
      }
    }
    this.saveCart();
  }

  applyPromo(code) {
    const normalized = (code || "").trim().toUpperCase();
    if (PROMO_CODES[normalized]) {
      this.appliedPromo = normalized;
      this.saveCart();
      return { success: true, message: `Applied ${PROMO_CODES[normalized].label}!` };
    }
    return { success: false, message: "Invalid promo code" };
  }

  removePromo() {
    this.appliedPromo = null;
    this.saveCart();
  }

  calculateTotals() {
    // 1. Raw item subtotal
    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 2. Discount amount (Sacred Invariant: Applied strictly BEFORE Tax)
    let discount = 0;
    if (this.appliedPromo && PROMO_CODES[this.appliedPromo]) {
      const promo = PROMO_CODES[this.appliedPromo];
      if (promo.type === "percent") {
        discount = (subtotal * promo.value) / 100;
      } else if (promo.type === "fixed") {
        discount = Math.min(subtotal, promo.value);
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discount);

    // 3. Shipping: Free over threshold $75, else $7.00
    const shipping = subtotal === 0 ? 0 : (discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_RATE);

    // 4. Tax: Applied to discounted subtotal
    const tax = discountedSubtotal * TAX_RATE;

    // 5. Grand Total
    const total = discountedSubtotal + shipping + tax;

    return {
      subtotal: subtotal.toFixed(2),
      discount: discount.toFixed(2),
      discountedSubtotal: discountedSubtotal.toFixed(2),
      shipping: shipping.toFixed(2),
      isFreeShipping: shipping === 0 && subtotal > 0,
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      itemCount: this.cart.reduce((c, i) => c + i.quantity, 0)
    };
  }

  openDrawer() {
    const drawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("cart-overlay");
    if (drawer && overlay) {
      drawer.classList.remove("translate-x-full");
      overlay.classList.remove("hidden");
    }
  }

  closeDrawer() {
    const drawer = document.getElementById("cart-drawer");
    const overlay = document.getElementById("cart-overlay");
    if (drawer && overlay) {
      drawer.classList.add("translate-x-full");
      overlay.classList.add("hidden");
    }
  }

  renderCartUI() {
    const totals = this.calculateTotals();

    // Update cart badge counts
    document.querySelectorAll(".cart-count-badge").forEach(el => {
      el.textContent = totals.itemCount;
      el.classList.toggle("hidden", totals.itemCount === 0);
    });

    // Update Drawer items
    const drawerList = document.getElementById("cart-items-list");
    if (drawerList) {
      if (this.cart.length === 0) {
        drawerList.innerHTML = `
          <div class="text-center py-12 text-zinc-400" data-testid="cart-empty-state">
            <p class="text-sm">Your shopping bag is empty.</p>
          </div>
        `;
      } else {
        drawerList.innerHTML = this.cart.map(item => `
          <div class="flex items-center gap-4 py-4 border-b border-zinc-100" data-testid="cart-item-${item.id}">
            <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg bg-zinc-100" />
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-semibold text-zinc-900 truncate">${item.name}</h4>
              <p class="text-xs text-zinc-500 font-mono mt-0.5">$${item.price.toFixed(2)}</p>
              <div class="flex items-center gap-3 mt-2">
                <button onclick="window.store.updateQuantity('${item.id}', -1)" class="w-6 h-6 flex items-center justify-center rounded border border-zinc-200 text-zinc-600 hover:bg-zinc-50" data-testid="qty-minus">-</button>
                <span class="text-xs font-mono font-medium" data-testid="qty-value">${item.quantity}</span>
                <button onclick="window.store.updateQuantity('${item.id}', 1)" class="w-6 h-6 flex items-center justify-center rounded border border-zinc-200 text-zinc-600 hover:bg-zinc-50" data-testid="qty-plus">+</button>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold font-mono text-zinc-900" data-testid="item-total">$${(item.price * item.quantity).toFixed(2)}</p>
              <button onclick="window.store.removeFromCart('${item.id}')" class="text-xs text-rose-500 hover:underline mt-2" data-testid="remove-item">Remove</button>
            </div>
          </div>
        `).join("");
      }
    }

    // Update Drawer & Cart Page Summary
    const elements = {
      subtotal: document.getElementById("summary-subtotal"),
      discountRow: document.getElementById("summary-discount-row"),
      discount: document.getElementById("summary-discount"),
      shipping: document.getElementById("summary-shipping"),
      tax: document.getElementById("summary-tax"),
      total: document.getElementById("summary-total"),
      checkoutBtn: document.getElementById("checkout-submit-btn")
    };

    if (elements.subtotal) elements.subtotal.textContent = `$${totals.subtotal}`;
    if (elements.discountRow && elements.discount) {
      if (parseFloat(totals.discount) > 0) {
        elements.discountRow.classList.remove("hidden");
        elements.discount.textContent = `-$${totals.discount} (${this.appliedPromo})`;
      } else {
        elements.discountRow.classList.add("hidden");
      }
    }
    if (elements.shipping) {
      elements.shipping.textContent = totals.isFreeShipping ? "FREE" : `$${totals.shipping}`;
    }
    if (elements.tax) elements.tax.textContent = `$${totals.tax}`;
    if (elements.total) elements.total.textContent = `$${totals.total}`;
    if (elements.checkoutBtn) {
      elements.checkoutBtn.disabled = this.cart.length === 0;
    }
  }

  init() {
    this.renderCartUI();
  }
}

window.store = new AuraStore();
