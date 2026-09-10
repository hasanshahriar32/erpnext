import json
import glob
import os
import shutil

def sync():
    dist_css = "/home/frappe/frappe-bench/apps/erpnext/erpnext/public/dist/css"
    dist_js = "/home/frappe/frappe-bench/apps/erpnext/erpnext/public/dist/js"
    sites_assets_dist = "/home/frappe/frappe-bench/sites/assets/erpnext/dist"
    sites_assets_img = "/home/frappe/frappe-bench/sites/assets/erpnext/images"
    src_img = "/home/frappe/frappe-bench/apps/erpnext/erpnext/public/images"

    for p in ['/home/frappe/frappe-bench/assets/assets.json', '/home/frappe/frappe-bench/sites/assets/assets.json']:
        if not os.path.exists(p):
            continue
        try:
            with open(p, 'r') as f:
                d = json.load(f)

            for fpath in glob.glob(os.path.join(dist_css, '*.css')):
                if 'map' in fpath:
                    continue
                bn = os.path.basename(fpath)
                if 'erpnext-web' in bn:
                    k = 'erpnext-web.bundle.css'
                elif 'erpnext.bundle' in bn:
                    k = 'erpnext.bundle.css'
                elif 'erpnext_email' in bn:
                    k = 'erpnext_email.bundle.css'
                else:
                    k = None
                if k:
                    d[k] = f'/assets/erpnext/dist/css/{bn}'

            for fpath in glob.glob(os.path.join(dist_js, '*.js')):
                if 'map' in fpath:
                    continue
                bn = os.path.basename(fpath)
                if 'erpnext.bundle' in bn:
                    k = 'erpnext.bundle.js'
                elif 'bank-reconciliation' in bn:
                    k = 'bank-reconciliation-tool.bundle.js'
                elif 'item-dashboard' in bn:
                    k = 'item-dashboard.bundle.js'
                elif 'point-of-sale' in bn:
                    k = 'point-of-sale.bundle.js'
                elif 'bom_configurator' in bn:
                    k = 'bom_configurator.bundle.js'
                else:
                    k = None
                if k:
                    d[k] = f'/assets/erpnext/dist/js/{bn}'

            with open(p, 'w') as f:
                json.dump(d, f, indent=4)
            print(f"Successfully updated {p}")
        except Exception as e:
            print(f"Error updating {p}: {e}")

    # Copy files into sites/assets
    if os.path.exists(sites_assets_dist):
        try:
            shutil.copytree("/home/frappe/frappe-bench/apps/erpnext/erpnext/public/dist", sites_assets_dist, dirs_exist_ok=True)
            print("Copied dist assets to sites/assets/erpnext/dist")
        except Exception as e:
            print(f"Error copying dist: {e}")

    if os.path.exists(sites_assets_img) and os.path.exists(src_img):
        try:
            shutil.copytree(src_img, sites_assets_img, dirs_exist_ok=True)
            print("Copied images to sites/assets/erpnext/images")
        except Exception as e:
            print(f"Error copying images: {e}")

if __name__ == '__main__':
    sync()
