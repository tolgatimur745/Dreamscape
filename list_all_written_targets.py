import json, sys, os
sys.stdout.reconfigure(encoding='utf-8')
log_path = r"C:\Users\tolga\.gemini\antigravity\brain\3723cff0-1cca-4bbe-8028-a62ee9cb86a5\.system_generated\logs\transcript.jsonl"

with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
    for idx, line in enumerate(f):
        try:
            obj = json.loads(line)
        except Exception:
            continue
        
        tool_calls = obj.get('tool_calls', [])
        for tc_idx, tc in enumerate(tool_calls):
            name = tc.get('name', '')
            args = tc.get('args', tc.get('arguments', {}))
            tf = args.get('TargetFile', args.get('Target', ''))
            if tf and ('app.js' in tf or 'index.html' in tf or 'new_modules.js' in tf or 'add_js.js' in tf):
                desc = args.get('Description', args.get('Instruction', ''))
                print(f"Line {idx} (Step {obj.get('step_index')}): Tool={name}, Target={tf}, Desc={desc[:100]}")
