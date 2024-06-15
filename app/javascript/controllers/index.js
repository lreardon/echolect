import { application } from "./application"

import controllers from "./**/*_controller.js"

controllers.forEach((controller) => {
  application.register(controller.name, controller.module.default)
})

StimulusReflex.initialize(application)
StimulusReflex.debug = process.env.RAILS_ENV === 'development'