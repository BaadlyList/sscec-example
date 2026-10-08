(function () {
  // ---- Edit this content to match your business ----
  var SECTORS = [
    ["Sector One", "Short description of what you do in this area."],
    ["Sector Two", "Short description of what you do in this area."],
    ["Sector Three", "Short description of what you do in this area."],
    ["Sector Four", "Short description of what you do in this area."],
    ["Sector Five", "Short description of what you do in this area."],
    ["Sector Six", "Short description of what you do in this area."]
  ];
  var PROJECTS = [
    ["Project title goes here", "Client: Name"],
    ["Another project title", "Client: Name"],
    ["A third project title", "Client: Name"]
  ];
  var CLIENTS = ["Client A", "Client B", "Client C", "Client D", "Client E", "Client F"];

  // Same origin as the page: server.py serves both the site and /api.
  var API = "/api";

  function safe(fn, fallback) { try { return fn(); } catch (e) { return fallback; } }

  // ---- Theme (light/dark), remembered per browser ----
  var root = document.documentElement;
  var saved = safe(function () { return localStorage.getItem("theme"); }, null);
  var prefersDark = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(saved || (prefersDark ? "dark" : "light"));

  function setTheme(t) {
    root.setAttribute("data-theme", t);
    safe(function () { localStorage.setItem("theme", t); });
    var b = document.getElementById("theme-toggle");
    if (b) b.textContent = t === "dark" ? "Light" : "Dark";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var tbtn = document.getElementById("theme-toggle");
    setTheme(root.getAttribute("data-theme"));
    tbtn.addEventListener("click", function () {
      setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });

    // render content (textContent only, never innerHTML with data)
    var grid = document.getElementById("sector-grid");
    SECTORS.forEach(function (s) {
      var d = document.createElement("div");
      d.className = "card";
      var thumb = document.createElement("div"); thumb.className = "thumb"; thumb.textContent = s[0].charAt(0);
      var body = document.createElement("div"); body.className = "body";
      var h = document.createElement("h3"); h.textContent = s[0];
      var p = document.createElement("p"); p.textContent = s[1];
      body.appendChild(h); body.appendChild(p);
      d.appendChild(thumb); d.appendChild(body);
      grid.appendChild(d);
    });
    var pl = document.getElementById("project-list");
    PROJECTS.forEach(function (p) {
      var li = document.createElement("li");
      li.textContent = p[0];
      var sm = document.createElement("small");
      sm.textContent = p[1];
      li.appendChild(sm);
      pl.appendChild(li);
    });
    var cl = document.getElementById("client-list");
    CLIENTS.forEach(function (c) {
      var li = document.createElement("li");
      li.textContent = c;
      cl.appendChild(li);
    });

    // slider
    var slides = document.querySelectorAll(".slide");
    var dots = document.querySelector(".dots");
    var i = 0, timer;
    slides.forEach(function (_, n) {
      var b = document.createElement("button");
      b.setAttribute("aria-label", "Slide " + (n + 1));
      b.addEventListener("click", function () { show(n); restart(); });
      dots.appendChild(b);
    });
    function show(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle("active", k === i); });
      dots.querySelectorAll("button").forEach(function (d, k) { d.classList.toggle("on", k === i); });
    }
    function restart() { clearInterval(timer); timer = setInterval(function () { show(i + 1); }, 5000); }
    document.querySelector(".prev").addEventListener("click", function () { show(i - 1); restart(); });
    document.querySelector(".next").addEventListener("click", function () { show(i + 1); restart(); });
    show(0); restart();

    // footer year + visit counter (real count from the server; shows a dash if unreachable)
    document.getElementById("year").textContent = new Date().getFullYear();
    var vc = document.getElementById("visit-count");
    fetch(API + "/visit", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })
      .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
      .then(function (d) { vc.textContent = d.visits; })
      .catch(function () { vc.textContent = "\u2013"; });

    // contact form -> database
    var form = document.getElementById("contact-form");
    var status = document.getElementById("form-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = Object.fromEntries(new FormData(form).entries());
      if (!data.name || !data.email || !data.message) { status.textContent = "Please fill every field."; return; }
      status.textContent = "Sending...";
      fetch(API + "/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (r.status === 429) { status.textContent = "Too many messages. Please try again later."; return; }
        if (!r.ok) throw new Error();
        status.textContent = "Thanks! Your message was saved.";
        form.reset();
      }).catch(function () { status.textContent = "Could not reach the server. Run server.py and open http://localhost:8000"; });
    });

    // back to top
    var top = document.getElementById("to-top");
    window.addEventListener("scroll", function () { top.style.display = window.scrollY > 400 ? "block" : "none"; });
    top.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  });
})();