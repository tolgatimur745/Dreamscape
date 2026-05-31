import sys, os, glob
sys.stdout.reconfigure(encoding='utf-8')

brain_dir = r"C:\Users\tolga\.gemini\antigravity\brain"
print("Scanning brain directory...")
subdirs = glob.glob(os.path.join(brain_dir, "*"))
for sd in subdirs:
    if os.path.isdir(sd):
        conv_id = os.path.basename(sd)
        print(f"Checking conversation: {conv_id}")
        # Search for any .js files inside or backups or system logs
        js_files = glob.glob(os.path.join(sd, "**", "*.js"), recursive=True)
        bak_files = glob.glob(os.path.join(sd, "**", "*.bak"), recursive=True)
        txt_files = glob.glob(os.path.join(sd, "**", "*.txt"), recursive=True)
        for f in js_files + bak_files + txt_files:
            print(f"  Found file: {f} (size: {os.path.getsize(f)} bytes)")
