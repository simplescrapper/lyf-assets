// ─────────────────────────────────────────────────────────────
// Light Your Fire — simplescrapper.com/lyf.js
// Upload this file to your WordPress media or server root.
// Reference it in the Ontraport page as:
//   <script src="https://www.simplescrapper.com/lyf.js"></script>
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// CONFIGURATION — edit these before uploading
// ─────────────────────────────────────────────────────────────
var LYF_FIELDS = {
  email:   'email',   // Ontraport email field name
  q1:      'f1752',   // LYF - What brings joy (Q1)
  q2:      'f1753',   // LYF - Project on mind (Q2)
  q3:      'f1754',   // LYF - What's weighing you down
  choice:  'f1755',   // LYF - Choice selected
  onestep: 'f1756'    // LYF - One step given
};

// Must match what you append to the opt-in redirect: ?email=%%Email%%
var LYF_EMAIL_PARAM = 'email';

// ─────────────────────────────────────────────────────────────
// One-step content per choice
// ─────────────────────────────────────────────────────────────
var LYF_STEPS = {
  photos: {
    title: 'Set a 10-minute timer and find five photos.',
    body: 'Just five. From one moment — a trip, a birthday, an ordinary Tuesday you somehow remember. Don\'t sort the whole library, don\'t make any decisions. Just find them, look at them for a minute, and let yourself feel why they matter. That\'s your step.'
  },
  supplies: {
    title: 'Find one thing you\'ve been meaning to use and put it on your table.',
    body: 'Not to make something with it today — just to get it out of the drawer or bin and somewhere you can see it. A patterned paper. A stamp you bought six months ago. A kit still in the bag. Put it out. Let it remind you that you picked it because something about it felt right.'
  },
  finish: {
    title: 'Find the project and put it where you can see it.',
    body: 'You know the one. Pull it out — from the shelf, the drawer, the pile — and set it somewhere visible. You don\'t have to work on it right now. Just making it visible is enough for today.'
  },
  space: {
    title: 'Spend 10 minutes on just one corner.',
    body: 'Not the whole room. Pick one small area that\'s been bothering you — a shelf, a drawer, the spot where things pile up — and spend 10 minutes making it feel a little more intentional. One corner. You\'ll feel it.'
  },
  plan: {
    title: 'Write down one project, one reason it matters, and one small next action.',
    body: 'On a sticky note, an index card, the notes app on your phone — write the name of one project, one sentence about why it matters to you, and the smallest possible next step. Put it somewhere you\'ll see it. That\'s your whole plan.'
  },
  oldpages: {
    title: 'Pull out one album or layout you\'ve already made and spend five minutes with it.',
    body: 'Not to critique it — just to look at it. Read the journaling. Notice what you captured that would have been lost otherwise. Let yourself feel proud of something you\'ve already done. You\'ve been making things that matter. It helps to remember that.'
  },
  def: {
    title: 'Set aside 10 minutes just for yourself today.',
    body: 'Open your craft space, even if you just stand in it for a minute. Touch the supplies you love. Remember why you started. Sometimes that\'s the whole step — just showing up, even briefly, and letting yourself feel reconnected to this part of your life.'
  }
};

var LYF_LABELS = {
  photos:   "Find some photos I've been meaning to use",
  supplies: "Pull out supplies I actually love",
  finish:   "Go back to something I already started",
  space:    "Do something small with my creative space",
  plan:     "Write down one thing I want to work on",
  oldpages: "Look at pages I've already made"
};

// ─────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────
var LYF_IDS = ['lyf-welcome','lyf-notice','lyf-release','lyf-follow','lyf-onestep','lyf-final'];
var lyfIdx = 0;
var lyfChoice = null;
var lyfEmail = '';

(function() {
  try {
    var params = new URLSearchParams(window.location.search);
    lyfEmail = params.get(LYF_EMAIL_PARAM) || '';
  } catch(e) {}
})();

// ─────────────────────────────────────────────────────────────
// Navigation
// ─────────────────────────────────────────────────────────────
function lyfGoTo(id) {
  var cur = document.querySelector('.lyf-step.active');
  if (cur) cur.classList.remove('active');
  var nxt = document.getElementById(id);
  if (!nxt) return;
  nxt.classList.add('active');
  var card = document.querySelector('.lyf-card');
  if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  lyfIdx = LYF_IDS.indexOf(id);
  lyfDots();
}

function lyfDots() {
  var dots = document.querySelectorAll('#lyf-dots .lyf-dot');
  for (var i = 0; i < dots.length; i++) {
    dots[i].classList.remove('active', 'done');
    if (i === lyfIdx) dots[i].classList.add('active');
    else if (i < lyfIdx) dots[i].classList.add('done');
  }
}

// ─────────────────────────────────────────────────────────────
// Choice selection
// ─────────────────────────────────────────────────────────────
function lyfSelect(val, el) {
  var all = document.querySelectorAll('.lyf-choice');
  for (var i = 0; i < all.length; i++) {
    all[i].classList.remove('selected');
    all[i].setAttribute('aria-pressed', 'false');
  }
  el.classList.add('selected');
  el.setAttribute('aria-pressed', 'true');
  lyfChoice = val;
}

function lyfGoToOneStep() {
  var key = lyfChoice || 'def';
  var d = LYF_STEPS[key] || LYF_STEPS.def;
  document.getElementById('lyf-onestep-content').innerHTML =
    '<div class="lyf-onestep-title">' + d.title + '</div>' +
    '<p class="lyf-p" style="margin:0;font-size:15px;line-height:1.7;">' + d.body + '</p>';
  lyfGoTo('lyf-onestep');
}

// ─────────────────────────────────────────────────────────────
// Submit — populate Ontraport hidden fields, trigger native submit
// ─────────────────────────────────────────────────────────────
function lyfSubmit() {
  var wrapper = document.getElementById('lyf-op-form-wrapper');
  if (!wrapper) { lyfGoTo('lyf-final'); return; }
  var form = wrapper.querySelector('form');
  if (!form) { lyfGoTo('lyf-final'); return; }

  var key = lyfChoice || 'def';
  var d = LYF_STEPS[key] || LYF_STEPS.def;
  var choiceLabel = LYF_LABELS[key] || 'Not selected';
  var oneStepText = d.title + ' ' + d.body;

  lyfSetField(form, LYF_FIELDS.email,   lyfEmail);
  lyfSetField(form, LYF_FIELDS.q1,      document.getElementById('lyf-q1').value);
  lyfSetField(form, LYF_FIELDS.q2,      document.getElementById('lyf-q2').value);
  lyfSetField(form, LYF_FIELDS.q3,      document.getElementById('lyf-q3').value);
  lyfSetField(form, LYF_FIELDS.choice,  choiceLabel);
  lyfSetField(form, LYF_FIELDS.onestep, oneStepText);

  var submitBtn = form.querySelector('[type="submit"]');
  if (submitBtn) {
    submitBtn.click();
  } else {
    form.submit();
  }

  lyfGoTo('lyf-final');
}

function lyfSetField(form, name, value) {
  var el = form.querySelector('[name="' + name + '"]');
  if (el) {
    el.value = value || '';
  } else {
    var inp = document.createElement('input');
    inp.type = 'hidden';
    inp.name = name;
    inp.value = value || '';
    form.appendChild(inp);
  }
}
