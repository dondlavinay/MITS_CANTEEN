// Rating display functions
function displayStars(rating, maxStars = 5) {
    let stars = '';
    for (let i = 1; i <= maxStars; i++) {
        if (i <= rating) {
            stars += '<span style="color: #ffd700;">⭐</span>';
        } else {
            stars += '<span style="color: #ddd;">⭐</span>';
        }
    }
    return stars;
}

// Add rating display to menu items
function addRatingToMenuItem(itemElement, averageRating = 0, totalRatings = 0) {
    const ratingDiv = document.createElement('div');
    ratingDiv.className = 'item-rating';
    ratingDiv.style.cssText = 'margin-top: 8px; text-align: center; font-size: 0.9rem;';
    
    if (totalRatings > 0) {
        ratingDiv.innerHTML = `
            <div>${displayStars(Math.round(averageRating))}</div>
            <div style="color: #666; margin-top: 2px;">${averageRating.toFixed(1)}/5 (${totalRatings} reviews)</div>
        `;
    } else {
        ratingDiv.innerHTML = `
            <div>${displayStars(0)}</div>
            <div style="color: #666; margin-top: 2px;">No ratings yet</div>
        `;
    }
    
    itemElement.appendChild(ratingDiv);
}

// Load and display ratings for menu items
async function loadMenuItemRatings() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    for (const item of menuItems) {
        const itemId = item.dataset.itemId;
        if (itemId) {
            try {
                const response = await fetch(`/api/ratings/item/${itemId}`);
                if (response.ok) {
                    const data = await response.json();
                    addRatingToMenuItem(item, data.averageRating, data.totalRatings);
                } else {
                    addRatingToMenuItem(item, 0, 0);
                }
            } catch (error) {
                console.error('Error loading ratings:', error);
                addRatingToMenuItem(item, 0, 0);
            }
        }
    }
}

// Rate menu item from order
async function rateMenuItem(itemId, orderId, rating, review = '') {
    try {
        const response = await fetch(`/api/ratings/item/${itemId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                rating,
                review,
                orderId
            })
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            const error = await response.json();
            throw new Error(error.message);
        }
    } catch (error) {
        throw error;
    }
}

// Initialize ratings on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load ratings for menu pages
    if (window.location.pathname.includes('.html') && 
        (window.location.pathname.includes('veg') || 
         window.location.pathname.includes('nonveg') || 
         window.location.pathname.includes('snacks') || 
         window.location.pathname.includes('juice') || 
         window.location.pathname.includes('icecream') || 
         window.location.pathname.includes('starters'))) {
        setTimeout(loadMenuItemRatings, 1000); // Wait for menu items to load
    }
});