(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (!header || !toggle || !nav) return;

  var openedAt = 0;

  function isMobile() { return getComputedStyle(toggle).display !== 'none'; }

  function closeSubs() {
    nav.querySelectorAll('.has-sub.open').forEach(function (li) {
      li.classList.remove('open');
      var a = li.querySelector(':scope > a');
      if (a) a.setAttribute('aria-expanded', 'false');
    });
  }

  function setMenu(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (open) openedAt = window.scrollY; else closeSubs();
  }

  // Hamburger button (the only place that toggles the mobile menu).
  toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });

  // Parent items: "#" links never jump to the top; on mobile a tap opens the submenu.
  nav.querySelectorAll('.has-sub > a').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');
      if (!isMobile()) { if (href === '#') e.preventDefault(); return; }
      e.preventDefault();
      var li = a.parentElement;
      var willOpen = !li.classList.contains('open');
      closeSubs();
      li.classList.toggle('open', willOpen);
      a.setAttribute('aria-expanded', String(willOpen));
    });
  });

  // Choosing a real link closes the mobile menu.
  nav.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a || !isMobile()) return;
    var isParent = a.parentElement.classList.contains('has-sub') && !a.closest('.sub');
    if (!isParent) setMenu(false);
  });

  // Tap outside, press Escape, or scroll the page: close the mobile menu.
  document.addEventListener('click', function (e) {
    if (isMobile() && nav.classList.contains('open') && !header.contains(e.target)) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { setMenu(false); if (document.activeElement) document.activeElement.blur(); }
  });
  window.addEventListener('scroll', function () {
    if (isMobile() && nav.classList.contains('open') && Math.abs(window.scrollY - openedAt) > 40) setMenu(false);
  }, { passive: true });

  window.addEventListener('resize', function () { if (!isMobile()) setMenu(false); });
})();