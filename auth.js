document.addEventListener('DOMContentLoaded', () => {

  const registerForm = document.getElementById('registerForm');
  const loginForm     = document.getElementById('loginForm');

  // If someone is already signed in and lands on login/register, send them
  // straight into the site instead of showing the auth forms again.
  auth.onAuthStateChanged((user) => {
    if (user && (registerForm || loginForm)) {
      window.location.href = 'index.html';
    }
  });

  /* ----------------------------------------
     REGISTER PAGE
  ---------------------------------------- */
  if (registerForm) {
    const typeButtons = document.querySelectorAll('.account-type-btn');
    const freelancerFields = document.getElementById('freelancerFields');
    let accountType = 'visitor'; // default

    typeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        typeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        accountType = btn.dataset.type;
        freelancerFields.hidden = accountType !== 'freelancer';
      });
    });

    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const firstName = document.getElementById('firstName').value.trim();
      const lastName  = document.getElementById('lastName').value.trim();
      const email     = document.getElementById('regEmail').value.trim();
      const phone     = document.getElementById('phone').value.trim();
      const password  = document.getElementById('regPassword').value;
      const errorBox  = document.getElementById('authError');
      const submitBtn = registerForm.querySelector('button[type="submit"]');

      errorBox.textContent = '';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating account...';

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

        window.location.href = 'index.html';

      } catch (err) {
        errorBox.textContent = friendlyError(err);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
      }
    });
  }

  /* ----------------------------------------
     LOGIN PAGE
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
        const credential = await auth.signInWithEmailAndPassword(email, password);

        // Look up the account type so you can branch later
        // (e.g. send freelancers to a different page than visitors).
        const doc = await db.collection('users').doc(credential.user.uid).get();
        const accountType = doc.exists ? doc.data().accountType : 'visitor';

        if (accountType === 'freelancer') {
          window.location.href = 'index.html'; // swap for a freelancer dashboard later
        } else {
          window.location.href = 'index.html'; // swap for a visitor dashboard later
        }

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
      default:
        return err.message || 'Something went wrong. Please try again.';
    }
  }

});
