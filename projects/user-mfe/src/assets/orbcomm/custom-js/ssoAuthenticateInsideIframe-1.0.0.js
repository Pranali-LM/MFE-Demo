!(function () {
  localStorage.getItem('synergyportal.authenticated'), window.location;

  if (window.self != window.top) {
    window.parent.postMessage('eventFADFS', '*');

    var t = window.addEventListener ? 'addEventListener' : 'attachEvent';
    (0, window[t])(
      'attachEvent' == t ? 'onmessage' : 'message',
      function (t) {
        if (t.data) {
          try {
            var e = JSON.parse(t.data);
            for (var a in e) {
              localStorage['synergyportal.' + a] = e[a];
            }
          } catch (err) {
            console.log('error on json parse : ' + err);
          }
        }
        !localStorage.getItem('synergyportal.authenticated') &&
          localStorage['synergyportal.access_token'] &&
          (localStorage['synergyportal.authenticated'] = !0);
      },
      !1
    );
  }
})();
