import frappe
from frappe import _


def block_administrator_login(login_manager=None):
	"""
	Prevent web login using standard Administrator/admin usernames.
	Only authorized personal usernames (e.g. hs32) are permitted to log in.
	"""
	usr = (frappe.form_dict.get("usr") or "").strip().lower()
	if usr in ["administrator", "admin", "admin@example.com"]:
		frappe.throw(_("Invalid login credentials"), frappe.AuthenticationError)
