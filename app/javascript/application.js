// Entry point for the build script in your package.json
import "@hotwired/turbo-rails"
import "@rails/activestorage"
import "./channels"
import "./classes"
import "./config"
import "./controllers"
import "./custom/companion"

import "./elements"

document.addEventListener('cable-ready:after-append', function() {
    console.log("cable-ready:after-append")
    customElements.upgrade(document.body);
});

document.addEventListener('DOMContentLoaded', () => {
    console.log("Setting up custom element observer")

    const customElementStyles = {
        'tooltip-content': { display: 'none' },
        // Add more custom elements here as needed:
        // TODO: Abstract this
        // 'my-dropdown': { display: 'flex', flexDirection: 'column' },
        // 'custom-modal': { position: 'fixed', zIndex: '100' }
    };

    // Function to apply styles to a specific element
    function applyStyles(element) {
        const tagName = element.tagName.toLowerCase();
        const styles = customElementStyles[tagName];
        
        if (styles) {
            Object.assign(element.style, styles);
        return true;
        }
        return false;
    }

    function processElement(element) {
        let stylesApplied = false;
        
        // If this element needs styling, apply it
        if (element.nodeType === Node.ELEMENT_NODE) {
        const tagName = element.tagName.toLowerCase();
        if (customElementStyles[tagName]) {
            applyStyles(element);
            stylesApplied = true;
        }
        
        // Process all matching children
        Object.keys(customElementStyles).forEach(tag => {
            const children = element.querySelectorAll(tag);
            if (children.length > 0) {
            children.forEach(child => {
                applyStyles(child);
                stylesApplied = true;
            });
            }
        });
        }
        
        return stylesApplied;
    }
    
    const observer = new MutationObserver((mutations) => {
        if (mutations.length > 0) {
            processElement(document.body);
        }
        let stylesApplied = false;
        mutations.forEach(
            mutation => {
                if (mutation.type === 'childList') {
                    mutation.target.childNodes.forEach(
                        node => {
                            if (processElement(node)) {
                                console.log("PROCESSED NODE")
                                stylesApplied = true;
                            }
                        }
                    );
                }
            }
        );
        
        if (stylesApplied) {
            console.log("Applied styles to custom elements after DOM change");
            }
        }
    );
    
    observer.observe(
        document.body, {
            childList: true,
            subtree: true
        }
    );
});