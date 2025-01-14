import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["institutionList"]

  toggle(event) {
    event.preventDefault()
    this.institutionListTarget.classList.toggle("hidden")
  }

  activateInstitution(event) {
    event.preventDefault()
    const institutionId = event.target.dataset.institutionId
    console.log(institutionId)
    
  }

  // Close dropdown when clicking outside
  clickOutside(event) {
    if (!this.element.contains(event.target)) {
      this.institutionListTarget.classList.add("hidden")
    }
  }

  connect() {
    // Add global click handler
    document.addEventListener("click", this.clickOutside.bind(this))
  }

  disconnect() {
    // Clean up event listener
    document.removeEventListener("click", this.clickOutside.bind(this))
  }
}