if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./service-worker.js')
             .then(function() { console.log('Service Worker Registered'); });
  }
  var app1 = (function() {
  'use strict';

  var isSubscribed = false;
  var swRegistration = null;

  var notifyButton = document.querySelector('.js-notify-btn');
  var pushButton = document.querySelector('.js-push-btn');

  if (!('Notification' in window)) {
    console.log('This browser does not support notifications!');
    return;
  }

  Notification.requestPermission(function(status) {
    console.log('Notification permission status:', status);
  });

  function displayNotification() {
    if (Notification.permission == 'granted') {
      navigator.serviceWorker.getRegistration().then(function(reg) {
        var options = {
          body: 'First notification!',
          icon: 'images/images.jpg',
          vibrate: [100, 50, 100],
          data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
          },
          actions: [
            {action: 'explore', title: 'Go to the site',
              icon: 'images/h.jpg'},
            {action: 'close', title: 'Close the notification',
              icon: 'images/download.jpg'},
          ]

          // TODO 5.1 - add a tag to the notification

        };
        reg.showNotification('Hello world!', options);
      });
    }
  }

  function initializeUI() {
    pushButton.addEventListener('click', function() {
      pushButton.disabled = true;
      if (isSubscribed) {
        unsubscribeUser();
      } else {
        subscribeUser();
      }
    });

    swRegistration.pushManager.getSubscription()
    .then(function(subscription) {
      isSubscribed = (subscription !== null);

      updateSubscriptionOnServer(subscription);

      if (isSubscribed) {
        console.log('User IS subscribed.');
      } else {
        console.log('User is NOT subscribed.');
      }

      updateBtn();
    });
  }

  // TODO 4.2a - add VAPID public key

  function subscribeUser() {
	  const applicationServerKey =urlB64ToUint8Array('BDc6mJIHoM0J-UzMa2onAiY9Kq7e7Wkcgq6WI9Hn7XAK9YhLlqazG62MzRAuryZ5pyX5L6lN_DLOMwGo6StMAL4');
    swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
	  applicationServerKey:applicationServerKey
    })
    .then(function(subscription) {
      console.log('User is subscribed:', subscription);

      updateSubscriptionOnServer(subscription);

      isSubscribed = true;

      updateBtn();
    })
    .catch(function(err) {
      if (Notification.permission === 'denied') {
        console.warn('Permission for notifications was denied');
      } else {
        console.error('Failed to subscribe the user: ', err);
      }
      updateBtn();
    });
  }

  function unsubscribeUser() {
    swRegistration.pushManager.getSubscription()
    .then(function(subscription) {
      if (subscription) {
        return subscription.unsubscribe();
      }
    })
    .catch(function(error) {
      console.log('Error unsubscribing', error);
    })
    .then(function() {
      updateSubscriptionOnServer(null);

      console.log('User is unsubscribed');
      isSubscribed = false;

      updateBtn();
    });
  }

  function updateSubscriptionOnServer(subscription) {
    // Here's where you would send the subscription to the application server

    var subscriptionJson = document.querySelector('.js-subscription-json');
    var endpointURL = document.querySelector('.js-endpoint-url');
    var subAndEndpoint = document.querySelector('.js-sub-endpoint');

    if (subscription) {
      subscriptionJson.textContent = JSON.stringify(subscription);
      endpointURL.textContent = subscription.endpoint;
      subAndEndpoint.style.display = 'block';
    } else {
      subAndEndpoint.style.display = 'none';
    }
  }

  function updateBtn() {
    if (Notification.permission === 'denied') {
      pushButton.textContent = 'Push Messaging Blocked';
      pushButton.disabled = true;
      updateSubscriptionOnServer(null);
      return;
    }

    if (isSubscribed) {
      pushButton.textContent = 'Disable Push Messaging';
    } else {
      pushButton.textContent = 'Enable Push Messaging';
    }

    pushButton.disabled = false;
  }

  function urlB64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  notifyButton.addEventListener('click', function() {
    displayNotification();
  });

  if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Service Worker and Push is supported');

    navigator.serviceWorker.register('service-worker.js')
    .then(function(swReg) {
      console.log('Service Worker is registered', swReg);

      swRegistration = swReg;

      initializeUI();
    })
    .catch(function(error) {
      console.error('Service Worker Error', error);
    });
  } else {
    console.warn('Push messaging is not supported');
    pushButton.textContent = 'Push Not Supported';
  }

})();
