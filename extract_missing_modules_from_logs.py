import json, re, sys, os
sys.stdout.reconfigure(encoding='utf-8')

log_paths = [
    r"C:\Users\tolga\.gemini\antigravity\brain\3723cff0-1cca-4bbe-8028-a62ee9cb86a5\.system_generated\logs\transcript.jsonl",
    r"C:\Users\tolga\.gemini\antigravity\brain\48140837-6b62-469e-acf5-cfa4047dedd4\.system_generated\logs\transcript.jsonl",
    r"C:\Users\tolga\.gemini\antigravity\brain\f678f0a7-ec99-4110-a467-1ed3c3245420\.system_generated\logs\transcript.jsonl"
]

keywords = [
    'lenia', 'cymatics', 'double-pendulum', 'blackhole', 'quantum', 'debate-sec', 
    'color-flood', 'memory-orbit', 'dream-weaver', 'zen-mentor', 'turing-detective', 'pitch-negotiator',
    'nebula-sec', 'dreampad-sec', 'bonsai-sec', 'flowfield-sec', 'sand-sec', 'flappy-sec', 
    'shooter-sec', 'm2048-sec', 'maze-sec', 'telescope-sec', 'aura-sec', 'kaleido-sec', 
    'orbit-sec', 'zenclock-sec', 'wheel-sec', 'text-sec', 'stopwatch-sec', 'notes-sec', 
    'crypto-sec', 'bmi-sec', 'binaural-sec', 'water-sec', 'todo-sec'
]

os.makedirs('extracted_missing', exist_ok=True)
found_count = 0

for lp in log_paths:
    if not os.path.exists(lp):
        continue
    print(f"Scanning log: {os.path.basename(os.path.dirname(os.path.dirname(os.path.dirname(lp))))}")
    
    with open(lp, 'r', encoding='utf-8', errors='ignore') as f:
        for idx, line in enumerate(f):
            try:
                obj = json.loads(line)
            except Exception:
                continue
            
            # Search content
            content = obj.get('content', '')
            if content and any(kw in content.lower() for kw in keywords):
                # check for js blocks
                code_blocks = re.findall(r"```javascript(.*?)```", content, re.DOTALL)
                if not code_blocks:
                    code_blocks = re.findall(r"```js(.*?)```", content, re.DOTALL)
                for cb_idx, cb in enumerate(code_blocks):
                    if len(cb) > 800:
                        matched = [kw for kw in keywords if kw in cb.lower()]
                        if matched:
                            found_count += 1
                            out_path = f"extracted_missing/content_{os.path.basename(os.path.dirname(os.path.dirname(os.path.dirname(lp))))}_line_{idx}_cb_{cb_idx}.js"
                            with open(out_path, 'w', encoding='utf-8') as out_f:
                                out_f.write(cb.strip())
                            print(f"  Found JS in content: line {idx}, matches={matched}, len={len(cb)} -> Saved to {out_path}")

            # Search tool_calls
            tool_calls = obj.get('tool_calls', obj.get('args', {}).get('tool_calls', []))
            if not tool_calls and 'tool_calls' in obj:
                tool_calls = obj['tool_calls']
                
            for tc_idx, tc in enumerate(tool_calls):
                name = tc.get('name', '')
                args = tc.get('args', tc.get('arguments', {}))
                
                for arg_name, arg_val in args.items():
                    if isinstance(arg_val, str) and len(arg_val) > 800:
                        matched = [kw for kw in keywords if kw in arg_val.lower()]
                        if matched:
                            found_count += 1
                            out_path = f"extracted_missing/tool_{os.path.basename(os.path.dirname(os.path.dirname(os.path.dirname(lp))))}_line_{idx}_{name}_{arg_name}.js"
                            with open(out_path, 'w', encoding='utf-8') as out_f:
                                out_f.write(arg_val)
                            print(f"  Found tool arg: line {idx}, tool={name}, matches={matched}, len={len(arg_val)} -> Saved to {out_path}")
                    elif isinstance(arg_val, list):
                        for chunk_idx, chunk in enumerate(arg_val):
                            if isinstance(chunk, dict):
                                content = chunk.get('ReplacementContent', chunk.get('TargetContent', ''))
                                if len(content) > 800:
                                    matched = [kw for kw in keywords if kw in content.lower()]
                                    if matched:
                                        found_count += 1
                                        out_path = f"extracted_missing/tool_{os.path.basename(os.path.dirname(os.path.dirname(os.path.dirname(lp))))}_line_{idx}_{name}_chunk_{chunk_idx}.js"
                                        with open(out_path, 'w', encoding='utf-8') as out_f:
                                            out_f.write(content)
                                        print(f"  Found tool chunk: line {idx}, tool={name}, matches={matched}, len={len(content)} -> Saved to {out_path}")

print(f"Scan complete. Found {found_count} JS snippets.")
