// Paradox-BD ERP: Modern Desk Branding and Theme Controller
(function() {
	function initParadoxBranding() {
		try {
			// 1. Sidebar Workspace Header Branding
			const headerLogo = document.querySelector('.sidebar-header .sidebar-item-icon .header-logo');
			if (headerLogo && !headerLogo.dataset.paradoxBranded) {
				headerLogo.dataset.paradoxBranded = "true";
				headerLogo.innerHTML = '<img src="/assets/erpnext/images/paradox-favicon.svg" alt="Paradox-BD" style="width: 22px; height: 22px; display: block; filter: drop-shadow(0 2px 6px rgba(99, 102, 241, 0.45));">';
			}

			// 2. Sidebar Workspace Header Subtitle
			const subtitle = document.querySelector('.sidebar-header .header-subtitle');
			if (subtitle && !subtitle.textContent.includes("Paradox-BD ERP")) {
				subtitle.textContent = "Paradox-BD ERP";
			}

			// 3. Page Header: ensure modern title branding
			if (document.title && !document.title.includes("Paradox-BD ERP")) {
				document.title = document.title.replace(/Frappe|ERPNext/g, "Paradox-BD ERP");
			}

			// 4. If theme is undefined or light in local storage on first visit, ensure dark mode default
			if (!localStorage.getItem("theme") && !document.documentElement.getAttribute("data-theme")) {
				document.documentElement.setAttribute("data-theme", "dark");
				document.documentElement.setAttribute("data-theme-mode", "dark");
			}
		} catch (e) {
			console.debug("Paradox branding init:", e);
		}
	}

	// Execution hooks
	if (typeof window !== "undefined") {
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", initParadoxBranding);
		} else {
			initParadoxBranding();
		}

		// Observe dynamic workspace rerenders
		const observer = new MutationObserver(() => {
			initParadoxBranding();
		});

		window.addEventListener("load", () => {
			initParadoxBranding();
			if (document.body) {
				observer.observe(document.body, { childList: true, subtree: true });
			}
		});

		if (window.frappe && frappe.router) {
			frappe.router.on("change", () => {
				setTimeout(initParadoxBranding, 50);
				setTimeout(initParadoxBranding, 250);
			});
		}
	}
})();
