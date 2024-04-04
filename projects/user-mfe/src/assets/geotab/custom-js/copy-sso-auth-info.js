if (window.self != window.top) {
  window.addEventListener('message', (event) => {
    console.log('Received message from geotab portal: ', event);
    const { type, data } = event.data;
    const storagePrefix = 'geotab';
    if (type === 'focus') {
      for (const key in data) {
        const value = data[key];
        const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
        sessionStorage.setItem(`${storagePrefix}.${key}`, serializedValue);
      }
    }
    if (type === 'blur') {
      const logoutEvent = new CustomEvent('logout');
      window.dispatchEvent(logoutEvent);
    }
  });

  window.parent.postMessage({ type: 'ready' }, '*');
}
