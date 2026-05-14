function initCinematicMenu() {
	const toggle = document.getElementById("cinematic-menu-toggle");
	const closeBtn = document.getElementById("cinematic-menu-close");
	const panel = document.getElementById("cinematic-menu-panel");
	const nav = document.getElementById("cinematic-nav");
	if (!toggle || !panel) return;

	function openMenu() {
		panel.classList.add("open");
		panel.setAttribute("aria-hidden", "false");
		toggle.setAttribute("aria-expanded", "true");
		document.body.classList.add("menu-open");
	}

	function closeMenu() {
		panel.classList.remove("open");
		panel.setAttribute("aria-hidden", "true");
		toggle.setAttribute("aria-expanded", "false");
		document.body.classList.remove("menu-open");
	}

	toggle.addEventListener("click", openMenu);
	if (closeBtn) closeBtn.addEventListener("click", closeMenu);

	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape" && panel.classList.contains("open")) {
			closeMenu();
		}
	});

	panel.querySelectorAll("a").forEach((a) => {
		a.addEventListener("click", closeMenu);
	});

	if (nav) {
		const onScroll = () => {
			if (window.scrollY > 24) {
				nav.classList.add("scrolled");
			} else {
				nav.classList.remove("scrolled");
			}
		};
		window.addEventListener("scroll", onScroll, { passive: true });
		onScroll();
	}
}

initCinematicMenu();

const funFacts = [
	"I once mapped hiking trails with LiDAR and still got lost (on purpose).",
	"I can switch from ArcGIS Pro to Excel faster than you can say 'buffer'.",
	"My favorite kind of traffic is the kind I can model in R.",
	"I collect conference badges like other people collect sneakers.",
	"Maps are just stories that decided to become spatial.",
	"I am fluent in Python, R, and the universal language of coffee.",
];

const funFactEl = document.getElementById("fun-fact");
const yearEl = document.getElementById("year");
const themeToggle = document.getElementById("theme-toggle");
const copyButtons = document.querySelectorAll("[data-copy]");

let funFactIndex = 0;

function rotateFunFacts() {
	if (!funFactEl) return;
	funFactEl.textContent = funFacts[funFactIndex % funFacts.length];
	funFactIndex += 1;
}

function initTheme() {
	if (document.body.classList.contains("home-cinematic")) {
		document.body.classList.add("theme-light");
		return;
	}
	const savedTheme = localStorage.getItem("theme");
	if (savedTheme) {
		document.body.classList.toggle("theme-light", savedTheme === "light");
	}
}

function toggleTheme() {
	const isLight = document.body.classList.toggle("theme-light");
	localStorage.setItem("theme", isLight ? "light" : "dark");
}

function initCopyButtons() {
	copyButtons.forEach((button) => {
		button.addEventListener("click", () => {
			const value = button.dataset.copy;
			if (!value) return;
			navigator.clipboard.writeText(value);
			button.textContent = "Copied!";
			setTimeout(() => {
				button.textContent = "Copy";
			}, 1500);
		});
	});
}

if (yearEl) {
	yearEl.textContent = new Date().getFullYear();
}

initTheme();
rotateFunFacts();
setInterval(rotateFunFacts, 6000);
initCopyButtons();

if (themeToggle) {
	themeToggle.addEventListener("click", toggleTheme);
}
