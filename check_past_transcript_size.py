import sys, os
sys.stdout.reconfigure(encoding='utf-8')

log_paths = [
    r"C:\Users\tolga\.gemini\antigravity\brain\48140837-6b62-469e-acf5-cfa4047dedd4\.system_generated\logs\transcript.jsonl",
    r"C:\Users\tolga\.gemini\antigravity\brain\f678f0a7-ec99-4110-a467-1ed3c3245420\.system_generated\logs\transcript.jsonl"
]

for lp in log_paths:
    if os.path.exists(lp):
        print(f"Transcript exists: {lp} (size: {os.path.getsize(lp)} bytes)")
    else:
        print(f"Transcript NOT found: {lp}")
