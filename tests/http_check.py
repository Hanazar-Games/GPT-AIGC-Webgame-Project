from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import urlopen
import threading


ROOT = Path(__file__).resolve().parents[1]
URLS = [
    "/",
    "/src/styles.css",
    "/src/game.js",
    "/src/achievements.js",
    "/src/audio.js",
    "/src/storage.js",
    "/src/upgrades.js",
]


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        return


def main():
    handler = partial(QuietHandler, directory=ROOT)
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base_url = f"http://127.0.0.1:{server.server_port}"

    try:
        for path in URLS:
            try:
                with urlopen(f"{base_url}{path}", timeout=2) as response:
                    if response.status != 200:
                        raise AssertionError(f"{path} returned {response.status}")
            except HTTPError as error:
                raise AssertionError(f"{path} returned {error.code}") from error
        print("HTTP checks passed.")
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)


if __name__ == "__main__":
    main()
