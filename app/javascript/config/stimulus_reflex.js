import StimulusReflex from "stimulus_reflex"
import { application } from "../controllers/application"
import controller from "../controllers/application_controller"

StimulusReflex.initialize(application, { controller, isolate: true, debug: true })

// consider removing these options in production
StimulusReflex.debug = true
// end remove
