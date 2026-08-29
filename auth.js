document.addEventListener('DOMContentLoaded', () => {

  const registerForm     = document.getElementById('registerForm');
  const loginForm        = document.getElementById('loginForm');
  const registerFormWrap = document.getElementById('registerFormWrap');
  const verifyNotice     = document.getElementById('verifyNotice');

  // Prevents the "already signed in" redirect below from racing ahead
  // of the registration flow — createUserWithEmailAndPassword signs
  // the user in immediately, which would otherwise fire the redirect
  // before the user ever sees the "Account created" message.
  let suppressAutoRedirect = false;

  function showVerifyNotice() {
    if (registerFormWrap) registerFormWrap.hidden = true;
    if (verifyNotice) verifyNotice.hidden = false;
  }

  /* ----------------------------------------
     If someone already has a Firebase session
     and lands on login/register, send them
     straight into the site. Login access only
     depends on being signed in — not on email
     verification.
  ---------------------------------------- */
  auth.onAuthStateChanged((user) => {
    if (user && (registerForm || loginForm) && !suppressAutoRedirect) {
      window.location.href = 'index.html';
    }
  });

  /* ----------------------------------------
     REGISTER PAGE
  ---------------------------------------- */
  if (registerForm) {
    const typeButtons      = document.querySelectorAll('.account-type-btn');
    const freelancerFields = document.getElementById('freelancerFields');
    const phoneInput       = document.getElementById('phone');
    const phoneLabel       = document.getElementById('phoneLabel');
    let accountType = 'visitor'; // default

    function applyPhoneRequirement() {
      const isFreelancer = accountType === 'freelancer';
      phoneInput.required = isFreelancer;
      if (phoneLabel) {
        phoneLabel.textContent = isFreelancer ? 'Phone Number (Required)' : 'Phone Number (Optional)';
      }
    }

    applyPhoneRequirement(); // set the correct initial state on page load

    typeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        typeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        accountType = btn.dataset.type;
        freelancerFields.hidden = accountType !== 'freelancer';
        applyPhoneRequirement();
      });
    });

    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const firstName = document.getElementById('firstName').value.trim();
      const lastName  = document.getElementById('lastName').value.trim();
      const email     = document.getElementById('regEmail').value.trim();
      const phone     = phoneInput.value.trim();
      const password  = document.getElementById('regPassword').value;
      const errorBox  = document.getElementById('authError');
      const submitBtn = registerForm.querySelector('button[type="submit"]');

      errorBox.textContent = '';

      // Work With Us requires a phone number; Just Visiting does not.
      // The HTML `required` attribute already blocks submission for
      // Work With Us via the browser's native validation, but we
      // double-check here too so there's no gap either way.
      if (accountType === 'freelancer' && !phone) {
        errorBox.textContent = 'Please enter a phone number so we can reach you about your project.';
        phoneInput.focus();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating account...';
      suppressAutoRedirect = true;

      try {
        const credential = await auth.createUserWithEmailAndPassword(email, password);

        await credential.user.updateProfile({
          displayName: `${firstName} ${lastName}`
        });

        // Base profile fields, saved for every account type.
        const userDoc = {
          firstName,
          lastName,
          email,
          phone,
          accountType,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Extra fields only collected for freelancer/client accounts.
        if (accountType === 'freelancer') {
          const servicesNeeded = Array.from(
            document.querySelectorAll('#freelancerFields input[type="checkbox"]:checked')
          ).map(cb => cb.value);

          userDoc.engagementType = document.getElementById('engagementType').value;
          userDoc.servicesNeeded = servicesNeeded;
          userDoc.budget = document.getElementById('budget').value;
          userDoc.projectBrief = document.getElementById('projectBrief').value.trim();
        }

        await db.collection('users').doc(credential.user.uid).set(userDoc);

        // Registration triggers Firebase's built-in verification email.
        // This is informational only — it does NOT block login or
        // portfolio access. The user is already signed in at this
        // point, so we let them continue straight through.
        try {
          await credential.user.sendEmailVerification();
        } catch (verifyErr) {
          console.error('Could not send verification email:', verifyErr);
        }

        showVerifyNotice();

      } catch (err) {
        errorBox.textContent = friendlyError(err);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
        suppressAutoRedirect = false;
      }
    });
  }

  /* ----------------------------------------
     LOGIN PAGE
     Email + Password only. Email verification
     status has no effect on whether login
     succeeds or whether the user reaches the
     portfolio homepage.
  ---------------------------------------- */
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email     = document.getElementById('loginEmail').value.trim();
      const password  = document.getElementById('loginPassword').value;
      const errorBox  = document.getElementById('authError');
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      errorBox.textContent = '';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Logging in...';

      try {
        await auth.signInWithEmailAndPassword(email, password);
        window.location.href = 'index.html';

      } catch (err) {
        errorBox.textContent = friendlyError(err);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Log In';
      }
    });
  }

  function friendlyError(err) {
    switch (err.code) {
      case 'auth/email-already-in-use':
        return 'That email is already registered. Try logging in instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a moment and try again.';
      default:
        return err.message || 'Something went wrong. Please try again.';
    }
  }

});
