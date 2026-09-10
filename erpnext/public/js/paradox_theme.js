// Paradox-BD ERP: Modern Enterprise Branding, Theme & Cloaking Controller
(function() {
	// Text replacement map to completely eliminate ERPNext and Frappe mentions
	const REPLACEMENTS = [
		[/\bERPNext Settings\b/gi, "Paradox Settings"],
		[/\bERPNext Integrations\b/gi, "Paradox Integrations"],
		[/\bERPNext User ID\b/gi, "Paradox User ID"],
		[/\bAbout ERPNext\b/gi, "About Paradox-BD ERP"],
		[/\bERPNext\b/gi, "Paradox-BD ERP"],
		[/\bFrappe Framework\b/gi, "Paradox Core Engine"],
		[/\bPowered by Frappe\b/gi, "Powered by Paradox Core"],
		[/\bBuilt on Frappe\b/gi, "Built on Paradox Core"],
		[/\bFrappe CRM\b/gi, "Paradox CRM"],
		[/\bFrappe\b/gi, "Paradox"]
	];

	function sanitizeText(text) {
		if (!text || typeof text !== "string") return text;
		let result = text;
		for (const [pattern, replacement] of REPLACEMENTS) {
			result = result.replace(pattern, replacement);
		}
		return result;
	}

	// 1. Text Cloaking & Sanitization in DOM
	function cloakERPNextText(root = document.body) {
		if (!root) return;

		// Skip script, style, and active inputs
		const walker = document.createTreeWalker(
			root,
			NodeFilter.SHOW_TEXT,
			{
				acceptNode: function(node) {
					if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
					const tag = node.parentElement ? node.parentElement.tagName : "";
					if (["SCRIPT", "STYLE", "TEXTAREA", "INPUT"].includes(tag)) return NodeFilter.FILTER_REJECT;
					if (node.parentElement && node.parentElement.isContentEditable) return NodeFilter.FILTER_REJECT;
					if (/ERPNext|Frappe/i.test(node.nodeValue)) return NodeFilter.FILTER_ACCEPT;
					return NodeFilter.FILTER_SKIP;
				}
			}
		);

		const nodesToUpdate = [];
		while (walker.nextNode()) {
			nodesToUpdate.push(walker.currentNode);
		}

		for (const node of nodesToUpdate) {
			node.nodeValue = sanitizeText(node.nodeValue);
		}
	}

	// 2. Wrap Frappe translation & localization functions
	function hookTranslations() {
		if (window.__ && !window.__paradoxHooked) {
			const orig__ = window.__;
			window.__ = function(txt, ...args) {
				const res = orig__(txt, ...args);
				return sanitizeText(res);
			};
			window.__paradoxHooked = true;
		}

		if (window.frappe && frappe._messages) {
			for (const key of Object.keys(frappe._messages)) {
				if (/ERPNext|Frappe/i.test(key)) {
					const sanitizedVal = sanitizeText(frappe._messages[key]);
					frappe._messages[key] = sanitizedVal;
				}
			}
		}
	}

	// 3. Override About Dialog
	function hookAboutDialog() {
		if (window.frappe && frappe.ui && frappe.ui.toolbar && !frappe.ui.toolbar._paradoxAboutHooked) {
			frappe.ui.toolbar._paradoxAboutHooked = true;
			frappe.ui.toolbar.show_about = function() {
				const dialog = new frappe.ui.Dialog({
					title: __("About Paradox-BD ERP"),
					indicator: "blue"
				});

				dialog.set_message(`
					<div style="text-align: center; padding: 24px 12px;">
						<img src="/assets/erpnext/images/paradox-logo.svg" style="height: 48px; margin-bottom: 16px; filter: drop-shadow(0 4px 12px rgba(99, 102, 241, 0.4));" alt="Paradox-BD">
						<h3 style="margin: 0 0 6px 0; font-weight: 700; font-size: 20px; color: #ffffff;">Paradox-BD Enterprise Cockpit</h3>
						<p style="color: #94a3b8; font-size: 13.5px; margin-bottom: 18px;">Intelligent Operations, Resource Planning & Financial Intelligence</p>
						<div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px; margin-bottom: 16px; display: inline-block;">
							<span style="color: #38bdf8; font-weight: 600; font-size: 13px;">Version 16.0-Enterprise</span>
							<span style="color: #64748b; margin: 0 8px;">•</span>
							<span style="color: #10b981; font-weight: 500; font-size: 13px;">Production Grade</span>
						</div>
						<p style="color: #64748b; font-size: 12px; margin: 0;">© 2026 Paradox Tech BD. All rights reserved.</p>
					</div>
				`);
				dialog.show();
			};
		}
	}

	// 4. Sidebar Workspace Header Branding
	function applySidebarBranding() {
		const headerLogo = document.querySelector('.sidebar-header .sidebar-item-icon .header-logo');
		if (headerLogo && !headerLogo.dataset.paradoxBranded) {
			headerLogo.dataset.paradoxBranded = "true";
			headerLogo.innerHTML = '<img src="/assets/erpnext/images/paradox-favicon.svg" alt="Paradox-BD" style="width: 24px; height: 24px; display: block; filter: drop-shadow(0 2px 6px rgba(99, 102, 241, 0.45));">';
		}

		const subtitle = document.querySelector('.sidebar-header .header-subtitle');
		if (subtitle && !subtitle.textContent.includes("PARADOX")) {
			subtitle.textContent = "PARADOX-BD ERP";
		}
	}

	// 5. Executive Cockpit Banner on Main Homepage (/desk/home)
	function injectHomepageCockpit() {
		const currentRoute = window.frappe && frappe.get_route ? frappe.get_route() : [];
		const isHome = currentRoute.length === 0 || 
			(currentRoute[0] === "Workspaces" && currentRoute[1] === "Home") ||
			(window.location.pathname === "/desk/home" || window.location.hash === "#workspace/Home");

		if (!isHome) return;

		const pageBody = document.querySelector('.layout-main-section, .page-container .page-body');
		if (!pageBody) return;

		if (!document.getElementById('paradox-cockpit-hero')) {
			const hero = document.createElement('div');
			hero.id = 'paradox-cockpit-hero';
			hero.className = 'paradox-hero-banner';
			hero.innerHTML = `
				<div class="paradox-hero-content">
					<div class="paradox-hero-badge">
						<span class="pulse-dot"></span>
						<span>PARADOX-BD ENTERPRISE COCKPIT</span>
					</div>
					<h1 class="paradox-hero-title">Executive Operations & Financial Intelligence</h1>
					<p class="paradox-hero-subtitle">Unified command center for multi-channel sales, procurement telemetry, inventory lifecycle, and corporate ledgers.</p>
					<div class="paradox-quick-actions">
						<button class="pdx-btn pdx-btn-primary" onclick="frappe.new_doc('Sales Invoice')">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
							<span>New Invoice</span>
						</button>
						<button class="pdx-btn pdx-btn-default" onclick="frappe.new_doc('Item')">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
							<span>Add Item</span>
						</button>
						<button class="pdx-btn pdx-btn-default" onclick="frappe.new_doc('Customer')">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
							<span>New Customer</span>
						</button>
						<button class="pdx-btn pdx-btn-default" onclick="frappe.set_route('point-of-sale')">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
							<span>POS Terminal</span>
						</button>
						<button class="pdx-btn pdx-btn-default" onclick="frappe.set_route('query-report', 'General Ledger')">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
							<span>General Ledger</span>
						</button>
					</div>
				</div>
			`;
			pageBody.prepend(hero);
		}
	}

	// 6. Desktop App Launcher Grid Redesign (#page-desktop)
	function redesignDesktopAppGrid() {
		const isDesktopRoute = window.location.pathname === "/desk" || (window.frappe && frappe.get_route_str && frappe.get_route_str() === "desktop");
		// Clean stale desktop layout from localStorage
		try {
			const currentUser = (window.frappe && frappe.session && frappe.session.user) || "Administrator";
			const saved = localStorage.getItem(`${currentUser}:desktop`);
			if (saved && (saved.includes("Framework") || saved.includes("ERPNext Settings") || saved.includes('"label":"ERPNext"'))) {
				localStorage.removeItem(`${currentUser}:desktop`);
				if (window.frappe && frappe.pages && frappe.pages.desktop && frappe.pages.desktop.desktop_page) {
					frappe.pages.desktop.desktop_page.update();
				}
			}
		} catch (e) {}

		// Hide Framework and Frappe Framework developer icons
		const devIconIds = [
			"Framework", "Frappe Framework", "ERPNext", "My Workspaces",
			"Automation", "Build", "Data", "Email", "Integrations", "Printing", "System", "Users", "Website"
		];
		devIconIds.forEach(id => {
			document.querySelectorAll(`.desktop-icon[data-id="${id}"]`).forEach(el => {
				el.style.display = 'none';
			});
		});

		// Rename ERPNext Settings icon to Paradox Settings
		const settingsIcon = document.querySelector('.desktop-icon[data-id="ERPNext Settings"], .desktop-icon[data-id="Paradox Settings"]');
		if (settingsIcon) {
			const titleEl = settingsIcon.querySelector('.icon-title');
			if (titleEl && titleEl.textContent !== "Paradox Settings") {
				titleEl.textContent = "Paradox Settings";
			}
		}

		// Rename Home icon to Operations Cockpit if present
		const homeIcon = document.querySelector('.desktop-icon[data-id="Home"]');
		if (homeIcon) {
			const homeTitle = homeIcon.querySelector('.icon-title');
			if (homeTitle && homeTitle.textContent === "Home") {
				homeTitle.textContent = "Operations Cockpit";
			}
		}

		// Inject Hero Banner in Desktop App Launcher
		const desktopContainer = document.querySelector('.desktop-wrapper .desktop-container');
		if (desktopContainer && !document.getElementById('paradox-appgrid-hero')) {
			const hero = document.createElement('div');
			hero.id = 'paradox-appgrid-hero';
			hero.className = 'paradox-appgrid-header';
			hero.innerHTML = `
				<div class="appgrid-badge">PARADOX-BD ENTERPRISE SUITE</div>
				<h2 class="appgrid-title">Application Operations Directory</h2>
				<p class="appgrid-subtitle">Central access gateway to enterprise modules, multi-channel sales, supply chain ledgers, and administration.</p>
			`;
			desktopContainer.prepend(hero);
		}

		// Make brand logo clickable to /desk
		const brandLogo = document.getElementById('brand-logo');
		if (brandLogo && !brandLogo.dataset.paradoxBound) {
			brandLogo.dataset.paradoxBound = "true";
			brandLogo.style.cursor = "pointer";
			brandLogo.onclick = function() {
				window.location.href = "/desk";
			};
		}
	}

	// 7. Avatar Dropdown Menu Hook
	function hookAvatarMenu() {
		document.querySelectorAll('.dropdown-menu a, .dropdown-menu .dropdown-item').forEach(item => {
			if (item.textContent.includes("Frappe Support")) {
				item.textContent = "Paradox Support";
				item.onclick = function(e) {
					e.preventDefault();
					window.location.href = "mailto:support@paradox-bd.com";
				};
			}
			if (item.textContent.includes("Frappe")) {
				item.textContent = sanitizeText(item.textContent);
			}
		});
	}

	// Master run loop
	function runParadoxEngine() {
		try {
			hookTranslations();
			hookAboutDialog();
			applySidebarBranding();
			cloakERPNextText();
			injectHomepageCockpit();
			redesignDesktopAppGrid();
			hookAvatarMenu();

			if (document.title && !document.title.includes("Paradox-BD ERP")) {
				document.title = document.title.replace(/Frappe|ERPNext/gi, "Paradox-BD ERP");
			}
		} catch (e) {
			console.debug("Paradox engine cycle:", e);
		}
	}

	// Initialization
	if (typeof window !== "undefined") {
		if (document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded", runParadoxEngine);
		} else {
			runParadoxEngine();
		}

		window.addEventListener("load", () => {
			runParadoxEngine();
			if (document.body) {
				const observer = new MutationObserver(() => {
					runParadoxEngine();
				});
				observer.observe(document.body, { childList: true, subtree: true });
			}
		});

		if (window.frappe && frappe.router) {
			frappe.router.on("change", () => {
				setTimeout(runParadoxEngine, 50);
				setTimeout(runParadoxEngine, 250);
				setTimeout(runParadoxEngine, 600);
			});
		}
	}
})();
