import subprocess
from pathlib import Path


def clone_or_update(clone_url: str, repository_id: str, branch: str) -> dict:
    """
    Returns: { "clone_dir": str, "commit_sha": str, "commit_message": str }
    Raises: subprocess.CalledProcessError on git failure
    """
    clone_dir = Path(f"/tmp/repolens/{repository_id}")

    if clone_dir.exists():
        subprocess.run(
            ["git", "-C", str(clone_dir), "fetch", "--all"],
            check=True,
            capture_output=True,
            text=True,
        )

        subprocess.run(
            ["git", "-C", str(clone_dir), "checkout", branch],
            check=True,
            capture_output=True,
            text=True,
        )

        subprocess.run(
            ["git", "-C", str(clone_dir), "pull"],
            check=True,
            capture_output=True,
            text=True,
        )

    else:
        clone_dir.parent.mkdir(parents=True, exist_ok=True)

        subprocess.run(
            [
                "git",
                "clone",
                "--depth",
                "1",
                "--branch",
                branch,
                clone_url,
                str(clone_dir),
            ],
            check=True,
            capture_output=True,
            text=True,
        )

    commit_sha = subprocess.run(
        ["git", "-C", str(clone_dir), "rev-parse", "HEAD"],
        check=True,
        capture_output=True,
        text=True,
    ).stdout.strip()

    commit_message = subprocess.run(
        ["git", "-C", str(clone_dir), "log", "-1", "--pretty=%s"],
        check=True,
        capture_output=True,
        text=True,
    ).stdout.strip()

    return {
        "clone_dir": str(clone_dir),
        "commit_sha": commit_sha,
        "commit_message": commit_message,
    }