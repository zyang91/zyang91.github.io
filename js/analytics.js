/* Google Analytics 4 loader. Shared by every page, so the measurement ID
   lives in exactly one place. Only runs on the production hostnames —
   localhost and Vercel PR previews stay out of the reports. */

(function () {
	'use strict';

	/* Measurement ID from the Google Analytics data stream. */
	var MEASUREMENT_ID = 'G-PPP9D50V0Q';

	/* Hostnames whose traffic should be counted. Add one if the site moves. */
	var TRACKED_HOSTS = ['zhanchaoyang.com', 'www.zhanchaoyang.com'];

	if (TRACKED_HOSTS.indexOf(window.location.hostname) === -1) return;

	var tag = document.createElement('script');
	tag.async = true;
	tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
	document.head.appendChild(tag);

	window.dataLayer = window.dataLayer || [];
	function gtag() {
		window.dataLayer.push(arguments);
	}
	window.gtag = gtag;

	gtag('js', new Date());
	gtag('config', MEASUREMENT_ID);
})();
