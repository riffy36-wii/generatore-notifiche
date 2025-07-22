/*global define:false, console, self */

// https://www.chromium.org/Home/chromium-security/prefer-secure-origins-for-powerful-new-features
// https://developers.google.com/web/fundamentals/engage-and-retain/push-notifications/permissions-subscriptions
// https://github.com/w3c/ServiceWorker/blob/master/explainer.md
// chrome://inspect/#service-workers
// https://serviceworke.rs

function log(msg, obj) {
    console.log('ServiceWorker', msg);
}

log('Started', self);

self.addEventListener('install', function(event) {
    event.waitUntil(self.skipWaiting());
    log('Installed', event);
});

self.addEventListener('activate', function(event) {
    event.waitUntil(self.clients.claim());
    log('Activated', event);
});

self.addEventListener('message', function (event) {
    log('Push event received', event);
});

// Register event listener for the 'push' event.
var lastPayload;
self.addEventListener('push', function(event) {
    try {
        var payload = event.data ? JSON.parse(event.data.text()) : {};
            
        // Keep the service worker alive until the notification is created.
        event.waitUntil(
            // Show a notification with title 'ServiceWorker Cookbook' and body 'Alea iacta est'.
            self.registration.showNotification(payload.title, {
                lang: payload.lang || 'en',
                body: payload.body || 'Hello!',
                vibrate: payload.vibrate || [500, 100, 500],
                renotify: !!payload.renotify,
                requireInteraction: payload.requireInteraction,
                icon: payload.icon,
                badge: payload.badge,
                tag: payload.tag,
                actions: payload.actions,
                data: payload.data,
                sound: payload.sound,
                silent: !!(payload.silent || payload.sound)
            })
        );

    } catch(err) {
        log('Push message parse failed', err);
    }
});

self.addEventListener('notificationclick', function(event) {
    log('Notification clicked', event);
    if (event.action === 'open') {  
        event.notification.close(); 
        event.waitUntil(
            self.clients.matchAll().then(function(clientList) {
                self.clients.openWindow(event.notification.data);
            })
        );
    }  
    else if (event.action === 'close') {  
        event.notification.close();  
    }  else {  
        event.waitUntil(
            self.clients.matchAll().then(function(clientList) {
                if (event.notification.data) {
                    self.clients.openWindow(event.notification.data);
                } else if (clientList.length > 0) {
                    return clientList[0].focus();
                } else {
                    self.clients.openWindow(event.notification.data);   
                }
            })
        );  
    }  
}, false);