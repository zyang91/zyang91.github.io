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
