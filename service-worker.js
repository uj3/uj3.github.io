var cacheName = 'weatherPWA-step-6-1';
var filesToCache = [
  '/',
  '/index.html',
  '/me.html',
  '/scripts/app.js',
  '/scripts/sc.js',
  '/styles/sd.css',
  '/images/download.jpg',
  '/images/h.jpg',
  '/images/images.jpg'
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  console.log('[ServiceWorker] Fetch', e.request.url);
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});



//for notification
self.addEventListener('notificationclick',function(e) {
  var notification = e.notification;
  var primaryKey = notification.data.primaryKey;
  var a = e.action;
  if(a === 'close'){
	  notification.close();
  }else{
	  clients.openWindow('https://www.google.com');
	  notification.close();
  }

  //console.log("Notification Clicked right now "+a);
});

self.addEventListener('notificationclose',function(e) {
  var n = e.notification;
  var p = n.data.primaryKey;
  console.log('Lovely Notification Closed '+p);
});
