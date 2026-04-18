const defaultMenu = [
    { id: 1, name: "Mandazi", category: "Vitafunio", price: 500, image: "assets/images/mandazi.jpg" },
    { id: 2, name: "Chapati", category: "Vitafunio", price: 1000, image: "assets/images/chapati.webp" },
    { id: 3, name: "Wali", category: "Chakula Kikuu", price: 3500, image: "assets/images/wali.jpg" },
    { id: 4, name: "Ugali", category: "Chakula Kikuu", price: 2500, image: "assets/images/ugali.webp" },
    { id: 5, name: "Sambusa", category: "Vitafunio", price: 500, image: "assets/images/sambusa.webp" },
    { id: 6, name: "Eggchok", category: "Vitafunio", price: 1500, image: "assets/images/eggchok.jpg" },
    { id: 7, name: "Juisi Safi", category: "Vinywaji", price: 2000, image: "assets/images/juice.webp" },
    { id: 8, name: "Samaki", category: "Chakula Kikuu", price: 8000, image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800" },
    { id: 9, name: "Supu ya Kuku", category: "Supu", price: 5000, image: "assets/images/supu.jpg" },
    { id: 10, name: "Mishkaki", category: "Chakula Kikuu", price: 4000, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800" },
    { id: 11, name: "Pilau Kuku", category: "Chakula Kikuu", price: 6000, image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=800" },
    { id: 12, name: "Burger ya Kuku", category: "Fast Food", price: 7500, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800" },
    { id: 13, name: "Chips Mayai", category: "Fast Food", price: 3000, image: "assets/images/chips.webp" },
    { id: 14, name: "Pizza ya Nyama", category: "Fast Food", price: 15000, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800" }
];

// Migration and Initialization logic
if (!localStorage.getItem('regina_menu')) {
    const oldMenu = localStorage.getItem('mama_lucky_menu');
    if (oldMenu) {
        localStorage.setItem('regina_menu', oldMenu);
    } else {
        localStorage.setItem('regina_menu', JSON.stringify(defaultMenu));
    }
}

let menuItems = JSON.parse(localStorage.getItem('regina_menu'));

// Ensure orders are also migrated
if (!localStorage.getItem('regina_orders')) {
    const oldOrders = localStorage.getItem('mama_lucky_orders');
    if (oldOrders) {
        localStorage.setItem('regina_orders', oldOrders);
    }
}

// Update menu if default list has more items than stored
if (menuItems.length < defaultMenu.length) {
    menuItems = defaultMenu;
    localStorage.setItem('regina_menu', JSON.stringify(defaultMenu));
}

// Logic to update existing items if their image paths are still Unsplash links for these specific IDs
const idsToUpdate = [1, 2, 3, 4, 5, 6, 7, 9, 13];
let updated = false;
menuItems = menuItems.map(item => {
    if (idsToUpdate.includes(item.id)) {
        const defaultItem = defaultMenu.find(d => d.id === item.id);
        if (item.image !== defaultItem.image || item.price !== defaultItem.price) {
            updated = true;
            return { ...item, image: defaultItem.image, price: defaultItem.price };
        }
    }
    return item;
});

// Ensure items recently restored (like Chips Mayai) are put back if they were missing
defaultMenu.forEach(dItem => {
    if (!menuItems.some(item => item.id === dItem.id)) {
        menuItems.push(dItem);
        updated = true;
    }
});

if (updated) {
    localStorage.setItem('regina_menu', JSON.stringify(menuItems));
}



let cart = [];
let userLocation = null;


function toggleMobileMenu() {
    const nav = document.getElementById('nav-links');
    if (window.innerWidth <= 768) {
        nav.classList.toggle('active');
    }
}

function initMenu(items = menuItems) {
    const grid = document.getElementById('menu-grid');
    grid.innerHTML = items.map(item => `
        <div class="food-card" style="animation: zoomIn 0.5s ease-out forwards;">
            <div class="food-img-wrapper">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="food-info">
                <span class="food-category">${item.category}</span>
                <h3 class="food-name">${item.name}</h3>
                <p class="food-price">${item.price.toLocaleString()} TZS</p>
                <button class="add-btn" onclick="addToCart(${item.id})">Weka Kwenye Agizo</button>
            </div>
        </div>
    `).join('');
}

function filterMenu(category, event) {
    // Clear search input
    document.getElementById('menu-search').value = "";

    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (event) event.target.classList.add('active');
    
    if (category === 'Zote') {
        initMenu(menuItems);
    } else {
        const filtered = menuItems.filter(item => item.category === category);
        initMenu(filtered);
    }
}

function searchMenu() {
    const query = document.getElementById('menu-search').value.toLowerCase();
    
    // Reset category buttons to 'Zote'
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.filter-btn').classList.add('active');

    const filtered = menuItems.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.category.toLowerCase().includes(query)
    );
    
    initMenu(filtered);
}


function addToCart(id) {
    const item = menuItems.find(m => m.id === id);
    const existing = cart.find(c => c.id === id);
    
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    
    updateCartUI();
    openCart();
}

function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const totalPrice = document.getElementById('total-price');
    
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.innerText = count;
    
    cartItems.innerHTML = cart.map(item => `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; background:rgba(255,255,255,0.05); padding:1rem; border-radius:12px;">
            <div>
                <h4 style="margin:0">${item.name}</h4>
                <p style="color:var(--text-muted); font-size:0.9rem;">${item.price.toLocaleString()} TZS x ${item.quantity}</p>
            </div>
            <button onclick="removeFromCart(${item.id})" style="background:none; border:none; color:var(--primary); cursor:pointer;">Ondoa</button>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalPrice.innerText = `${total.toLocaleString()} TZS`;
    document.getElementById('payment-total').innerText = `${total.toLocaleString()} TZS`;
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
}

function openCart() {
    document.getElementById('cart-sidebar').classList.add('active');
}

function closeCart() {
    document.getElementById('cart-sidebar').classList.remove('active');
}

function openPayment() {
    if (cart.length === 0) {
        alert("Agizo lako ni tupu! Ongeza chakula kidogo kwanza.");
        return;
    }
    document.getElementById('payment-modal').classList.add('active');
    closeCart();
}

function closePayment() {
    document.getElementById('payment-modal').classList.remove('active');
}

function handleCheckout(e) {
    if (e) e.preventDefault();
    
    const processing = document.getElementById('payment-processing');
    processing.style.display = 'flex';
    
    // Simulate payment processing time
    setTimeout(() => {
        processing.style.display = 'none';
        
        // Save Order for Admin
        const orders = JSON.parse(localStorage.getItem('regina_orders') || '[]');
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const newOrder = {
            id: Date.now(),
            customer: document.querySelector('#checkout-form input[type="text"]').value,
            address: document.getElementById('delivery-address').value,
            location: userLocation,
            items: [...cart],
            total: total,
            status: 'Inasubiri',
            date: new Date().toLocaleString()
        };
        orders.push(newOrder);
        localStorage.setItem('regina_orders', JSON.stringify(orders));

        alert("🎉 Agizo Limepokelewa! REGINA anakuandalia chakula chako. Asante!");
        cart = [];
        userLocation = null;
        updateCartUI();
        closePayment();
    }, 2500);
}

function runDemo() {
    // 1. Clear existing cart
    cart = [];
    updateCartUI();
    
    // 2. Add sample items with delay
    setTimeout(() => {
        addToCart(1); // Mandazi
        setTimeout(() => {
            addToCart(8); // Samaki
            setTimeout(() => {
                addToCart(7); // Juice
                setTimeout(() => {
                    // 3. Open Payment Modal
                    openPayment();
                    
                    // 4. Fill Demo Data
                    const inputs = document.querySelectorAll('#checkout-form input');
                    const demoData = ["Ali Juma", "Morocco St, Dar Es Salaam", "4242 4242 4242 4242", "12/28", "123"];
                    inputs.forEach((input, i) => {
                        input.value = demoData[i] || "";
                    });
                    
                    // Simulate location for demo
                    userLocation = { lat: -6.7924, lng: 39.2727 }; // Darling, Dar Es Salaam
                    document.getElementById('get-location-btn').innerText = "✅";
                    document.getElementById('delivery-address').value = "Morocco St, Dar Es Salaam (Pinned)";
                }, 1500);
            }, 800);
        }, 800);
    }, 500);
}

// Event Listeners
document.getElementById('cart-trigger').addEventListener('click', openCart);
document.getElementById('close-cart').addEventListener('click', closeCart);
document.getElementById('close-payment').addEventListener('click', closePayment);
document.getElementById('checkout-btn').addEventListener('click', openPayment);
document.getElementById('checkout-form').addEventListener('submit', handleCheckout);
// document.getElementById('run-demo-btn').addEventListener('click', runDemo);

document.getElementById('get-location-btn').addEventListener('click', () => {
    if (!navigator.geolocation) {
        alert("Vivinjari vyako havitumii geolocation.");
        return;
    }

    const btn = document.getElementById('get-location-btn');
    btn.innerText = "⏳";
    
    navigator.geolocation.getCurrentPosition((position) => {
        userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        btn.innerText = "✅";
        document.getElementById('delivery-address').value = `Iliyochukuliwa (Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(4)})`;
    }, (error) => {
        console.error(error);
        alert("Imeshindwa kupata eneo lako. Tafadhali andika anwani yako.");
        btn.innerText = "📍";
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initMenu();
});
