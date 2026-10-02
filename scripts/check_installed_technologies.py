import subprocess
import shutil
import json
import sys

tools = [
    # Runtimes & Package Managers
    "node", "npm", "npx", "pnpm", "yarn", "bun",
    "python", "py", "pip",
    # Version Control & Collaboration
    "git", "gh",
    # Virtualization & Containers
    "docker", "docker-compose", "wsl",
    # Cloud Platforms & CLI Tools
    "aws", "gcloud", "az", "databricks",
    # AI Coding Agents & Developer CLI Tools
    "gemini", "copilot", "opencode", "kimi", "agy", "jules", "hermes", "jcode", "claude", "specify",
    # Hardware & GPU Acceleration
    "nvidia-smi", "nvcc",
    # Databases & Caches
    "psql", "redis-cli", "sqlite3", "sqlcmd"
]

inventory = {}

for tool in tools:
    path = shutil.which(tool)
    if path:
        version_str = "Installed"
        try:
            flag = "--version"
            if tool in ["nvidia-smi"]:
                flag = ""
            elif tool in ["python", "py"]:
                flag = "--version"
            elif tool == "redis-cli":
                flag = "-v"
            elif tool == "psql":
                flag = "-V"
            
            cmd = [tool, flag] if flag else [tool]
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=5)
            out = (res.stdout or res.stderr).strip().split("\n")[0]
            if out:
                version_str = out[:100]
        except Exception as e:
            version_str = "Installed (Version check timed out/failed)"
        inventory[tool] = {"installed": True, "path": path, "version": version_str}
    else:
        inventory[tool] = {"installed": False}

print(json.dumps(inventory, indent=2))
