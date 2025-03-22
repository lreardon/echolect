// app/javascript/elements/with_tooltip_element.ts
class WithTooltipElement extends HTMLElement {
  private text: string = '';
  private _tooltipElement: HTMLDivElement | null = null;
  private _showTooltipBound: (event: MouseEvent) => void;
  private _hideTooltipBound: (event: MouseEvent) => void;

  constructor() {
    super();
    this._tooltipElement = null;
    this._showTooltipBound = this._showTooltip.bind(this);
    this._hideTooltipBound = this._hideTooltip.bind(this);
  }

  connectedCallback(): void {
    // Get the tooltip text from the attribute
    this.text = this.getAttribute('text') || '';
    
    // Add event listeners directly to this element
    this.addEventListener('mouseenter', this._showTooltipBound);
    this.addEventListener('mouseleave', this._hideTooltipBound);
  }
  
  disconnectedCallback(): void {
    // Remove event listeners
    this.removeEventListener('mouseenter', this._showTooltipBound);
    this.removeEventListener('mouseleave', this._hideTooltipBound);
    this._hideTooltip();
  }
  
  private _showTooltip(): void {
    // Clear any existing tooltip
    this._hideTooltip();
    
    const rect = this.getBoundingClientRect();
    
    // Create tooltip element
    this._tooltipElement = document.createElement('div');
    this._tooltipElement.className = 'tooltip';

    const contentElement = this.querySelector('tooltip-content');
    if (contentElement) {
      this._tooltipElement.innerHTML = contentElement.innerHTML;
    } else {
      this._tooltipElement.textContent = this.text;
    }

    // this._tooltipElement.textContent = this.text;
    
    // Calculate position (centered above element)
    const tooltipTop = rect.top - 8;
    const tooltipLeft = rect.left + (rect.width / 2);
    
    // Set basic styles
    Object.assign(this._tooltipElement.style, {
      position: 'fixed',
      top: `${tooltipTop}px`,
      left: `${tooltipLeft}px`,
      transform: 'translate(-50%, -100%)', // Center horizontally and position above
      zIndex: '9999',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '5px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      pointerEvents: 'none', // Let mouse events pass through
      opacity: '0',
      transition: 'opacity 0.2s'
    });
    
    // Add arrow
    const arrow = document.createElement('div');
    Object.assign(arrow.style, {
      position: 'absolute',
      bottom: '-5px',
      left: '50%',
      marginLeft: '-5px',
      borderWidth: '5px 5px 0',
      borderStyle: 'solid',
      borderColor: 'rgba(0, 0, 0, 0.8) transparent transparent'
    });
    this._tooltipElement.appendChild(arrow);
    
    // Append to body
    document.body.appendChild(this._tooltipElement);
    
    // Ensure tooltip stays within viewport
    this._adjustTooltipPosition();
    
    // Fade in
    setTimeout(() => {
      if (this._tooltipElement) {
        this._tooltipElement.style.opacity = '1';
      }
    }, 10);
  }
  
  private _adjustTooltipPosition(): void {
    if (!this._tooltipElement) return;
    
    const tooltipRect = this._tooltipElement.getBoundingClientRect();
    
    // Check if tooltip goes off the top
    if (tooltipRect.top < 0) {
      const elementRect = this.getBoundingClientRect();
      // Flip to bottom
      this._tooltipElement.style.top = `${elementRect.bottom + 8}px`;
      this._tooltipElement.style.transform = 'translate(-50%, 0)';
      
      // Flip arrow
      const arrow = this._tooltipElement.firstChild as HTMLElement;
      if (arrow) {
        Object.assign(arrow.style, {
          bottom: 'auto',
          top: '-5px',
          borderWidth: '0 5px 5px',
          borderColor: 'transparent transparent rgba(0, 0, 0, 0.8)'
        });
      }
    }
    
    // Check if tooltip goes off sides
    if (tooltipRect.left < 0) {
      this._tooltipElement.style.left = '8px';
      this._tooltipElement.style.transform = 'translate(0, -100%)';
    } else if (tooltipRect.right > window.innerWidth) {
      this._tooltipElement.style.left = 'auto';
      this._tooltipElement.style.right = '8px';
      this._tooltipElement.style.transform = 'translate(0, -100%)';
    }
  }
  
  private _hideTooltip(): void {
    if (this._tooltipElement) {
      this._tooltipElement.remove();
      this._tooltipElement = null;
    }
  }
  
  // Support dynamic updates to the text attribute
  static get observedAttributes(): string[] {
    return ['text'];
  }
  
  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
    if (name === 'text') {
      this.text = newValue;
      
      if (this._tooltipElement) {
        this._tooltipElement.textContent = newValue;
      }
    }
  }
}

// Define the tooltip-content element
class TooltipContentElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot;
  }
  
  connectedCallback(): void {
    this.style.display = 'none';
  }
}

customElements.define('tooltip-content', TooltipContentElement);
customElements.define('with-tooltip', WithTooltipElement);

export { TooltipContentElement, WithTooltipElement };
