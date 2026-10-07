/* ══════════════════════════════════════════════════════════════
   Contact form — submits to FormSubmit via AJAX so visitors stay
   on the page. Without JS the form falls back to a normal POST.
══════════════════════════════════════════════════════════════ */

(() => {
	const form = document.getElementById('contact-form');
	if (!form) return;

	const status = document.getElementById('form-status');
	const button = form.querySelector('button[type="submit"]');
	const endpoint = form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/');

	const setStatus = (text, state) => {
		status.textContent = text;
		status.dataset.state = state || '';
	};

	form.addEventListener('submit', async (event) => {
		event.preventDefault();
		if (form.elements._honey.value) return;

		button.disabled = true;
		setStatus('Sending…', 'pending');

		try {
			const data = Object.fromEntries(new FormData(form));
			data._replyto = data.email;
			const response = await fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
				body: JSON.stringify(data),
			});
			const result = await response.json().catch(() => ({}));
			if (!response.ok || String(result.success) === 'false') {
				throw new Error(result.message || 'Request failed');
			}
			form.reset();
			setStatus('Thanks — your message is on its way. I’ll reply soon.', 'success');
		} catch {
			setStatus('Something went wrong. Please email me at zhanchao@upenn.edu instead.', 'error');
		} finally {
			button.disabled = false;
		}
	});
})();
