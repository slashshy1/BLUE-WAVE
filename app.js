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

// --- CORE UI & CART FUNCTIONS ---

function saveCart() {
    localStorage.setItem('bw_cart', JSON.stringify(cart));
}
function clearCart() {
    if (cart.length === 0) return;
    
    if (confirm("Are you sure you want to empty your pack?")) {
        cart = [];
        saveCart();
        updateCartUI();
        showToast("Pack cleared!");
    }
}
function updateCartUI() {
    const listContainer = document.getElementById('cart-items-list');
    const navCount = document.getElementById('nav-cart-count');
    const grandTotalEl = document.getElementById('cart-total-display');
    const webGrandTotalText = document.getElementById('web-grand-total-text');
    const mobileCartCount = document.getElementById('mobile-cart-count');
    
    if (cart.length === 0) {
        listContainer.innerHTML = `<p class="text-slate-500 text-sm text-center py-12">Your cart is empty.</p>`;
        document.getElementById('cart-delivery-display').innerText = "₦0";
        grandTotalEl.innerText = "₦0";
        webGrandTotalText.innerText = "₦0";
        navCount.innerText = "0";
        if (mobileCartCount) mobileCartCount.innerText = "0";
        validateCheckoutForm();
        return;
    }

   let itemsSubtotal = 0;
    let totalItems = 0;
    let cartHTML = ""; 

    cart.forEach(item => {
        itemsSubtotal += item.price * item.quantity;
        totalItems += item.quantity;
        cartHTML += `
            <div class="flex justify-between items-center bg-white/[0.02] p-3 rounded-xl border border-white/5">
                <div><h4 class="text-xs font-bold text-white">${item.name}</h4>
                <p class="text-xs text-cyan-400">₦${(item.price * item.quantity).toLocaleString()}</p></div>
                <div class="flex items-center gap-3 bg-slate-950 px-2 py-1 rounded-lg border border-white/10">
                    <button onclick="changeQuantity('${item.name}', -1)" class="px-2 hover:text-cyan-400 transition">-</button>
                    <span class="text-xs font-bold">${item.quantity}</span>
                    <button onclick="changeQuantity('${item.name}', 1)" class="px-2 hover:text-cyan-400 transition">+</button>
                </div>
            </div>`;
    });

    listContainer.innerHTML = cartHTML;

    const grandTotal = itemsSubtotal + deliveryFee;
    document.getElementById('cart-delivery-display').innerText = "₦" + deliveryFee.toLocaleString();
    grandTotalEl.innerText = "₦" + grandTotal.toLocaleString();
    webGrandTotalText.innerText = "₦" + grandTotal.toLocaleString();
    navCount.innerText = totalItems;
    if (mobileCartCount) mobileCartCount.innerText = totalItems;
    
    validateCheckoutForm(); 
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

// --- SIDEBAR & MENU CONTROLLERS ---

function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    if (cartSidebar) {
        cartSidebar.classList.toggle('translate-x-full');
        cartSidebar.classList.toggle('invisible'); 
    }
}

// --- CHECKOUT & PAYMENT LOGIC ---

function handleZoneChange() {
    const zoneSelect = document.getElementById('delivery-zone-picker');
    const selectedKey = zoneSelect.value;
    deliveryFee = (selectedKey && DELIVERY_ZONES[selectedKey]) ? DELIVERY_ZONES[selectedKey].fee : 0;
    selectedZoneName = (selectedKey && DELIVERY_ZONES[selectedKey]) ? DELIVERY_ZONES[selectedKey].name : "";
    updateCartUI();
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
    const name = document.getElementById('cust-name')?.value.trim();
    const phone = document.getElementById('cust-phone')?.value.trim();
    const address = document.getElementById('cust-address')?.value.trim();
    const zone = document.getElementById('delivery-zone-picker')?.value;
    const btn = document.getElementById('confirm-order-btn');
    
    if(btn) {
        // It only unlocks if all fields are filled AND the cart actually has items
        btn.disabled = !(name && phone && address && zone && cart.length > 0);
    }
}

// ==========================================
// NEW CINEMATIC LOGISTICS TRACKING GENERATOR
// ==========================================

function createTrackingToast() {
    const existing = document.getElementById('active-tracking-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'active-tracking-toast';
    toast.className = 'fixed bottom-6 right-6 left-6 md:left-auto md:w-[400px] bg-slate-900/95 border border-cyan-500/30 backdrop-blur-xl p-5 rounded-2xl shadow-2xl z-50 animate-slide-up-toast flex flex-col gap-4';
    
    toast.innerHTML = `
        <div class="flex items-start gap-3.5">
            <div id="tracking-icon-container" class="w-10 h-10 rounded-xl bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <svg class="animate-spin-clean w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            </div>
            <div class="flex-grow">
                <div class="flex items-center justify-between">
                    <span class="text-[10px] uppercase tracking-widest font-extrabold text-cyan-400" id="tracking-status-badge">LOGISTICS STAGE 1/3</span>
                    <span class="text-[10px] text-slate-400 font-medium animate-pulse-soft" id="tracking-live-dot">● LIVE TRACKING</span>
                </div>
                <h3 class="text-sm font-bold text-white mt-0.5" id="tracking-title">Verifying Payment Transfer</h3>
                <p class="text-xs text-slate-400 mt-1 leading-relaxed" id="tracking-desc">Securely packaging your data matrix and checking digital vault nodes...</p>
            </div>
        </div>
        
        <div class="grid grid-cols-3 gap-1.5 h-1 w-full bg-slate-950 rounded-full overflow-hidden p-[1px]">
            <div id="bar-stage-1" class="h-full bg-cyan-500 rounded-full transition-all duration-500"></div>
            <div id="bar-stage-2" class="h-full bg-slate-800 rounded-full transition-all duration-500"></div>
            <div id="bar-stage-3" class="h-full bg-slate-800 rounded-full transition-all duration-500"></div>
        </div>
    `;

    document.body.appendChild(toast);
}

function updateTrackingStage(stage, title, description) {
    const titleEl = document.getElementById('tracking-title');
    const descEl = document.getElementById('tracking-desc');
    const badgeEl = document.getElementById('tracking-status-badge');
    const iconContainer = document.getElementById('tracking-icon-container');
    
    if (titleEl) titleEl.innerText = title;
    if (descEl) descEl.innerText = description;
    if (badgeEl) badgeEl.innerText = `LOGISTICS STAGE ${stage}/3`;

    if (stage >= 2) {
        document.getElementById('bar-stage-2')?.classList.replace('bg-slate-800', 'bg-cyan-500');
    }
    
    if (stage >= 3) {
        const toastCard = document.getElementById('active-tracking-toast');
        if (toastCard) {
            toastCard.classList.add('success-glow-bloom');
        }

        document.getElementById('bar-stage-3')?.classList.replace('bg-slate-800', 'bg-emerald-500');
        document.getElementById('bar-stage-1')?.classList.replace('bg-cyan-500', 'bg-emerald-500');
        document.getElementById('bar-stage-2')?.classList.replace('bg-cyan-500', 'bg-emerald-500');
        
        badgeEl?.classList.replace('text-cyan-400', 'text-emerald-400');
        badgeEl.innerText = "ORDER SECURED";
        if (titleEl) titleEl.classList.add('scale-up-text');

        const liveDot = document.getElementById('tracking-live-dot');
        if (liveDot) {
            liveDot.innerText = "SUCCESS";
            liveDot.classList.replace('text-slate-400', 'text-emerald-400');
        }

        if (iconContainer) {
            iconContainer.className = "w-10 h-10 rounded-xl bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 scale-up-text";
            iconContainer.innerHTML = `
                <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            `;
        }

        // --- PREMIUM CELEBRATION CONFETTI EXPLOSION ---
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 140,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#06b6d4', '#10b981', '#ffffff'],
                ticks: 200
            });

            setTimeout(() => {
                confetti({
                    particleCount: 60,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0, y: 0.8 },
                    colors: ['#06b6d4', '#ffffff']
                });
            }, 200);

            setTimeout(() => {
                confetti({
                    particleCount: 60,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1, y: 0.8 },
                    colors: ['#10b981', '#ffffff']
                });
            }, 200);
        }
    }
}

function processDirectWebOrder() {
    createTrackingToast();
    
    const btn = document.getElementById('confirm-order-btn');
    if (btn) btn.disabled = true;

    const templateParams = {
        name: document.getElementById('cust-name').value,
        phone: document.getElementById('cust-phone').value,
        address: document.getElementById('cust-address').value,
        zone: selectedZoneName,
        order_summary: cart.map(i => `${i.quantity}x ${i.name}`).join(", "),
        grand_total: document.getElementById('cart-total-display').innerText,
        bank: BANK_PROFILES[activeBankKey].bankName
    };

    emailjs.send('service_cbv623b', 'template_1h2sogr', templateParams)
        .then(() => {
            setTimeout(() => {
                updateTrackingStage(
                    2, 
                    "Transmitting to Kitchen", 
                    "Order synchronized! Generating print tickets for the culinary dispatch array..."
                );

                setTimeout(() => {
                    updateTrackingStage(
                        3, 
                        "Order Confirmed! 🚀", 
                        "The kitchen has received your wave order. Preparation of your pack has officially begun!"
                    );

                    cart = [];
                    localStorage.removeItem('bw_cart');
                    updateCartUI();
                    
                    setTimeout(() => {
                        toggleCart();
                    }, 1000);

                    setTimeout(() => {
                        const toast = document.getElementById('active-tracking-toast');
                        if (toast) {
                            toast.style.transition = "all 0.5s ease-out";
                            toast.style.opacity = "0";
                            toast.style.transform = "translateY(20px)";
                            setTimeout(() => toast.remove(), 500);
                        }
                    }, 6000);

                }, 2000);
            }, 1500);

        }, (err) => {
            const toast = document.getElementById('active-tracking-toast');
            if (toast) toast.remove();
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = originalBtnHTML; // Bring back the original text
            }
            alert("Network timeout or invalid key config. Please try the WhatsApp method.");
        });
}

function sendWhatsAppOrder() {
    if (cart.length === 0) {
        alert("Your pack is empty!");
        return;
    }
    
    let text = "Hello Blue Wave Eats! I would like to place an order:\n\n";
    let itemsSubtotal = 0;
    
    cart.forEach(item => {
        itemsSubtotal += item.price * item.quantity;
        text += `${item.quantity}x ${item.name} - ₦${(item.price * item.quantity).toLocaleString()}\n`;
    });
    
    const grandTotal = itemsSubtotal + deliveryFee;
    
    text += `\nDelivery Zone: ${selectedZoneName || "Not Selected"}`;
    text += `\nGrand Total: ₦${grandTotal.toLocaleString()}`;
    
    const whatsappUrl = `https://wa.me/2348087253969?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
}
function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    
    ['cust-name', 'cust-phone', 'cust-address'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener('input', validateCheckoutForm);
    });
});
// --- THEME SWITCHER ---

// Check local storage to see what the user picked last time
if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

function toggleTheme() {
    // Add or remove the 'dark' class on the whole HTML page
    document.documentElement.classList.toggle('dark');
    
    // Save the choice so it remembers next time
    if (document.documentElement.classList.contains('dark')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}