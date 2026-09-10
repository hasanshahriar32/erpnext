ARG BASE_IMAGE=frappe/erpnext:v16.34.2
FROM ${BASE_IMAGE}

USER root

WORKDIR /home/frappe/frappe-bench/apps/erpnext

# Copy custom erpnext repository code
COPY --chown=frappe:frappe . /home/frappe/frappe-bench/apps/erpnext/

USER frappe

# Reinstall editable package and compile any modified JS/CSS frontend assets
RUN /home/frappe/frappe-bench/env/bin/pip install --no-cache-dir -e /home/frappe/frappe-bench/apps/erpnext \
    && bench build --app erpnext --production \
    && python3 -c "import json, glob, os; p = '/home/frappe/frappe-bench/assets/assets.json'; d = json.load(open(p)); [d.update({('erpnext-web.bundle.css' if 'erpnext-web' in os.path.basename(f) else 'erpnext.bundle.css' if 'erpnext.bundle' in os.path.basename(f) else 'erpnext_email.bundle.css'): f'/assets/erpnext/dist/css/{os.path.basename(f)}'}) for f in glob.glob('/home/frappe/frappe-bench/apps/erpnext/erpnext/public/dist/css/*.css') if 'map' not in f]; json.dump(d, open(p, 'w'), indent=4)"

WORKDIR /home/frappe/frappe-bench

