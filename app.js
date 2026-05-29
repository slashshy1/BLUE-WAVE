// ==========================================
// BLUE WAVE EATS - CENTRAL LOGIC SYSTEM ENGINE
// ==========================================

let cart = JSON.parse(localStorage.getItem('bw_cart')) || [];
let activeBankKey = 'providus'; 
let selectedZoneName = "";
let deliveryFee = 0;

const BANK_PROFILES = {
    "providus": { bankName: "Providus Bank", accountNo: "1024590391", accountName: "Blue Wave Eats Ltd" },
    "gtbank": { bankName: "GTBank", accountNo: "0459921084", accountName: "Blue Wave Eats Logistics" },
    "zenith": { bankName: "Zenith Bank", accountNo: "1229048322", accountName: "Blue Wave Eats Hub" }
};

const DELIVERY_ZONES = {
    "wuse": { name: "Wuse I & II (Abuja Hub)", fee: 1500 },
    "garki": { name: "Garki / Maitama / Asokoro", fee: 2000 },
    "gwarinpa": { name: "Gwarinpa / Jahi", fee: 2500 },
    "lokogoma": { name: "Lokogoma / Apo Tiers", fee: 3000 },
    "lekki-phase1": { name: "Lekki Phase 1 (Lagos Hub)", fee: 1500 },
    "ikoyi": { name: "Ikoyi / Victoria Island", fee: 2000 },
    "lekki-outer": { name: "Ajah / Orchid / Chevron Tiers", fee: 3000 },
    "mainland-close": { name: "Surulere / Yaba / Ikeja", fee: 4000 }
};

// --- CORE FUNCTIONS ---

function saveCart() {
    localStorage.setItem('bw_cart', JSON.stringify(cart));
}

function updateCartUI() {
    const listContainer = document.getElementById('cart-items-list');
    const navCount = document.getElementById('nav-cart-count');
    const grandTotalEl = document.getElementById('cart-total-display');
    const webGrandTotalText = document.getElementById('web-grand-total-text');
    
    if (cart.length === 0) {
        listContainer.innerHTML = `<p class="text-slate-500 text-sm text-center py-12">Your cart is empty.</p>`;
        document.getElementById('cart-delivery-display').innerText = "₦0";
        grandTotalEl.innerText = "₦0";
        webGrandTotalText.innerText = "₦0";
        navCount.innerText = "0";
        return;
    }

    let itemsSubtotal = 0;
    let totalItems = 0;
    listContainer.innerHTML = "";

    cart.forEach(item => {
        itemsSubtotal += item.price * item.quantity;
        totalItems += item.quantity;
        listContainer.innerHTML += `
            <div class="flex justify-between items-center bg-white/[0.02] p-3 rounded-xl border border-white/5">
                <div><h4 class="text-xs font-bold text-white">${item.name}</h4>
                <p class="text-xs text-cyan-400">₦${(item.price * item.quantity).toLocaleString()}</p></div>
                <div class="flex items-center gap-3 bg-slate-950 px-2 py-1 rounded-lg border border-white/10">
                    <button onclick="changeQuantity('${item.name}', -1)" class="px-2">-</button>
                    <span class="text-xs font-bold">${item.quantity}</span>
                    <button onclick="changeQuantity('${item.name}', 1)" class="px-2">+</button>
                </div>
            </div>`;
    });

    const grandTotal = itemsSubtotal + deliveryFee;
    document.getElementById('cart-delivery-display').innerText = "₦" + deliveryFee.toLocaleString();
    grandTotalEl.innerText = "₦" + grandTotal.toLocaleString();
    webGrandTotalText.innerText = "₦" + grandTotal.toLocaleString();
    navCount.innerText = totalItems;
    validateCheckoutForm(); // Keep button state in sync
}

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) existingItem.quantity += 1;
    else cart.push({ name, price, quantity: 1 });
    saveCart();
    updateCartUI();
    showToast(`${name} added!`);
}

function changeQuantity(name, amount) {
    const item = cart.find(item => item.name === name);
    if (item) {
        item.quantity += amount;
        if (item.quantity <= 0) cart = cart.filter(i => i.name !== name);
        saveCart();
        updateCartUI();
    }
}

function handleZoneChange() {
    const zoneSelect = document.getElementById('delivery-zone-picker');
    const selectedKey = zoneSelect.value;
    deliveryFee = (selectedKey && DELIVERY_ZONES[selectedKey]) ? DELIVERY_ZONES[selectedKey].fee : 0;
    selectedZoneName = (selectedKey && DELIVERY_ZONES[selectedKey]) ? DELIVERY_ZONES[selectedKey].name : "";
    updateCartUI();
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function selectBank(bankKey) {
    activeBankKey = bankKey;
    const bank = BANK_PROFILES[bankKey];
    document.getElementById('display-bank-name').innerText = bank.bankName;
    document.getElementById('display-account-no').innerText = bank.accountNo;
    document.getElementById('display-account-name').innerText = bank.accountName;
    
    document.querySelectorAll('.bank-select-card').forEach(el => el.classList.remove('bg-cyan-950/30', 'border-cyan-500/60'));
    document.getElementById('bank-card-' + bankKey).classList.add('bg-cyan-950/30', 'border-cyan-500/60');
}

function validateCheckoutForm() {
    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const address = document.getElementById('cust-address').value.trim();
    const zone = document.getElementById('delivery-zone-picker').value;
    const btn = document.getElementById('confirm-order-btn');
    btn.disabled = !(name && phone && address && zone && cart.length > 0);
}
function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    if (cartSidebar) {
        // We toggle the transform class to trigger the smooth sliding animation
        cartSidebar.classList.toggle('translate-x-full');
    } else {
        console.error("Cart sidebar not found in HTML!");
    }
}

// 1. Opens and closes the category sidebar
function toggleCategorySidebar() {
    const sidebar = document.getElementById('category-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('-translate-x-full');
    }
}

// 2. Filters the menu based on sidebar clicks
function filterMenu(category) {
    const items = document.querySelectorAll('.menu-item');
    items.forEach(item => {
        if (category === 'all' || item.classList.contains(category)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
    toggleCategorySidebar(); // Auto-close sidebar after picking a category
}

// 3. Powers the search bar at the top of the page
function searchFoodItems() {
    const query = document.getElementById('menu-search-input').value.toLowerCase();
    const items = document.querySelectorAll('.menu-item');
    let hasResults = false;

    items.forEach(item => {
        const name = item.getAttribute('data-food-name').toLowerCase();
        if (name.includes(query)) {
            item.style.display = 'flex';
            hasResults = true;
        } else {
            item.style.display = 'none';
        }
    });

    const emptyState = document.getElementById('search-empty-state');
    if (emptyState) {
        emptyState.style.display = hasResults ? 'none' : 'block';
    }
}

// 4. Fallback WhatsApp ordering system
function sendWhatsAppOrder() {
    if (cart.length === 0) {
        alert("Your pack is empty!");
        return;
    }
    
    let text = "Hello Blue Wave Eats! I would like to place an order:\n\n";
    cart.forEach(item => {
        text += `${item.quantity}x ${item.name} - ₦${(item.price * item.quantity).toLocaleString()}\n`;
    });
    
    const total = document.getElementById('cart-total-display').innerText;
    text += `\nDelivery Zone: ${selectedZoneName || "Not Selected"}`;
    text += `\nGrand Total: ${total}`;
    
    // Replace the 0000000000 with your actual business WhatsApp number
    const whatsappUrl = `https://wa.me/2348000000000?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
}

function processDirectWebOrder() {
    const templateParams = {
        name: document.getElementById('cust-name').value,
        phone: document.getElementById('cust-phone').value,
        address: document.getElementById('cust-address').value,
        zone: selectedZoneName,
        order_summary: cart.map(i => `${i.name} (x${i.quantity})`).join(", "),
        grand_total: document.getElementById('cart-total-display').innerText,
        bank: BANK_PROFILES[activeBankKey].bankName
    };

    emailjs.send('service_cbv623b', 'template_1h2sogr', templateParams)
        .then(() => {
            alert("Order sent successfully!");
            cart = [];
            localStorage.removeItem('bw_cart');
            updateCartUI();
        }, (err) => alert("Failed to send. Check console."));
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    document.getElementById('cust-name').addEventListener('input', validateCheckoutForm);
    document.getElementById('cust-phone').addEventListener('input', validateCheckoutForm);
    document.getElementById('cust-address').addEventListener('input', validateCheckoutForm);
});