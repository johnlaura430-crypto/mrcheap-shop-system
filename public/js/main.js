// ===== GLOBAL VARIABLES =====
let categories = ['drinks', 'snacks', 'groceries', 'household', 'electronics'];

// ===== DOM ELEMENTS =====
const sidebar = document.getElementById('sidebar');
const toggleSidebar = document.getElementById('toggleSidebar');
const addProductNavBtn = document.getElementById('addProductNavBtn');
const quickAddProduct = document.getElementById('quickAddProduct');
const addProductModal = document.getElementById('addProductModal');
const closeProductModal = document.getElementById('closeProductModal');
const cancelProduct = document.getElementById('cancelProduct');
const purchaseNavBtn = document.getElementById('purchaseNavBtn');
const quickPurchase = document.getElementById('quickPurchase');
const purchaseModal = document.getElementById('purchaseModal');
const closePurchaseModal = document.getElementById('closePurchaseModal');
const cancelPurchase = document.getElementById('cancelPurchase');
const inventoryBtn = document.getElementById('inventoryBtn');
const viewInventoryBtn = document.getElementById('viewInventoryBtn');
const inventoryModal = document.getElementById('inventoryModal');
const closeInventoryModal = document.getElementById('closeInventoryModal');
const closeInventoryBtn = document.getElementById('closeInventoryBtn');
const addNewFromInventory = document.getElementById('addNewFromInventory');
const logoutBtn = document.getElementById('logoutBtn');
const productForm = document.getElementById('productForm');
const purchaseForm = document.getElementById('purchaseForm');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const newCategoryInput = document.getElementById('newCategory');
const currentDate = document.getElementById('currentDate');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async function() {
    // Set current date
    const now = new Date();
    currentDate.textContent = now.toLocaleDateString('en-TZ', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Initialize categories
    renderCategories();
    
    // Initialize dashboard with real data
    await UIService.initializeDashboard();
    
    console.log('✅ MrCheap Tanzania Dashboard loaded!');
});

// ===== SIDEBAR TOGGLE =====
toggleSidebar.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// ===== NAVIGATION =====
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        
        // Handle specific nav clicks
        const text = this.querySelector('span').textContent;
        if (text === 'Add Product') openAddProductModal();
        if (text === 'Make Purchase') openPurchaseModal();
        if (text === 'Inventory') openInventoryModal();
        if (text === 'Sales') openSalesModal(); // You'll create this
        if (text === 'Reports') openReportsModal(); // You'll create this
    });
});

// ===== ADD PRODUCT MODAL =====
function openAddProductModal() {
    // Reset form for new product
    productForm.reset();
    productForm.onsubmit = handleAddProductSubmit;
    
    // Reset modal title
    const modal = document.getElementById('addProductModal');
    modal.querySelector('h2').innerHTML = `<i class="fas fa-plus-circle" style="color: var(--primary); margin-right: 10px;"></i> Add New Product`;
    
    addProductModal.classList.add('active');
    document.getElementById('productName').focus();
}

async function handleAddProductSubmit(e) {
    e.preventDefault();
    
    const product = {
        code: document.getElementById('productCode').value.trim(),
        name: document.getElementById('productName').value.trim(),
        buyingPrice: parseInt(document.getElementById('buyingPrice').value) || 0,
        sellingPrice: parseInt(document.getElementById('sellingPrice').value) || 0,
        stock: parseInt(document.getElementById('initialStock').value) || 0,
        minStock: parseInt(document.getElementById('minStock').value) || 10,
        category: document.getElementById('productCategory').value || 'uncategorized',
        description: document.getElementById('productDescription').value.trim()
    };
    
    try {
        await ApiService.createProduct(product);
        await UIService.updateInventoryTable();
        await UIService.updateProductDropdown();
        closeAddProductModal();
    } catch (error) {
        console.error('Error adding product:', error);
    }
}

quickAddProduct.addEventListener('click', openAddProductModal);
addProductNavBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openAddProductModal();
});

function closeAddProductModal() {
    addProductModal.classList.remove('active');
    productForm.reset();
}

closeProductModal.addEventListener('click', closeAddProductModal);
cancelProduct.addEventListener('click', closeAddProductModal);

// ===== PURCHASE MODAL =====
async function openPurchaseModal() {
    await UIService.updateProductDropdown();
    purchaseModal.classList.add('active');
    document.getElementById('supplierName').focus();
}

async function handlePurchaseSubmit(e) {
    e.preventDefault();
    
    const purchase = {
        productId: document.getElementById('selectProduct').value,
        supplier: document.getElementById('supplierName').value.trim(),
        quantity: parseInt(document.getElementById('purchaseQuantity').value) || 0,
        price: parseInt(document.getElementById('purchasePrice').value) || 0,
        notes: document.getElementById('purchaseNotes').value.trim()
    };
    
    try {
        await ApiService.createPurchase(purchase);
        await UIService.updateInventoryTable();
        await UIService.updateProductDropdown();
        closePurchaseModal();
    } catch (error) {
        console.error('Error recording purchase:', error);
    }
}

quickPurchase.addEventListener('click', openPurchaseModal);
purchaseNavBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openPurchaseModal();
});

function closePurchaseModal() {
    purchaseModal.classList.remove('active');
    purchaseForm.reset();
}

closePurchaseModal.addEventListener('click', closePurchaseModal);
cancelPurchase.addEventListener('click', closePurchaseModal);

// Update purchase form handler
purchaseForm.onsubmit = handlePurchaseSubmit;

// ===== INVENTORY MODAL =====
async function openInventoryModal() {
    await UIService.updateInventoryTable();
    inventoryModal.classList.add('active');
}

viewInventoryBtn.addEventListener('click', openInventoryModal);
inventoryBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openInventoryModal();
});

closeInventoryModal.addEventListener('click', () => inventoryModal.classList.remove('active'));
closeInventoryBtn.addEventListener('click', () => inventoryModal.classList.remove('active'));
addNewFromInventory.addEventListener('click', () => {
    inventoryModal.classList.remove('active');
    setTimeout(openAddProductModal, 300);
});

// ===== CATEGORY MANAGEMENT =====
function renderCategories() {
    const categoryTags = document.getElementById('categoryTags');
    if (!categoryTags) return;
    
    categoryTags.innerHTML = '';
    categories.forEach(category => {
        const tag = document.createElement('div');
        tag.className = 'category-tag';
        tag.innerHTML = `
            ${category.charAt(0).toUpperCase() + category.slice(1)}
            <span class="delete-category" data-category="${category}">&times;</span>
        `;
        categoryTags.appendChild(tag);
    });
    
    // Add delete handlers
    document.querySelectorAll('.delete-category').forEach(btn => {
        btn.addEventListener('click', function() {
            const cat = this.getAttribute('data-category');
            if (confirm(`Delete category "${cat}"? This won't delete products in this category.`)) {
                categories = categories.filter(c => c !== cat);
                renderCategories();
                updateCategoryDropdown();
            }
        });
    });
}

function updateCategoryDropdown() {
    const select = document.getElementById('productCategory');
    if (!select) return;
    
    select.innerHTML = '<option value="">Select category</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        select.appendChild(option);
    });
}

addCategoryBtn.addEventListener('click', function() {
    const newCat = newCategoryInput.value.trim().toLowerCase();
    if (newCat && !categories.includes(newCat)) {
        categories.push(newCat);
        renderCategories();
        updateCategoryDropdown();
        newCategoryInput.value = '';
        document.getElementById('productCategory').value = newCat;
    }
});

// ===== LOGOUT =====
logoutBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to logout?')) {
        showNotification('Logged out successfully!', 'success');
        // In real app: redirect to login page
        // window.location.href = '/login';
    }
});

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Auto-refresh data every 30 seconds
setInterval(async () => {
    await UIService.updateInventoryTable();
}, 30000);
