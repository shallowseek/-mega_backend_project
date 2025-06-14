import subprocess

def start():
    subprocess.run(["git", "add", "."])
    subprocess.run(["git", "commit", "-m", "Auto commit"])
    subprocess.run(["git", "push", "-u", "origin", "main"])

if __name__ == "__main__":
    start()