if (window.self != window.top) {
  window.addEventListener('message', function (event) {
    console.log('Received message from geotab portal: ', event);
    if (event.data && event.data.type === 'blur') {
      window.dispatchEvent(new CustomEvent('logout'));
    }
  });

  window.parent.postMessage({ type: 'ready' }, '*');
}
