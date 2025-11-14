class LiveTracking {
  constructor() {
    this.socket = null;
    this.orderId = null;
  }

  // Initialize tracking for an order
  init(orderId) {
    this.orderId = orderId;
    this.connectSocket();
    this.loadOrderDetails();
  }

  // Connect to Socket.IO for real-time updates
  connectSocket() {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.socket = io({
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('Connected to tracking service');
      this.socket.emit('joinOrderTracking', this.orderId);
    });

    this.socket.on('orderStatusUpdate', (data) => {
      if (data.orderId === this.orderId) {
        this.updateOrderStatus(data.status);
      }
    });

    this.socket.on('deliveryLocationUpdate', (data) => {
      if (data.orderId === this.orderId) {
        this.updateDeliveryLocation(data.location);
      }
    });
  }

  // Load order details from API
  async loadOrderDetails() {
    try {
      const response = await fetch(`/api/tracking/order/${this.orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const order = await response.json();
        this.displayOrderInfo(order);
      }
    } catch (error) {
      console.error('Error loading order details:', error);
    }
  }

  // Display order information
  displayOrderInfo(order) {
    document.getElementById('order-id').textContent = `Order #${order.id}`;
    document.getElementById('order-items').textContent = 
      order.items.map(item => `${item.menuItem.name} x${item.quantity}`).join(', ');
    document.getElementById('delivery-address').textContent = order.deliveryAddress;
    
    this.updateOrderStatus(order.status);
    
    if (order.deliveryPerson) {
      document.getElementById('delivery-person').textContent = order.deliveryPerson.name;
      document.getElementById('contact-info').textContent = `Contact: ${order.deliveryPerson.phone}`;
    }
  }

  // Update order status display
  updateOrderStatus(status) {
    const statusElement = document.getElementById('order-status');
    statusElement.className = `status-badge status-${status}`;
    
    const statusText = {
      'pending': 'Order Placed',
      'confirmed': 'Confirmed',
      'preparing': 'Preparing',
      'ready': 'Ready for Pickup',
      'delivered': 'Delivered'
    };
    
    statusElement.textContent = statusText[status] || status;
  }

  // Update delivery person location on map
  updateDeliveryLocation(location) {
    if (window.deliveryMarker) {
      window.map.removeLayer(window.deliveryMarker);
    }
    
    window.deliveryMarker = L.marker([location.latitude, location.longitude])
      .addTo(window.map)
      .bindPopup('🚚 Delivery Person');
  }

  // Share user location
  shareLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          
          // Send location to server
          this.socket.emit('userLocationUpdate', {
            orderId: this.orderId,
            location: location
          });
          
          // Update map
          if (window.userMarker) {
            window.map.removeLayer(window.userMarker);
          }
          
          window.userMarker = L.marker([location.latitude, location.longitude])
            .addTo(window.map)
            .bindPopup('📍 Your Location');
        },
        (error) => {
          console.error('Location error:', error);
          alert('Unable to get location. Please enable location services.');
        }
      );
    }
  }
}

// Export for use in HTML
window.LiveTracking = LiveTracking;