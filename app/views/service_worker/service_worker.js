// app/views/service_worker/service_worker.js

// Import the Workbox SW module via the CDN
importScripts(
	'https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js'
);

// We first define the strategies we will use and the registerRoute function
const { CacheFirst, NetworkFirst } = workbox.strategies;
const { registerRoute } = workbox.routing;

// If we have critical pages that won't be changing very often, it's a good idea to use cache first with them
// registerRoute(
//   ({url}) => url.pathname.startsWith('/home'),
//   new CacheFirst({
//   cacheName: 'documents',
// })
// )

// For every other page we use network first to ensure the most up-to-date resources
registerRoute(
	({ request, url }) => request.destination === "document" || request.destination === "",
	new NetworkFirst({
		cacheName: 'documents',
	})
)

// For assets (scripts and images), we use cache first
registerRoute(
	({ request }) => request.destination === "script" || request.destination === "style",
	new CacheFirst({
		cacheName: 'assets-styles-and-scripts',
	})
)
registerRoute(
	({ request }) => request.destination === "image",
	new CacheFirst({
		cacheName: 'assets-images',
	})
)

const { warmStrategyCache } = workbox.recipes;
const { setCatchHandler } = workbox.routing;
const strategy = new CacheFirst();
const urls = ['/offline.html'];

// Warm the runtime cache with a list of asset URLs
warmStrategyCache({ urls, strategy });

// Trigger a 'catch' handler when any of the other routes fail to generate a response
setCatchHandler(async ({ event }) => {
	switch (event.request.destination) {
		case 'document':
			return strategy.handle({ event, request: urls[0] });
		default:
			return Response.error();
	}
});


// function onInstall(event) {
// 	console.log('[Serviceworker]', "Installing!", event);
// }

// function onActivate(event) {
// 	console.log('[Serviceworker]', "Activating!", event);
// }

// function onFetch(event) {
// 	console.log('[Serviceworker]', "Fetching!", event);
// }

// self.addEventListener('install', onInstall);
// self.addEventListener('activate', onActivate);
// self.addEventListener('fetch', onFetch);



// const OFFLINE_VERSION = 1;
// const CACHE_NAME = `offline V${OFFLINE_VERSION}`;
// const OFFLINE_URL = 'offline';
// const OFFLINE_IMG = 'apple-icon.png';

// function urlB64ToUint8Array(base64String) {
// 	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
// 	const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

// 	const rawData = atob(base64);
// 	const outputArray = new Uint8Array(rawData.length);

// 	for (var i = 0; i < rawData.length; ++i) {
// 		outputArray[i] = rawData.charCodeAt(i);
// 	}
// 	return outputArray;
// }

// self.addEventListener('install', function (event) {
// 	console.log('Service Worker installing.');
// 	self.skipWaiting();
// 	event.waitUntil((async () => {
// 		const cache = await caches.open(CACHE_NAME);
// 		// Setting {cache: 'reload'} in the new request will ensure that the response
// 		// isn't fulfilled from the HTTP cache; i.e., it will be from the network.
// 		// here the offline url and image are stored in the cache
// 		await Promise.all([OFFLINE_URL, OFFLINE_IMG].map((path) => {
// 			cache.add(new Request(path, { cache: 'reload' }));
// 		}));
// 	})());
// });

// self.addEventListener('activate', async function (event) {
// 	console.log('Service Worker activated.');

// 	// // Tell the active service worker to take control of the page immediately.
// 	self.clients.claim();

// 	let cacheWhitelist = [CACHE_NAME];
// 	event.waitUntil((async () => {
// 		// Enable navigation preload if it's supported.
// 		// See https://developers.google.com/web/updates/2017/02/navigation-preload
// 		if ('navigationPreload' in self.registration) {
// 			await self.registration.navigationPreload.enable();
// 		}

// 		// Delete old versions of CACHE_NAME
// 		caches.keys().then(function (cacheNames) {
// 			return Promise.all(
// 				cacheNames.map(function (cacheName) {
// 					if (cacheWhitelist.indexOf(cacheName) === -1) {
// 						return caches.delete(cacheName);
// 					}
// 				})
// 			);
// 		})
// 	})());

// 	try {
// 		const applicationServerKey = urlB64ToUint8Array('<YOUR_PUBLIC_KEY_FOR_NOTIFICATION_PUSH>')
// 		const options = { applicationServerKey, userVisibleOnly: true }
// 		const subscription = await self.registration.pushManager.subscribe(options)
// 		console.log(JSON.stringify(subscription))
// 	} catch (err) {
// 		console.log('Error', err)
// 	}
// });

// self.addEventListener('fetch', function (event) {
// 	console.log('Service Worker fetching.');
// 	// We only want to call event.respondWith() if this is a navigation request
// 	// for an HTML page.
// 	event.respondWith((async () => {
// 		try {
// 			// First, try to use the navigation preload response if it's supported.
// 			const preloadResponse = await event.preloadResponse;
// 			if (preloadResponse) {
// 				return preloadResponse;
// 			}

// 			return await caches.match(event.request) || await fetch(event.request);
// 		} catch (error) {
// 			// catch is only triggered if an exception is thrown, which is likely
// 			// due to a network error.
// 			// If fetch() returns a valid HTTP response with a response code in
// 			// the 4xx or 5xx range, the catch() will NOT be called.
// 			console.log('Fetch failed; returning offline page instead.', error);

// 			const cache = await caches.open(CACHE_NAME);
// 			const cachedResponse = await cache.match(OFFLINE_URL);
// 			return cachedResponse;
// 		}
// 	})());
// });

// // for the notification push
// self.addEventListener('push', function (event) {
// 	console.log('[Service Worker] Push Received.');
// 	console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

// 	const title = 'Notification from PWA-test app';
// 	const options = {
// 		body: event.data.text(),
// 		icon: OFFLINE_IMG,
// 		badge: OFFLINE_IMG
// 	};

// 	event.waitUntil(self.registration.showNotification(title, options));
// });