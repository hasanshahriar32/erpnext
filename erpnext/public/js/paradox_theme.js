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

	// 7. Bespoke Paradox-BD Custom Vector Icons & Gradient Badges (Dual-Tone Luxury SVG)
	const PARADOX_ICONS = {
		"Operations Cockpit": {
			gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)",
			shadow: "rgba(99, 102, 241, 0.45)",
			svg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><circle cx="12" cy="12" r="9.5" fill="#ffffff" fill-opacity="0.18" stroke="#ffffff" stroke-width="2"/><polygon points="16.5 7.5 13.5 13.5 7.5 16.5 10.5 10.5 16.5 7.5" fill="#ffffff" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="12" r="2" fill="#6366f1"/></svg>`
		},
		"Home": {
			gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)",
			shadow: "rgba(99, 102, 241, 0.45)",
			svg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><circle cx="12" cy="12" r="9.5" fill="#ffffff" fill-opacity="0.18" stroke="#ffffff" stroke-width="2"/><polygon points="16.5 7.5 13.5 13.5 7.5 16.5 10.5 10.5 16.5 7.5" fill="#ffffff" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="12" r="2" fill="#6366f1"/></svg>`
		},
		"Organization": {
			gradient: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
			shadow: "rgba(79, 70, 229, 0.45)",
			svg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" fill="#ffffff" fill-opacity="0.2" stroke="#ffffff" stroke-width="2"/><circle cx="9" cy="7" r="4" fill="#ffffff" fill-opacity="0.2" stroke="#ffffff" stroke-width="2"/><path d="M22 21v-2a4 4 0 0 0-3-3.87" stroke="#ffffff" stroke-width="2"/><path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="#ffffff" stroke-width="2"/></svg>`
		},
		"Accounting": {
			gradient: "linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)",
			shadow: "rgba(16, 185, 129, 0.45)",
			svg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" fill="#ffffff" fill-opacity="0.2" stroke="#ffffff" stroke-width="2"/><line x1="3" y1="9" x2="21" y2="9" stroke="#ffffff" stroke-width="2"/><line x1="9" y1="9" x2="9" y2="21" stroke="#ffffff" stroke-width="2"/><circle cx="15" cy="15" r="2.5" fill="#ffffff" stroke="#ffffff" stroke-width="1.5"/></svg>`
		},
		"Invoicing": {
			gradient: "linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)",
			shadow: "rgba(6, 182, 212, 0.45)",
			svg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#ffffff" fill-opacity="0.18" stroke="#ffffff" stroke-width="2"/><polyline points="14 2 14 8 20 8" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="13" x2="16" y2="13" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="17" x2="13" y2="17" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="17" r="1.5" fill="#ffffff"/></svg>`
		},
		"Payments": {
			gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
			shadow: "rgba(139, 92, 246, 0.45)",
			svg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><rect x="2" y="5" width="20" height="14" rx="3" fill="#ffffff" fill-opacity="0.2" stroke="#ffffff" stroke-width="2"/><line x1="2" y1="10" x2="22" y2="10" stroke="#ffffff" stroke-width="2"/><rect x="6" y="13" width="4" height="3" rx="1" fill="#ffffff"/><circle cx="17" cy="14.5" r="1.5" fill="#ffffff"/><circle cx="14" cy="14.5" r="1.5" fill="#ffffff" fill-opacity="0.5"/></svg>`
		},
		"Financial Reports": {
			gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
			shadow: "rgba(59, 130, 246, 0.45)",
			svg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><path d="M4 20h16" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><rect x="5" y="13" width="3" height="7" rx="1" fill="#ffffff" fill-opacity="0.3" stroke="#ffffff" stroke-width="1.8"/><rect x="10.5" y="9" width="3" height="11" rx="1" fill="#ffffff" fill-opacity="0.3" stroke="#ffffff" stroke-width="1.8"/><rect x="16" y="4" width="3" height="16" rx="1" fill="#ffffff" stroke="#ffffff" stroke-width="1.8"/><polyline points="5 11 11 7 16 3" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
		},
		"Accounts Setup": {
			gradient: "linear-gradient(135deg, #64748b 0%, #334155 100%)",
			shadow: "rgba(100, 116, 139, 0.45)",
			svg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><circle cx="12" cy="12" r="8" fill="#ffffff" fill-opacity="0.15" stroke="#ffffff" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="#ffffff" stroke="#ffffff" stroke-width="1.5"/><line x1="12" y1="1" x2="12" y2="4" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="20" x2="12" y2="23" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><line x1="1" y1="12" x2="4" y2="12" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><line x1="20" y1="12" x2="23" y2="12" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/></svg>`
		},
		"Taxes": {
			gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
			shadow: "rgba(245, 158, 11, 0.45)",
			svg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><circle cx="12" cy="12" r="9" fill="#ffffff" fill-opacity="0.18" stroke="#ffffff" stroke-width="2"/><line x1="17" y1="7" x2="7" y2="17" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><circle cx="9" cy="9" r="2" fill="#ffffff"/><circle cx="15" cy="15" r="2" fill="#ffffff"/></svg>`
		},
		"Banking": {
			gradient: "linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)",
			shadow: "rgba(20, 184, 166, 0.45)",
			svg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><path d="M2 20h20M3 9.5 12 4l9 5.5v1H3v-1z" fill="#ffffff" fill-opacity="0.22" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/><line x1="6" y1="11" x2="6" y2="19" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="11" x2="12" y2="19" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><line x1="18" y1="11" x2="18" y2="19" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/></svg>`
		},
		"Budget": {
			gradient: "linear-gradient(135deg, #22c55e 0%, #15803d 100%)",
			shadow: "rgba(34, 197, 94, 0.45)",
			svg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><path d="M20 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" fill="#ffffff" fill-opacity="0.2" stroke="#ffffff" stroke-width="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="#ffffff" stroke-width="2"/><circle cx="16" cy="13.5" r="2" fill="#ffffff"/><line x1="6" y1="12" x2="10" y2="12" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/></svg>`
		},
		"Share Management": {
			gradient: "linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)",
			shadow: "rgba(168, 85, 247, 0.45)",
			svg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><circle cx="18" cy="5" r="3" fill="#ffffff" stroke="#ffffff" stroke-width="1.8"/><circle cx="6" cy="12" r="3" fill="#ffffff" stroke="#ffffff" stroke-width="1.8"/><circle cx="18" cy="19" r="3" fill="#ffffff" stroke="#ffffff" stroke-width="1.8"/><line x1="8.6" y1="10.7" x2="15.4" y2="6.3" stroke="#ffffff" stroke-width="2"/><line x1="8.6" y1="13.3" x2="15.4" y2="17.7" stroke="#ffffff" stroke-width="2"/><circle cx="12" cy="12" r="1.5" fill="#ffffff" fill-opacity="0.4"/></svg>`
		},
		"Subscription": {
			gradient: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
			shadow: "rgba(236, 72, 153, 0.45)",
			svg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><circle cx="12" cy="12" r="8" fill="#ffffff" fill-opacity="0.15" stroke="#ffffff" stroke-width="1.8" stroke-dasharray="3 3"/><path d="M21 12A9 9 0 0 0 6 5.6L3 8" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="3 3 3 8 8 8" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 12a9 9 0 0 0 15 6.4l3-2.4" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="21 21 21 16 16 16" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
		},
		"Assets": {
			gradient: "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)",
			shadow: "rgba(234, 179, 8, 0.45)",
			svg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><polygon points="6 3 18 3 22 9 12 21 2 9 6 3" fill="#ffffff" fill-opacity="0.2" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/><line x1="2" y1="9" x2="22" y2="9" stroke="#ffffff" stroke-width="1.8"/><polyline points="8 3 12 9 16 3" stroke="#ffffff" stroke-width="1.8"/><line x1="12" y1="9" x2="12" y2="21" stroke="#ffffff" stroke-width="1.8"/></svg>`
		},
		"Buying": {
			gradient: "linear-gradient(135deg, #f97316 0%, #c2410c 100%)",
			shadow: "rgba(249, 115, 22, 0.45)",
			svg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><circle cx="9" cy="20" r="1.8" fill="#ffffff"/><circle cx="19" cy="20" r="1.8" fill="#ffffff"/><path d="M2 3h3.5l2.6 11.5a2 2 0 0 0 2 1.5h8.8a2 2 0 0 0 2-1.5L22 6.5H6" fill="#ffffff" fill-opacity="0.2" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="8" x2="12" y2="12" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/><line x1="16" y1="8" x2="16" y2="12" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/></svg>`
		},
		"Manufacturing": {
			gradient: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
			shadow: "rgba(99, 102, 241, 0.45)",
			svg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" fill="#ffffff" fill-opacity="0.2" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/><line x1="6" y1="18" x2="7.5" y2="18" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/><line x1="11.5" y1="18" x2="13" y2="18" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/><line x1="17" y1="18" x2="18.5" y2="18" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/></svg>`
		},
		"Projects": {
			gradient: "linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)",
			shadow: "rgba(14, 165, 233, 0.45)",
			svg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" fill="#ffffff" stroke="#ffffff" stroke-width="1.8"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" fill="#ffffff" fill-opacity="0.25" stroke="#ffffff" stroke-width="2"/><circle cx="15.5" cy="8.5" r="1.5" fill="#ffffff"/></svg>`
		},
		"Quality": {
			gradient: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
			shadow: "rgba(16, 185, 129, 0.45)",
			svg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#ffffff" fill-opacity="0.22" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/><polyline points="8.5 12 11 14.5 15.5 10" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
		},
		"Selling": {
			gradient: "linear-gradient(135deg, #f43f5e 0%, #be123c 100%)",
			shadow: "rgba(244, 63, 94, 0.45)",
			svg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><path d="M6 3h12l2 5v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8l2-5z" fill="#ffffff" fill-opacity="0.2" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/><line x1="4" y1="8" x2="20" y2="8" stroke="#ffffff" stroke-width="2"/><path d="M9 11a3 3 0 0 0 6 0" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/></svg>`
		},
		"Stock": {
			gradient: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
			shadow: "rgba(2, 132, 199, 0.45)",
			svg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill="#ffffff" fill-opacity="0.18" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/><polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="#ffffff" stroke-width="2"/><line x1="12" y1="22.08" x2="12" y2="12" stroke="#ffffff" stroke-width="2"/></svg>`
		},
		"Subcontracting": {
			gradient: "linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)",
			shadow: "rgba(6, 182, 212, 0.45)",
			svg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><rect x="3" y="4" width="18" height="16" rx="3" fill="#ffffff" fill-opacity="0.18" stroke="#ffffff" stroke-width="2"/><path d="M8 9h8M8 13h5M8 17h3" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><circle cx="16.5" cy="15.5" r="2.5" fill="#ffffff" stroke="#ffffff" stroke-width="1.5"/></svg>`
		},
		"Paradox Settings": {
			gradient: "linear-gradient(135deg, #4338ca 0%, #1e1b4b 100%)",
			shadow: "rgba(67, 56, 202, 0.55)",
			svg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><circle cx="12" cy="12" r="3" fill="#ffffff" stroke="#ffffff" stroke-width="1.5"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" fill="#ffffff" fill-opacity="0.22" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`
		}
	};

	// Fallback badge generator for any custom or new workspace
	function getDynamicBadgeConfig(label) {
		const palettes = [
			{ g: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", s: "rgba(99, 102, 241, 0.45)" },
			{ g: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)", s: "rgba(14, 165, 233, 0.45)" },
			{ g: "linear-gradient(135deg, #10b981 0%, #059669 100%)", s: "rgba(16, 185, 129, 0.45)" },
			{ g: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", s: "rgba(245, 158, 11, 0.45)" },
			{ g: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", s: "rgba(139, 92, 246, 0.45)" },
			{ g: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)", s: "rgba(244, 63, 94, 0.45)" }
		];
		let hash = 0;
		for (let i = 0; i < label.length; i++) hash = (hash << 5) - hash + label.charCodeAt(i);
		const p = palettes[Math.abs(hash) % palettes.length];
		return {
			gradient: p.g,
			shadow: p.s,
			svg: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" fill="#ffffff" fill-opacity="0.22" stroke="#ffffff" stroke-width="2"/><path d="M8 12h8M12 8v8" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/></svg>`
		};
	}

	function applyParadoxCustomIcons() {
		const icons = document.querySelectorAll('.desktop-icon');
		icons.forEach(iconEl => {
			let label = iconEl.dataset.id || "";
			if (!label) {
				const titleEl = iconEl.querySelector('.icon-title');
				if (titleEl) label = titleEl.textContent.trim();
			}
			if (!label) return;

			// Normalize legacy labels
			if (label === "ERPNext Settings") label = "Paradox Settings";
			if (label === "Home") label = "Operations Cockpit";

			const iconConfig = PARADOX_ICONS[label] || getDynamicBadgeConfig(label);

			let container = iconEl.querySelector('.icon-container');
			if (!container) {
				container = document.createElement('div');
				container.className = 'icon-container';
				iconEl.prepend(container);
			}

			// Clean any residual Frappe img or app-icon tags
			const staleImg = container.querySelector('img, .app-icon');
			if (staleImg) staleImg.remove();

			if (container.dataset.pdxApplied === label) return;
			container.dataset.pdxApplied = label;

			container.className = 'icon-container pdx-custom-badge';
			container.style.background = iconConfig.gradient;
			container.style.boxShadow = `0 10px 24px -4px ${iconConfig.shadow}, inset 0 1.5px 1.5px rgba(255, 255, 255, 0.55), inset 0 -2px 4px rgba(0, 0, 0, 0.2)`;

			let innerHtml = iconConfig.svg;
			if (label === "Accounting" && !iconEl.closest('.desktop-modal')) {
				innerHtml += `<span class="pdx-cluster-pill">9</span>`;
			}
			container.innerHTML = innerHtml;

			const titleEl = iconEl.querySelector('.icon-title');
			if (titleEl) {
				if (label === "Operations Cockpit") titleEl.textContent = "Operations Cockpit";
				if (label === "Paradox Settings") titleEl.textContent = "Paradox Settings";
			}
		});
	}

	// 8. Theme Synchronization & Modal Heading Enhancer
	function syncThemeAndHeading() {
		const root = document.documentElement;
		const mode = (root.getAttribute("data-theme-mode") || root.getAttribute("data-theme") || "light").toLowerCase();
		const isLight = mode === "light";
		const normalized = isLight ? "light" : "dark";

		if (root.getAttribute("data-theme") !== normalized) {
			root.setAttribute("data-theme", normalized);
		}
		if (document.body && document.body.getAttribute("data-theme") !== normalized) {
			document.body.setAttribute("data-theme", normalized);
		}

		// Dynamically enforce high-contrast modal heading color
		const headingEls = document.querySelectorAll('.desktop-modal-heading, .desktop-modal-heading *, .title-widget, .title-widget *');
		headingEls.forEach(el => {
			el.style.setProperty('color', isLight ? '#0f172a' : '#ffffff', 'important');
		});

		// Dynamically synchronize brand logo asset between light and dark themes
		const targetLogo = isLight ? "/assets/erpnext/images/paradox-logo-light.svg" : "/assets/erpnext/images/paradox-logo.svg";
		document.querySelectorAll('img[src*="paradox-logo"]').forEach(img => {
			if (!img.src.includes("-favicon") && !img.src.endsWith(targetLogo)) {
				img.src = targetLogo;
			}
		});
	}

	// 9. Avatar Dropdown Menu Hook
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
			syncThemeAndHeading();
			hookTranslations();
			hookAboutDialog();
			applySidebarBranding();
			cloakERPNextText();
			injectHomepageCockpit();
			redesignDesktopAppGrid();
			applyParadoxCustomIcons();
			hookAvatarMenu();

			if (document.title && !document.title.includes("Paradox-BD ERP")) {
				document.title = document.title.replace(/Frappe|ERPNext/gi, "Paradox-BD ERP");
			}
		} catch (e) {
			console.debug("Paradox engine cycle:", e);
		}
	}

	// Initialization & Realtime Theme/DOM Observers
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

			// Observe theme mode attribute changes on <html>
			const themeObserver = new MutationObserver(() => {
				runParadoxEngine();
			});
			themeObserver.observe(document.documentElement, {
				attributes: true,
				attributeFilter: ["data-theme", "data-theme-mode"]
			});
		});

		// Modal Event hooks (jQuery / Bootstrap)
		if (window.$) {
			$(document).on("show.bs.modal shown.bs.modal", () => {
				syncThemeAndHeading();
				setTimeout(() => { applyParadoxCustomIcons(); syncThemeAndHeading(); }, 10);
				setTimeout(() => { applyParadoxCustomIcons(); syncThemeAndHeading(); }, 80);
				setTimeout(() => { applyParadoxCustomIcons(); syncThemeAndHeading(); }, 250);
			});
		}

		if (window.frappe && frappe.router) {
			frappe.router.on("change", () => {
				setTimeout(runParadoxEngine, 50);
				setTimeout(runParadoxEngine, 200);
				setTimeout(runParadoxEngine, 500);
			});
		}
	}
})();
