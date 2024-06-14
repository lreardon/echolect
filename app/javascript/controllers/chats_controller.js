import ApplicationController from './application_controller';

export default class extends ApplicationController {
	createSuccess(element) {
		console.log("HEY HEY")
		element.reset();
	}
}