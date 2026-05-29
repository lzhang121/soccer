(function () {
  var timerId = window.setTimeout(function () {
    var fb = document.getElementById('boot-fallback');
    if (!fb) return;
    fb.innerHTML =
      '<h2>Side Panel を読み込めませんでした</h2>' +
      '<p>開発モードの場合、ターミナルで <code>npm run dev</code> を実行し、' +
      'chrome://extensions で拡張機能を<strong>再読み込み</strong>してください。</p>' +
      '<p>または <code>npm run build</code> 後、' +
      '<code>.output/chrome-mv3</code> を読み込んでください。</p>';
  }, 4000);

  window.__SS_CANCEL_BOOT_FALLBACK__ = function () {
    window.clearTimeout(timerId);
  };
})();
