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
    && python3 /home/frappe/frappe-bench/apps/erpnext/scripts/sync_assets.py

WORKDIR /home/frappe/frappe-bench
