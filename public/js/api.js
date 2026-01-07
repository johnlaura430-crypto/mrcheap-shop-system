// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : '/api';

// API Service
const ApiService = {
    // ===== PRODUCTS =====
    async getProducts() {
        try {
            const response = await fetch(`${API_BASE_URL}/products`);
            if (!response.ok) throw new Error('Failed to fetch products');
            return await response.json();
        } catch (error) {
            console.error('Error fetching products:', error);
            showNotification('Failed to load products', 'error');
            return [];
        }
    },

    async getLowStockProducts() {
        try {
            const response = await fetch(`${API_BASE_URL}/products/low-stock`);
            if (!response.ok) throw new Error('Failed to fetch low stock');
            return await response.json();
        } catch (error) {
            console.error('Error fetching low stock:', error);
            return [];
        }
    },

    async createProduct(productData) {
        try {
            const response = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData)
            });
            
            if (!response.ok) throw new Error('Failed to create product');
            
            const data = await response.json();
            showNotification(`Product "${data.name}" added successfully!`, 'success');
            return data;
        } catch (error) {
            console.error('Error creating product:', error);
            showNotification('Failed to add product', 'error');
            throw error;
        }
    },

    async updateProduct(id, productData) {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData)
            });
            
            if (!response.ok) throw new Error('Failed to update product');
            
            const data = await response.json();
            showNotification(`Product "${data.name}" updated!`, 'success');
            return data;
        } catch (error) {
            console.error('Error updating product:', error);
            showNotification('Failed to update product', 'error');
            throw error;
        }
    },

    async deleteProduct(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete product');
            
            showNotification('Product deleted successfully!', 'success');
            return true;
        } catch (error) {
            console.error('Error deleting product:', error);
            showNotification('Failed to delete product', 'error');
            throw error;
        }
    },

    // ===== PURCHASES =====
    async createPurchase(purchaseData) {
        try {
            const response = await fetch(`${API_BASE_URL}/purchases`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(purchaseData)
            });
            
            if (!response.ok) throw new Error('Failed to record purchase');
            
            const data = await response.json();
            showNotification(`Purchase recorded! Total: TZS ${data.total.toLocaleString()}`, 'success');
            return data;
        } catch (error) {
            console.error('Error creating purchase:', error);
            showNotification('Failed to record purchase', 'error');
            throw error;
        }
    },

    async getPurchases() {
        try {
            const response = await fetch(`${API_BASE_URL}/purchases`);
            if (!response.ok) throw new Error('Failed to fetch purchases');
            return await response.json();
        } catch (error) {
            console.error('Error fetching purchases:', error);
            return [];
        }
    },

    // ===== SALES =====
    async createSale(saleData) {
        try {
            const response = await fetch(`${API_BASE_URL}/sales`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(saleData)
            });
            
            if (!response.ok) throw new Error('Failed to record sale');
            
            const data = await response.json();
            showNotification(`Sale recorded! Total: TZS ${data.total.toLocaleString()}`, 'success');
            return data;
        } catch (error) {
            console.error('Error creating sale:', error);
            showNotification('Failed to record sale', 'error');
            throw error;
        }
    },

    async getTodaySales() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await fetch(`${API_BASE_URL}/sales/today?date=${today}`);
            if (!response.ok) throw new Error('Failed to fetch today sales');
            return await response.json();
        } catch (error) {
            console.error('Error fetching today sales:', error);
            return { total: 0, count: 0 };
        }
    }
};

// Helper function for notifications
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) existingNotification.remove();

    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

// Add CSS for notifications
const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
    }
    
    .notification-success {
        background: var(--success);
        border-left: 4px solid #1e7e34;
    }
    
    .notification-error {
        background: var(--danger);
        border-left: 4px solid #bd2130;
    }
    
    .notification-info {
        background: var(--primary);
        border-left: 4px solid var(--secondary);
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        margin-left: auto;
        font-size: 1.2rem;
    }
    
    .fade-out {
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);
