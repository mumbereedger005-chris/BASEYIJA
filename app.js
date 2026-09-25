/* ===================================================
   SwiftLend – app.js
   =================================================== */

/* ---------- Mobile menu ---------- */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const closeMenu  = document.getElementById('closeMenu');

if (hamburger) hamburger.addEventListener('click', () => mobileMenu.classList.add('open'));
if (closeMenu)  closeMenu.addEventListener('click',  () => mobileMenu.classList.remove('open'));

function closeMobile() { mobileMenu.classList.remove('open'); }

/* ---------- Loan Calculator ---------- 
function fmt(n) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calcUpdate() {
  const amount = parseFloat(document.getElementById('calcAmount').value);
  const term   = parseFloat(document.getElementById('calcTerm').value);
  const rate   = parseFloat(document.getElementById('calcRate').value);

  document.getElementById('amountDisplay').textContent = Math.round(amount).toLocaleString();
  document.getElementById('termDisplay').textContent   = term;
  document.getElementById('rateDisplay').textContent   = rate.toFixed(1);

  const monthlyRate = rate / 100 / 12;
  let monthly;
  if (monthlyRate === 0) {
    monthly = amount / term;
  } else {
    monthly = amount * (monthlyRate * Math.pow(1 + monthlyRate, term)) /
              (Math.pow(1 + monthlyRate, term) - 1);
  }
  const total    = monthly * term;
  const interest = total - amount;

  document.getElementById('monthlyResult').textContent  = '$' + fmt(monthly);
  document.getElementById('totalResult').textContent    = '$' + fmt(total);
  document.getElementById('interestResult').textContent = '$' + fmt(interest);
}

// Initialise on load
window.addEventListener('DOMContentLoaded', calcUpdate); */

/* ---------- Eligibility Checker ---------- */
function checkEligibility(e) {
  e.preventDefault();
  const age        = parseInt(document.getElementById('eAge').value);
  const income     = parseFloat(document.getElementById('eIncome').value);
  const employment = document.getElementById('eEmployment').value;
  const loanAmt    = parseFloat(document.getElementById('eLoanAmount').value);
  const resultDiv  = document.getElementById('eligibilityResult');

  let pass = true;
  let reasons = [];

  if (age < 20 || age > 70)           { pass = false; reasons.push('Age must be between 20 and 70.'); }
  if (income < 150000)                { pass = false; reasons.push('Minimum monthly income required is UGX 150,000.'); }
  if (employment === 'Unemployed')    { pass = false; reasons.push('Applicants must be currently employed or self-employed.'); }
  if (loanAmt > income * 36)          { pass = false; reasons.push('Requested amount exceeds the maximum based on your income.'); }

  resultDiv.style.display = 'block';
  if (pass) {
    resultDiv.className = 'eligibility-result pass';
    resultDiv.innerHTML = '<i class="fa-solid fa-circle-check"></i> You may be eligible! <a href="#apply" class="btn btn-primary" style="margin-top:12px;display:inline-flex;">Start Application</a>';
  } else {
    resultDiv.className = 'eligibility-result fail';
    resultDiv.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> You may not currently meet our criteria.<br><small>' + reasons.join(' ') + '</small><br><small>Please contact our team — we may have options available for your situation.</small>';
  }
}

/* ---------- Multi-step application form ---------- */
let currentStep = 1;

function nextStep(stepNum) {
  const current = document.getElementById('step' + currentStep);

  // Basic validation: check required fields in the current step
  const requiredFields = current.querySelectorAll('[required]');
  let valid = true;
  requiredFields.forEach(f => {
    if (!f.value.trim()) {
      f.style.borderColor = '#dc2626';
      valid = false;
    } else {
      f.style.borderColor = '';
    }
  });

  if (!valid) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }

  current.classList.add('hidden');
  document.getElementById('step' + stepNum).classList.remove('hidden');

  // Update step indicators
  const steps = document.querySelectorAll('.step');
  steps.forEach(s => {
    const n = parseInt(s.dataset.step);
    s.classList.remove('active', 'done');
    if (n === stepNum) s.classList.add('active');
    if (n < stepNum)   s.classList.add('done');
  });

  // Build review summary when reaching step 4
  if (stepNum === 4) buildReview();

  currentStep = stepNum;
  document.getElementById('apply').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function prevStep(stepNum) {
  document.getElementById('step' + currentStep).classList.add('hidden');
  document.getElementById('step' + stepNum).classList.remove('hidden');

  const steps = document.querySelectorAll('.step');
  steps.forEach(s => {
    const n = parseInt(s.dataset.step);
    s.classList.remove('active', 'done');
    if (n === stepNum) s.classList.add('active');
    if (n < stepNum)   s.classList.add('done');
  });

  currentStep = stepNum;
}

function buildReview() {
  const rows = [
    ['Full Name',         (document.getElementById('firstName').value + ' ' + document.getElementById('lastName').value).trim() || '—'],
    ['Date of Birth',     document.getElementById('dob').value || '—'],
    ['Email',             document.getElementById('email').value || '—'],
    ['Phone',             document.getElementById('phone').value || '—'],
    ['Employment',        document.getElementById('employment').value || '—'],
    ['Monthly Income',    document.getElementById('income').value ? 'UGX ' + parseFloat(document.getElementById('income').value).toLocaleString() : '—'],
    ['Loan Type',         document.getElementById('loanType').value || '—'],
    ['Loan Amount',       document.getElementById('loanAmount').value ? 'UGX ' + parseFloat(document.getElementById('loanAmount').value).toLocaleString() : '—'],
    ['Repayment Period',  document.getElementById('loanTerm').value || '—'],
    ['Purpose',           document.getElementById('loanPurpose').value || '—'],
  ];
  const html = rows.map(r => `<div class="review-row"><span>${r[0]}</span><strong>${r[1]}</strong></div>`).join('');
  document.getElementById('reviewSummary').innerHTML = html;
}

/* ---------- Form submission ---------- */
document.getElementById('loanApplicationForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const privacy  = document.getElementById('consentPrivacy').checked;
  const terms    = document.getElementById('consentTerms').checked;
  const accurate = document.getElementById('consentAccurate').checked;

  if (!privacy || !terms || !accurate) {
    showToast('Please accept all required consents to proceed.', 'error');
    return;
  }

  // Collect all form data
  const ref = 'JQL-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 90000) + 10000);

  const params = {
    ref_number:    ref,
    full_name:     document.getElementById('firstName').value + ' ' + document.getElementById('lastName').value,
    dob:           document.getElementById('dob').value,
    gender:        document.getElementById('gender').value,
    email:         document.getElementById('email').value,
    phone:         document.getElementById('phone').value,
    address:       document.getElementById('address').value,
    employment:    document.getElementById('employment').value,
    monthly_income:'UGX ' + parseFloat(document.getElementById('income').value || 0).toLocaleString(),
    loan_type:     document.getElementById('loanType').value,
    loan_amount:   'UGX ' + parseFloat(document.getElementById('loanAmount').value || 0).toLocaleString(),
    loan_term:     document.getElementById('loanTerm').value,
    loan_purpose:  document.getElementById('loanPurpose').value,
    notes:         document.getElementById('loanNotes').value || 'None',
    submitted_at:  new Date().toLocaleString(),
  };

  const submitBtn = this.querySelector('[type="submit"]');
  if (!window.emailJsReady || !window.emailjs ||
      ['YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID'].some(id => id.startsWith('YOUR_'))) {
    showToast('Online applications are not configured yet. Please contact our team.', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';

  // Send via EmailJS
  // Replace 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID' from your EmailJS dashboard
  emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', params)
    .then(() => {
      showApplicationSuccess(ref);
    })
    .catch((err) => {
      console.warn('EmailJS submission failed:', err);
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit Application';
      showToast('Your application was not sent. Please try again later.', 'error');
    });
});

function showApplicationSuccess(ref) {
  document.getElementById('loanApplicationForm').style.display = 'none';
  document.getElementById('stepIndicator').style.display = 'none';
  const successMsg = document.getElementById('successMsg');
  successMsg.style.display = 'block';
  document.getElementById('refNumber').textContent = ref;
  successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ---------- Camera / ID Scan ---------- */
let cameraStream = null;

function startCamera() {
  const container = document.getElementById('cameraContainer');
  const preview   = document.getElementById('capturedIdPreview');

  container.style.display = 'flex';
  preview.style.display   = 'none';

  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    .then(stream => {
      cameraStream = stream;
      document.getElementById('cameraFeed').srcObject = stream;
    })
    .catch(err => {
      container.style.display = 'none';
      showToast('Camera not available. Please upload your ID instead.', 'error');
      console.warn('Camera error:', err);
    });
}

function capturePhoto() {
  const video  = document.getElementById('cameraFeed');
  const canvas = document.getElementById('cameraCanvas');
  canvas.width  = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);

  const dataUrl = canvas.toDataURL('image/jpeg');
  document.getElementById('capturedIdImg').src = dataUrl;

  document.getElementById('cameraContainer').style.display  = 'none';
  document.getElementById('capturedIdPreview').style.display = 'flex';
  stopCamera(false);
}

function stopCamera(hideContainer = true) {
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
  }
  if (hideContainer) {
    document.getElementById('cameraContainer').style.display = 'none';
  }
}

function retakePhoto() {
  document.getElementById('capturedIdPreview').style.display = 'none';
  startCamera();
}

function previewIdUpload(event) {
  const file    = event.target.files[0];
  const preview = document.getElementById('idUploadPreview');
  const img     = document.getElementById('idUploadImg');

  if (!file) return;

  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = e => {
      img.src = e.target.result;
      img.style.display = 'block';
    };
    reader.readAsDataURL(file);
  } else {
    img.style.display = 'none';
  }
  document.getElementById('idUploadName').textContent = file.name;
  preview.style.display = 'flex';
}

function showFileName(input, spanId) {
  const span = document.getElementById(spanId);
  if (input.files.length > 0) {
    span.textContent = input.files.length > 1
      ? input.files.length + ' files selected'
      : input.files[0].name;
  }
}

/* ---------- Application Tracking ---------- */
function trackApplication() {
  const ref   = document.getElementById('trackRef').value.trim();
  const email = document.getElementById('trackEmail').value.trim();
  const result = document.getElementById('trackResult');

  if (!ref || !email) {
    showToast('Please enter your reference number and email.', 'error');
    return;
  }

  result.style.display = 'block';
  result.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ---------- Account login simulation ---------- */
function simulateLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPass').value.trim();

  if (!email || !pass) {
    showToast('Please enter your email and password.', 'error');
    return;
  }

  document.getElementById('loginCard').classList.add('hidden');
  document.getElementById('accountDashboard').classList.remove('hidden');
  // Show the name from the email
  const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  document.getElementById('dashName').textContent = name;
}

function logout() {
  document.getElementById('loginCard').classList.remove('hidden');
  document.getElementById('accountDashboard').classList.add('hidden');
  document.getElementById('loginEmail').value = '';
  document.getElementById('loginPass').value  = '';
}

/* ---------- FAQ accordion ---------- */
function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  const isOpen = answer.classList.contains('open');

  // Close all
  document.querySelectorAll('.faq-a').forEach(a => a.classList.remove('open'));
  document.querySelectorAll('.faq-q').forEach(q => q.classList.remove('open'));

  if (!isOpen) {
    answer.classList.add('open');
    btn.classList.add('open');
  }
}

/* ---------- Contact form ---------- */
function submitContact(e) {
  e.preventDefault();
  showToast('This contact form is not connected yet. Please email juliusquickcash@gmail.com.', 'error');
}

/* ---------- Live chat ---------- */
function toggleChat() {
  const popup = document.getElementById('chatPopup');
  const badge = document.querySelector('.chat-badge');
  const isOpen = popup.style.display !== 'none';
  popup.style.display = isOpen ? 'none' : 'block';
  if (!isOpen && badge) badge.style.display = 'none';
}

function sendChat() {
  const input = document.getElementById('chatInput');
  const body  = document.querySelector('.chat-body');
  const text  = input.value.trim();
  if (!text) return;

  const userMsg = document.createElement('div');
  userMsg.className = 'chat-msg user';
  userMsg.textContent = text;
  body.appendChild(userMsg);
  input.value = '';

  // Simulate agent reply
  setTimeout(() => {
    const agentMsg = document.createElement('div');
    agentMsg.className = 'chat-msg agent';
    const replies = [
      "Thanks for your message! Let me look into that for you.",
      "Great question. I'll connect you with the right team.",
      "I'd be happy to help. Could you share more details?",
      "Our team will follow up by email within a few hours.",
    ];
    agentMsg.textContent = replies[Math.floor(Math.random() * replies.length)];
    body.appendChild(agentMsg);
    body.scrollTop = body.scrollHeight;
  }, 800);

  body.scrollTop = body.scrollHeight;
}

/* ---------- Toast notification ---------- */
function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast toast-' + type;
  toast.innerHTML = `<i class="fa-solid ${type === 'error' ? 'fa-circle-xmark' : 'fa-circle-check'}"></i> ${message}`;
  document.body.appendChild(toast);

  // Inject styles if not present
  if (!document.getElementById('toastStyle')) {
    const style = document.createElement('style');
    style.id = 'toastStyle';
    style.textContent = `
      .toast {
        position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%);
        background: #1e293b; color: #fff; padding: 12px 24px; border-radius: 8px;
        font-size: .9rem; font-weight: 600; z-index: 9999;
        display: flex; align-items: center; gap: 8px;
        animation: fadeInUp .3s ease; box-shadow: 0 8px 24px rgba(0,0,0,.3);
      }
      .toast-error i { color: #f87171; }
      .toast-info  i { color: #6ee7b7; }
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateX(-50%) translateY(12px); }
        to   { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => toast.remove(), 3500);
}
