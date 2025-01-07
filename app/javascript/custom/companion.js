if (navigator.serviceWorker) {
	navigator.serviceWorker.register('/service-worker.js', { scope: "/" })
		.then(() => navigator.serviceWorker.ready)
		.then(registration => {
			if ("SyncManager" in window) {
				registration.sync.register("sync-forms");
			}
			console.log("[Companion]", "Service worker registered!", registration)

			var serviceWorker;
			if (registration.installing) {
				serviceWorker = registration.installing;
				console.log('Service worker installing.');
			} else if (registration.waiting) {
				serviceWorker = registration.waiting;
				console.log('Service worker installed & waiting.');
			} else if (registration.active) {
				serviceWorker = registration.active;
				console.log('Service worker active.');
			}

			window.Notification.requestPermission().then(permission => {
				if (permission !== 'granted') {
					throw new Error('Permission not granted for Notification');
				}
			});
		})
		.catch(function (err) {
			//registration failed :(
			console.log('ServiceWorker registration failed: ', err);
		});
} else {
	console.log('No service-worker on this browser');
}

// force to relaod the page when internet connexion is offline to render the offline page in cache
window.addEventListener('offline', () => {
	// console.log('HEY HEY HEY')
	window.location.reload();
});