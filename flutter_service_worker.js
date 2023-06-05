'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"assets/AssetManifest.bin": "35cfacc187e6a7f0b59e3aba51eb3701",
"assets/AssetManifest.json": "a4e476d609106f89198ae24fa1213452",
"assets/FontManifest.json": "2f510e79092eb11bee0cef92b5bb3821",
"assets/fonts/MaterialIcons-Regular.otf": "7a905047ad1fdb6afd2e62e9649bd8be",
"assets/fonts/opensans/OpenSans-Regular.ttf": "7df68ccfcb8ffe00669871052a4929c9",
"assets/fonts/opensans/OpenSans-SemiBold.ttf": "58fb53a79ecf1314a1f38bceb8b2a992",
"assets/fonts/opensans/OpenSans_Condensed-Regular.ttf": "eafad04354ea413589d86d80e7b1ddb2",
"assets/images/pngs/agenda.png": "3627c625df40880d6e265d45ad20deb0",
"assets/images/pngs/anuncio.png": "5b76bf33401f2d2fd4b6fbfe3dc4ce80",
"assets/images/pngs/capa.png": "de13f25c48a7b55473630a108a7f95f3",
"assets/images/pngs/card.png": "8013344da1b1b2373105aeb4ce987e12",
"assets/images/pngs/contrato.png": "5ea4b494c37e7f77fd8f63275f82fc50",
"assets/images/pngs/dj_mulher.jpg": "3d781f6ee66722bedd06637432c4afc4",
"assets/images/pngs/filtro.png": "e93c8047e68836e7530ede7149f08a4c",
"assets/images/pngs/geoloc.png": "41585af898f13ae919995dd1f0c0b55c",
"assets/images/pngs/han.png": "b61582fd0fbbe5c2248a7e2d2a70d477",
"assets/images/pngs/logo_lateral.png": "de48f1ef7f63a2e6cb33fd160de19c78",
"assets/images/pngs/logo_vertical.png": "cabc458a678dce86fec5a5d272e6fd9b",
"assets/images/pngs/mao_celular.png": "6893ac0236ae74a59d6fbf22034c6752",
"assets/images/pngs/mulher_festa.jpg": "c76876b660826bb736d0aee2a29a4e2e",
"assets/images/pngs/orcamento.png": "a2cc48e42d492b3d83898a3e85417172",
"assets/images/pngs/perfil_check.png": "064709eb973f672e8e37224f49728885",
"assets/NOTICES": "8d58e9e1780338bc74a65ac4d188e839",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "57d849d738900cfd590e9adc7e208250",
"assets/shaders/ink_sparkle.frag": "f8b80e740d33eb157090be4e995febdf",
"canvaskit/canvaskit.js": "8a27c70cfc3542d6232ff272f8eef5c4",
"canvaskit/canvaskit.wasm": "ee371a7bb9e06e8b850102d886d6847d",
"canvaskit/chromium/canvaskit.js": "945860162d0f411557ebceae7ffd4e6e",
"canvaskit/chromium/canvaskit.wasm": "15630948751b4e30e66735a0f3bfa88b",
"canvaskit/skwasm.js": "11a044d7e1b6b06f621227aa0636df04",
"canvaskit/skwasm.wasm": "c81676d50211237f3fbd09a89c89addb",
"canvaskit/skwasm.worker.js": "19659053a277272607529ef87acf9d8a",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"flutter.js": "6b515e434cea20006b3ef1726d2c8894",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"index.html": "650f865d6c8c91e1bb4746634da11d0f",
"/": "650f865d6c8c91e1bb4746634da11d0f",
"main.dart.js": "1a4544ac2477ca9d4dd1bd25d2007c9b",
"manifest.json": "84a7db71d4961994e035f4783ad4b3bf",
"version.json": "febe3dff734f61d95620927d87ed82ad"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
