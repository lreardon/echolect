import ApplicationController from './application_controller';

export default class extends ApplicationController {
	createSuccess(element) {
		element.reset();
	}
}