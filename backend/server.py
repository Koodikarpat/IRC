import os
import posixpath
import socketserver
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import unquote


class Handler(SimpleHTTPRequestHandler):
    """
    Makes it able to give the handler a directory to serve from.

    Mostly Python 3.7 code backported.
    """

    def __init__(self, *args, directory: str = None, **kwargs):
        if directory is None:
            directory = os.getcwd()
        self.directory = directory
        super().__init__(*args, **kwargs)

    def translate_path(self, path: str):
        path, *_ = path.split('?', 1)
        path, *_ = path.split('#', 1)
        path = path.strip()

        path = posixpath.normpath(unquote(path))
        words = [part for part in path.split('/') if part]

        trailing_slash = path.endswith('/')

        path = self.directory

        for word in words:
            if os.path.dirname(word) or word in ('.', '..'):
                continue
            path = os.path.join(path, word)

        return path + '/' * trailing_slash


class ThreadedServer(socketserver.ThreadingMixIn, HTTPServer):
    daemon_threads = True
