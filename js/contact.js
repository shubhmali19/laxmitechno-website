(function () {
  'use strict';
  var TO = 'hello@laxmitechno.in';
  var form = document.getElementById('contact-form');
  if (!form) return;
  var status = document.getElementById('form-status');

  var rules = {
    name: function (v) {
      return v ? '' : 'Enter your name so we know who to reply to.';
    },
    email: function (v) {
      if (!v) return 'Enter your email address so we can reply.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'This email address looks incomplete. Use the format name@example.com.';
      return '';
    },
    build: function (v) {
      return v ? '' : 'Describe what you want to build in a few words.';
    },
    message: function (v) {
      if (!v) return 'Add a short message about the problem and any timeline.';
      if (v.length < 15) return 'Add a little more detail. A couple of sentences is enough.';
      return '';
    }
  };

  function field(id) { return document.getElementById(id); }

  function check(id, show) {
    var el = field(id);
    var msg = rules[id](el.value.trim());
    var wrap = el.closest('.field');
    var err = document.getElementById(id + '-err');
    if (show) {
      err.textContent = msg;
      wrap.classList.toggle('invalid', !!msg);
      if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
    }
    return msg;
  }

  Object.keys(rules).forEach(function (id) {
    var el = field(id);
    el.addEventListener('blur', function () { if (el.value !== '' || el.dataset.touched) check(id, true); el.dataset.touched = '1'; });
    el.addEventListener('input', function () { if (el.closest('.field').classList.contains('invalid')) check(id, true); });
  });

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var first = null, count = 0;
    Object.keys(rules).forEach(function (id) {
      if (check(id, true)) { count++; if (!first) first = field(id); }
    });
    if (first) {
      status.innerHTML = '<div class="box err"><p>' + (count === 1 ? '1 field needs attention.' : count + ' fields need attention.') + ' Fix the highlighted fields and submit again.</p></div>';
      first.focus();
      return;
    }

    var v = function (id) { return field(id).value.trim(); };
    var subject = 'Project enquiry: ' + v('build');
    var lines = [
      'Name: ' + v('name'),
      'Email: ' + v('email'),
      'Company: ' + (v('company') || 'Not given'),
      'Wants to build: ' + v('build'),
      'Rough budget: ' + field('budget').value,
      '',
      v('message')
    ];
    var href = 'mailto:' + TO + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));

    status.innerHTML =
      '<div class="box">' +
      '<p>Your email app should open now with the message filled in. Press send there to reach us. Nothing has been sent yet.</p>' +
      '<p>If nothing opens, copy our address and write to us directly: <code>' + TO + '</code></p>' +
      '<div class="row"><button type="button" class="btn ghost" id="copy-btn">Copy address</button>' +
      '<a href="' + esc(href) + '">Open email app again</a></div>' +
      '</div>';

    var copy = document.getElementById('copy-btn');
    copy.addEventListener('click', function () {
      function done(ok) { copy.textContent = ok ? 'Address copied' : 'Select the address above and copy it'; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(TO).then(function () { done(true); }, function () { done(false); });
      } else { done(false); }
    });

    window.location.href = href;
  });
})();
