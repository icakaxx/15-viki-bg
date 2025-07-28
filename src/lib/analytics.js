// Simple analytics utility for tracking user interactions and performance

class Analytics {
  constructor() {
    this.events = [];
    this.isEnabled = process.env.NODE_ENV === 'production';
  }

  // Track page views
  trackPageView(page, title) {
    if (!this.isEnabled) return;
    
    const event = {
      type: 'pageview',
      page,
      title,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer
    };
    
    this.events.push(event);
    this.sendEvent(event);
  }

  // Track user interactions
  trackEvent(category, action, label = null, value = null) {
    if (!this.isEnabled) return;
    
    const event = {
      type: 'event',
      category,
      action,
      label,
      value,
      timestamp: new Date().toISOString()
    };
    
    this.events.push(event);
    this.sendEvent(event);
  }

  // Track performance metrics
  trackPerformance(metric, value) {
    if (!this.isEnabled) return;
    
    const event = {
      type: 'performance',
      metric,
      value,
      timestamp: new Date().toISOString()
    };
    
    this.events.push(event);
    this.sendEvent(event);
  }

  // Track e-commerce events
  trackEcommerce(action, productId, productName, value = null) {
    if (!this.isEnabled) return;
    
    const event = {
      type: 'ecommerce',
      action,
      productId,
      productName,
      value,
      timestamp: new Date().toISOString()
    };
    
    this.events.push(event);
    this.sendEvent(event);
  }

  // Send event to analytics endpoint
  async sendEvent(event) {
    try {
      
      // Example: Send to your API endpoint
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event)
      // });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  // Get all events (for debugging)
  getEvents() {
    return this.events;
  }

  // Clear events
  clearEvents() {
    this.events = [];
  }
}

// Create singleton instance
const analytics = new Analytics();

// Export functions for easy use
export const trackPageView = (page, title) => analytics.trackPageView(page, title);
export const trackEvent = (category, action, label, value) => analytics.trackEvent(category, action, label, value);
export const trackPerformance = (metric, value) => analytics.trackPerformance(metric, value);
export const trackEcommerce = (action, productId, productName, value) => analytics.trackEcommerce(action, productId, productName, value);

export default analytics; 