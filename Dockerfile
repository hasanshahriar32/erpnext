ARG BASE_IMAGE=frappe/erpnext:v16.34.2
FROM ${BASE_IMAGE}

USER root

WORKDIR /home/frappe/frappe-bench/apps/erpnext

# Copy custom erpnext repository code
COPY --chown=frappe:frappe . /home/frappe/frappe-bench/apps/erpnext/

USER frappe

# Reinstall editable package and compile any modified JS/CSS frontend assets
RUN /home/frappe/frappe-bench/env/bin/pip install --no-cache-dir -e /home/frappe/frappe-bench/apps/erpnext \
    && bench build --app erpnext --production

WORKDIR /home/frappe/frappe-bench
