import ApplicationController from './application_controller.js'

export default class extends ApplicationController {
    afterReflex(anchorElement) {
        console.log("afterReflex")
      }
    beforeCreate(element) {
        console.log("pooo poo")
    }
}