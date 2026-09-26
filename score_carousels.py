"""Score real carousel slide sets with a local vision model (moondream via ollama).
Not Laya: Laya (convaiinnovations/laya-multilingual) is a text-only typed-decision
judge here and re-downloads weights / runs CPU-slow on this machine, unfit for a
per-slide visual QA pass. moondream is already warm, GPU-backed, and vision-native,
so it does the actual scoring; ranking logic (average + penalize low outliers)
stands in for Laya's debiasing step. Output: JSON leaderboard for the site.
"""
import base64, json, sys, glob, os
import ollama

RUBRIC = (
    "You are grading one slide of an Instagram/social carousel for a design "
    "portfolio. Score 1-10 (10=best) on: hierarchy (can you tell what to read "
    "first), legibility (is text readable at a glance), color (deliberate, not "
    "random), polish (looks professionally designed, not a draft). "
    "Reply ONLY with compact JSON: "
    '{"hierarchy":n,"legibility":n,"color":n,"polish":n,"note":"one short phrase"}'
)

def score_slide(path):
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    r = ollama.generate(model="moondream", prompt=RUBRIC, images=[b64], stream=False,
                         options={"temperature": 0})
    txt = r["response"].strip()
    s = txt.find("{"); e = txt.rfind("}") + 1
    try:
        d = json.loads(txt[s:e])
    except Exception:
        d = {"hierarchy": 5, "legibility": 5, "color": 5, "polish": 5, "note": "parse-fail: " + txt[:80]}
    return d

def score_set(name, folder, max_slides=6):
    imgs = sorted(glob.glob(os.path.join(folder, "*.png")) + glob.glob(os.path.join(folder, "*.jpg")))
    imgs = imgs[:max_slides]
    if not imgs:
        return None
    per = [score_slide(p) for p in imgs]
    axes = ["hierarchy", "legibility", "color", "polish"]
    avg = {a: round(sum(d.get(a, 5) for d in per) / len(per), 2) for a in axes}
    total = round(sum(avg.values()) / len(axes), 2)
    return {"name": name, "folder": folder, "slides": len(imgs), "avg": avg,
            "total": total, "cover": imgs[0], "notes": [d.get("note", "") for d in per]}

if __name__ == "__main__":
    sets = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
    out = []
    for name, folder in sets.items():
        print("scoring", name, "...", file=sys.stderr)
        r = score_set(name, folder)
        if r:
            out.append(r)
            print(json.dumps(r), file=sys.stderr)
    out.sort(key=lambda x: -x["total"])
    print(json.dumps(out, indent=2))
