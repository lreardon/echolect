import ApplicationController from './application_controller';

export default class extends ApplicationController {
	createSuccess(element) {
        console.log("SUCCESS :0")
		const textarea = element.querySelector('textarea[name="message[body]"]');
		if (textarea) {
   		  console.log(textarea.value);
    	  textarea.value = '';
		  console.log(textarea.value);
    	}
	}
}