ARG BASE_IMAGE=frappe/erpnext:v16.34.2
FROM ${BASE_IMAGE}

USER root

WORKDIR /home/frappe/frappe-bench/apps/erpnext

# Copy custom erpnext repository code
COPY --chown=frappe:frappe . /home/frappe/frappe-bench/apps/erpnext/

USER frappe

# Reinstall editable package, compile all assets, sync assets.json and assets directories
RUN /home/frappe/frappe-bench/env/bin/pip install --no-cache-dir -e /home/frappe/frappe-bench/apps/erpnext \
    && bench build --app erpnext --production \
    && python3 -c "import json, glob, os; \
for p in ['/home/frappe/frappe-bench/assets/assets.json', '/home/frappe/frappe-bench/sites/assets/assets.json']: \
    if not os.path.exists(p): continue; \
    d = json.load(open(p)); \
    for f in glob.glob('/home/frappe/frappe-bench/apps/erpnext/erpnext/public/dist/css/*.css'): \
        if 'map' in f: continue; \
        bn = os.path.basename(f); \
        k = 'erpnext-web.bundle.css' if 'erpnext-web' in bn else 'erpnext.bundle.css' if 'erpnext.bundle' in bn else 'erpnext_email.bundle.css' if 'erpnext_email' in bn else None; \
        if k: d[k] = f'/assets/erpnext/dist/css/{bn}'; \
    for f in glob.glob('/home/frappe/frappe-bench/apps/erpnext/erpnext/public/dist/js/*.js'): \
        if 'map' in f: continue; \
        bn = os.path.basename(f); \
        k = 'erpnext.bundle.js' if 'erpnext.bundle' in bn else 'bank-reconciliation-tool.bundle.js' if 'bank-reconciliation' in bn else 'item-dashboard.bundle.js' if 'item-dashboard' in bn else 'point-of-sale.bundle.js' if 'point-of-sale' in bn else 'bom_configurator.bundle.js' if 'bom_configurator' in bn else None; \
        if k: d[k] = f'/assets/erpnext/dist/js/{bn}'; \
    json.dump(d, open(p, 'w'), indent=4)" \
    && cp -rf /home/frappe/frappe-bench/apps/erpnext/erpnext/public/dist/* /home/frappe/frappe-bench/sites/assets/erpnext/dist/ \
    && cp -rf /home/frappe/frappe-bench/apps/erpnext/erpnext/public/images/* /home/frappe/frappe-bench/sites/assets/erpnext/images/

WORKDIR /home/frappe/frappe-bench
