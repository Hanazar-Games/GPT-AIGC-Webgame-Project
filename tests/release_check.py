from pathlib import Path
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[1]


def run_check(label, command):
    print(f"==> {label}", flush=True)
    result = subprocess.run(command, cwd=ROOT, text=True, check=False)
    if result.returncode:
        raise SystemExit(result.returncode)


def main():
    python = sys.executable
    run_check("Smoke checks", [python, "tests/smoke.py"])
    run_check("HTTP asset checks", [python, "tests/http_check.py"])
    print("Release checks passed.")


if __name__ == "__main__":
    main()
