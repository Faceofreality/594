/**
 * Site Protection Status Indicator for 594 ANTI EXTORT
 * This adds a visual indicator that the protection system is active
 */

document.addEventListener('DOMContentLoaded', function() {
  // Wait for protection system to initialize
  setTimeout(function() {
    // Create status indicator element
    const statusElement = document.createElement('div');
    statusElement.className = 'protection-status';
    statusElement.innerHTML = `
      <div class="protection-icon">
        <div class="protection-circle"></div>
      </div>
      <div class="protection-tooltip">
        <div class="protection-header">
          <span class="protection-title">594 PROTECTION</span>
          <span class="protection-status-text">ACTIVE</span>
        </div>
        <div class="protection-info">
          <div class="protection-detail">
            <span class="label">Visitor ID:</span>
            <span class="value">${localStorage.getItem('visitor_id') || 'Unknown'}</span>
          </div>
          <div class="protection-detail">
            <span class="label">Visit count:</span>
            <span class="value">${localStorage.getItem('visit_count') || '1'}</span>
          </div>
          <div class="protection-detail">
            <span class="label">Cache status:</span>
            <span class="value">Active</span>
          </div>
        </div>
      </div>
    `;
    
    // Add styles for status indicator
    const styles = `
      .protection-status {
        position: fixed;
        bottom: 20px;
        left: 20px;
        z-index: 999;
      }
      
      .protection-icon {
        width: 15px;
        height: 15px;
        border-radius: 50%;
        background-color: #222;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: 1px solid #333;
        box-shadow: 0 0 5px rgba(255, 0, 0, 0.3);
      }
      
      .protection-circle {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background-color: #ff0000;
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0% {
          opacity: 0.5;
          transform: scale(0.8);
        }
        50% {
          opacity: 1;
          transform: scale(1.2);
        }
        100% {
          opacity: 0.5;
          transform: scale(0.8);
        }
      }
      
      .protection-tooltip {
        position: absolute;
        bottom: 25px;
        left: 0;
        width: 220px;
        background-color: #111;
        border: 1px solid #333;
        border-radius: 3px;
        padding: 10px;
        font-family: monospace;
        font-size: 12px;
        color: #ccc;
        display: none;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
      }
      
      .protection-status:hover .protection-tooltip {
        display: block;
      }
      
      .protection-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        padding-bottom: 5px;
        border-bottom: 1px solid #333;
      }
      
      .protection-title {
        font-weight: bold;
        font-size: 11px;
      }
      
      .protection-status-text {
        color: #ff0000;
        font-size: 10px;
      }
      
      .protection-info {
        font-size: 10px;
      }
      
      .protection-detail {
        margin: 5px 0;
        display: flex;
        justify-content: space-between;
      }
      
      .protection-detail .label {
        color: #666;
      }
    `;
    
    // Add styles to document
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    
    // Add status indicator to document
    document.body.appendChild(statusElement);
    
    // Log status to console
    console.log('[Protection Status] Protection indicator added to page');
  }, 1000); // Wait 1 second for protection to initialize
});