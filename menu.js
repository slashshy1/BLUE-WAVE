// ==========================================================================
// BLUE WAVE EATS - ISOLATED PORTAL NAVIGATION ENGINE
// ==========================================================================

function openCategoryGate(categoryKey, categoryTitle) {
    const gateView = document.getElementById('category-gate-view');
    const itemsView = document.getElementById('food-items-view');
    const titleText = document.getElementById('active-category-title-text');
    
    if (!gateView || !itemsView) return;

    // 1. Set the dynamic header title text context
    if (titleText) titleText.innerText = categoryTitle;

    // 2. Hide all items initially, then filter out and flex the selected class array
    const items = document.querySelectorAll('.menu-item');
    items.forEach(item => {
        if (item.classList.contains(categoryKey)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });

    // 3. Smooth fade out animation sequence for the cover panels
    gateView.classList.add('opacity-0', 'pointer-events-none');
    
    setTimeout(() => {
        gateView.classList.add('hidden');
        
        // 4. Slide up and reveal the items grid view frame
        itemsView.classList.remove('hidden');
        setTimeout(() => {
            itemsView.classList.remove('opacity-0', 'translate-y-4');
            itemsView.classList.add('opacity-100', 'translate-y-0');
            
            // 5. Seamlessly auto-scroll page layout focus to the menu section
            document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
    }, 350);
}

function closeCategoryGate() {
    const gateView = document.getElementById('category-gate-view');
    const itemsView = document.getElementById('food-items-view');
    
    if (!gateView || !itemsView) return;

    // 1. Animate items sliding out downwards
    itemsView.classList.remove('opacity-100', 'translate-y-0');
    itemsView.classList.add('opacity-0', 'translate-y-4');

    setTimeout(() => {
        itemsView.classList.add('hidden');
        
        // 2. Restore the category gate overview grid
        gateView.classList.remove('hidden');
        setTimeout(() => {
            gateView.classList.remove('opacity-0', 'pointer-events-none');
        }, 50);
    }, 350);
}// ==========================================
// FIX: ADDED MISSING SIDEBAR & DASHBOARD CONTROLLERS
// ==========================================

/**
 * Toggles the visibility and sliding position of the Category Sidebar panel.
 */
function toggleCategorySidebar() {
    const sidebar = document.getElementById('category-sidebar');
    if (sidebar) {
        sidebar.classList.toggle('-translate-x-full');
        sidebar.classList.toggle('invisible');
    }
}

/**
 * Filters the displayed food items based on category selection from the sidebar.
 */
function filterMenu(categoryKey) {
    // Automatically close the sidebar drawer when a category option is selected
    toggleCategorySidebar();
    
    const gateView = document.getElementById('category-gate-view');
    const itemsView = document.getElementById('food-items-view');
    
    if (categoryKey === 'all') {
        // Force display the entire items grid container
        if (gateView) gateView.classList.add('hidden', 'opacity-0');
        if (itemsView) {
            itemsView.classList.remove('hidden', 'opacity-0', 'translate-y-4');
            itemsView.classList.add('opacity-100', 'translate-y-0');
        }
        
        // Unhide all item rows globally
        const items = document.querySelectorAll('.menu-item');
        items.forEach(item => item.style.display = 'flex');
        
        const titleText = document.getElementById('active-category-title-text');
        if (titleText) titleText.innerText = "✨ All Matrix Dishes";
    } else {
        // Map category keys back to your high-end cinematic titles
        const categoryTitles = {
            'combos': 'Curated Combo Arrays',
            'swallow': 'Traditional Native Swallows',
            'grains': 'Firewood Grain Arrays',
            'chops': 'Sizzling Finger Foods',
            'seafood': 'Coastal Seafood Array'
        };
        
        // Pass control straight to your portal navigation engine
        openCategoryGate(categoryKey, categoryTitles[categoryKey] || 'Category Panel');
    }
}

/**
 * Filters the menu item matrix dynamically as the user types in the search field.
 */
function searchFoodItems() {
    const query = document.getElementById('menu-search-input').value.toLowerCase().trim();
    const gateView = document.getElementById('category-gate-view');
    const itemsView = document.getElementById('food-items-view');
    const items = document.querySelectorAll('.menu-item');
    
    if (query !== "") {
        // Bypass the category gate setup to display standard filter results
        if (gateView) gateView.classList.add('hidden', 'opacity-0');
        if (itemsView) {
            itemsView.classList.remove('hidden', 'opacity-0', 'translate-y-4');
            itemsView.classList.add('opacity-100', 'translate-y-0');
        }
        
        // Track down text matches using your data attributes
        items.forEach(item => {
            const foodNameStr = item.getAttribute('data-food-name') ? item.getAttribute('data-food-name').toLowerCase() : "";
            if (foodNameStr.includes(query)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
        
        const titleText = document.getElementById('active-category-title-text');
        if (titleText) titleText.innerText = `Search Matrix Results for: "${query}"`;
    } else {
        // Reset seamlessly back to the default category gate view if the field is cleared
        closeCategoryGate();
    }
}