/* ==========================================================
   SUBTLE PAGE TRANSITIONS
   Fades the page in on load, and fades out briefly before
   following an internal .html link, so navigation between
   routes feels like one continuous app instead of a hard cut.
   ========================================================== */

document.documentElement.classList.add('page-transitions');

document.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => {
    document.body.classList.add('page-visible');
  });
});

document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (!link) return;

  const href = link.getAttribute('href');
  if (!href) return;
  if (href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:')) return;
  if (link.target === '_blank' || link.hasAttribute('download')) return;
  if (!href.endsWith('.html')) return;
  if (e.metaKey || e.ctrlKey || e.shiftKey) return; // let "open in new tab" work normally

  e.preventDefault();
  document.body.classList.remove('page-visible');
  document.body.classList.add('page-leaving');

  setTimeout(() => {
    window.location.href = href;
  }, 160);
});
