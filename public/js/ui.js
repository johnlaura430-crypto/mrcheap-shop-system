// UI Service
const UIService = {
    // Update inventory table with real data
    async updateInventoryTable() {
        const products = await ApiService.getProducts();
        const tbody = document.getElementById('inventoryTableBody');
        
        if (!products || products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 40px; color: var(--gray);">
                        <i class="fas fa-box-open" style="font-size: 2rem; margin-bottom: 10px;"></i>
                        <p>No products in inventory</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = '';
        products.forEach(product => {
            const row = document.createElement('tr');
            const stockClass = product.stock < product.minStock ? 'stock-low' : 'stock-ok';
            const profit = product.sellingPrice - product.buyingPrice;
            const profitPercentage = product.buyingPrice > 0 
                ? ((profit / product.buyingPrice) * 100).toFixed(1) 
                : 0;
            
            row.innerHTML = `
                <td><strong>${product.code}</strong></td>
                <td>${product.name}</td>
                <td class="${stockClass}">
                    ${product.stock} <small>(${product.minStock} min)</small>
                </td>
                <td><span class="currency-badge">TZS ${product.buyingPrice.toLocaleString()}</span></td>
                <td><span class="currency-badge">TZS ${product.sellingPrice.toLocaleString()}</span></td>
                <td>${product.category?.charAt(0)?.toUpperCase() + product.category?.slice(1) || 'Uncategorized'}</td>
                <td>
                    <span class="profit-badge ${profit >= 0 ? 'profit-positive' : 'profit-negative'}">
                        ${profit >= 0 ? '+' : ''}TZS ${profit.toLocaleString()} (${profitPercentage}%)
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-edit" onclick="UIService.editProduct('${product._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-delete" onclick="UIService.deleteProduct('${product._id}', '${product.name}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        // Update dashboard summary
        this.updateDashboardSummary(products);
    },

    // Update product dropdown for purchase modal
    async updateProductDropdown() {
        const products = await ApiService.getProducts();
        const select = document.getElementById('selectProduct');
        
        if (!select) return;
        
        select.innerHTML = '<option value="">Choose product</option>';
        
        if (products && products.length > 0) {
            products.forEach(product => {
                const option = document.createElement('option');
                option.value = product._id;
                option.textContent = `${product.code} - ${product.name} (Stock: ${product.stock})`;
                select.appendChild(option);
            });
        }
    },

    // Update dashboard summary
    async updateDashboardSummary(products) {
        // Update inventory summary
        const inventorySection = document.querySelector('.dashboard-section:nth-child(3) .empty-state');
        if (products && products.length > 0) {
            const totalStockValue = products.reduce((total, p) => total + (p.stock * p.buyingPrice), 0);
            const totalItems = products.reduce((total, p) => total + p.stock, 0);
            
            inventorySection.innerHTML = `
                <i class="fas fa-boxes" style="color: var(--primary);"></i>
                <h3>${products.length} Products in Inventory</h3>
                <p>${totalItems} total items | Value: TZS ${totalStockValue.toLocaleString()}</p>
            `;
        }
        
        // Check for low stock alerts
        const lowStockItems = products ? products.filter(p => p.stock < p.minStock) : [];
        const lowStockSection = document.querySelector('.dashboard-section:nth-child(4)');
        
        if (lowStockItems.length > 0) {
            lowStockSection.querySelector('.section-header span').className = 'btn btn-danger';
            lowStockSection.querySelector('.section-header span').textContent = `${lowStockItems.length} Alerts`;
            
            let alertHTML = '<div style="text-align: left; padding: 20px;">';
            lowStockItems.forEach(item => {
                alertHTML += `
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                        <span><strong>${item.code}</strong> - ${item.name}</span>
                        <span class="stock-low">${item.stock} left (min: ${item.minStock})</span>
                    </div>
                `;
            });
            alertHTML += '</div>';
            
            lowStockSection.querySelector('.empty-state').innerHTML = alertHTML;
        } else if (lowStockSection) {
            lowStockSection.querySelector('.section-header span').className = 'btn btn-secondary';
            lowStockSection.querySelector('.section-header span').textContent = 'No Alerts';
            
            lowStockSection.querySelector('.empty-state').innerHTML = `
                <i class="fas fa-check-circle" style="color: var(--success);"></i>
                <h3>All items are in stock</h3>
                <p>Set minimum stock levels to receive alerts</p>
            `;
        }
        
        // Update today's summary
        await this.updateTodaySummary();
    },

    // Update today's summary
    async updateTodaySummary() {
        const todaySales = await ApiService.getTodaySales();
        const todaySummary = document.querySelector('.dashboard-section:last-child');
        
        if (todaySummary) {
            todaySummary.querySelector('h1:nth-child(1)').textContent = `TZS ${todaySales.total.toLocaleString()}`;
            todaySummary.querySelector('h1:nth-child(2)').textContent = todaySales.count || 0;
        }
        
        // Update quick actions today sales
        const todaySalesCard = document.querySelector('.today-sales .action-info p');
        if (todaySalesCard) {
            todaySalesCard.textContent = `TZS ${todaySales.total.toLocaleString()} | ${todaySales.count} items sold`;
        }
    },

    // Edit product
    async editProduct(id) {
        try {
            const products = await ApiService.getProducts();
            const product = products.find(p => p._id === id);
            
            if (!product) {
                showNotification('Product not found', 'error');
                return;
            }
            
            // Fill form with product data
            document.getElementById('productName').value = product.name;
            document.getElementById('productCode').value = product.code;
            document.getElementById('buyingPrice').value = product.buyingPrice;
            document.getElementById('sellingPrice').value = product.sellingPrice;
            document.getElementById('initialStock').value = product.stock;
            document.getElementById('minStock').value = product.minStock;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productDescription').value = product.description || '';
            
            // Change modal title and submit button
            const modal = document.getElementById('addProductModal');
            modal.querySelector('h2').innerHTML = `<i class="fas fa-edit" style="color: var(--primary); margin-right: 10px;"></i> Edit Product`;
            
            // Update form submit handler
            const form = document.getElementById('productForm');
            form.onsubmit = async (e) => {
                e.preventDefault();
                
                const updatedProduct = {
                    name: document.getElementById('productName').value.trim(),
                    code: document.getElementById('productCode').value.trim(),
                    buyingPrice: parseInt(document.getElementById('buyingPrice').value) || 0,
                    sellingPrice: parseInt(document.getElementById('sellingPrice').value) || 0,
                    stock: parseInt(document.getElementById('initialStock').value) || 0,
                    minStock: parseInt(document.getElementById('minStock').value) || 10,
                    category: document.getElementById('productCategory').value || 'uncategorized',
                    description: document.getElementById('productDescription').value.trim()
                };
                
                await ApiService.updateProduct(id, updatedProduct);
                await this.updateInventoryTable();
                await this.updateProductDropdown();
                closeAddProductModal();
            };
            
            // Open modal
            openAddProductModal();
            
        } catch (error) {
            console.error('Error editing product:', error);
            showNotification('Failed to edit product', 'error');
        }
    },

    // Delete product
    async deleteProduct(id, name) {
        if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            return;
        }
        
        try {
            await ApiService.deleteProduct(id);
            await this.updateInventoryTable();
            await this.updateProductDropdown();
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    },

    // Initialize dashboard
    async initializeDashboard() {
        try {
            // Load all data
            const [products, lowStockItems, todaySales] = await Promise.all([
                ApiService.getProducts(),
                ApiService.getLowStockProducts(),
                ApiService.getTodaySales()
            ]);
            
            // Update all UI components
            await this.updateInventoryTable();
            await this.updateProductDropdown();
            await this.updateDashboardSummary(products);
            
            console.log('✅ Dashboard initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize dashboard:', error);
            showNotification('Failed to load dashboard data', 'error');
        }
    }
};

// Add CSS for action buttons and profit badges
const additionalStyles = `
    .action-buttons {
        display: flex;
        gap: 5px;
    }
    
    .btn-sm {
        padding: 5px 10px;
        font-size: 0.8rem;
    }
    
    .btn-edit {
        background: var(--warning);
        color: white;
        border: none;
    }
    
    .btn-edit:hover {
        background: #e0a800;
    }
    
    .btn-delete {
        background: var(--danger);
        color: white;
        border: none;
    }
    
    .btn-delete:hover {
        background: #c82333;
    }
    
    .profit-badge {
        padding: 3px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 500;
    }
    
    .profit-positive {
        background: #d4edda;
        color: #155724;
    }
    
    .profit-negative {
        background: #f8d7da;
        color: #721c24;
    }
`;

// Inject additional styles
const additionalStyleSheet = document.createElement("style");
additionalStyleSheet.textContent = additionalStyles;
document.head.appendChild(additionalStyleSheet);
