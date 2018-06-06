import os
import posixpath
import socketserver
from http import HTTPStatus
from http.cookies import SimpleCookie
from http.server import HTTPServer, SimpleHTTPRequestHandler
from time import time
from urllib.parse import unquote, _NetlocResultMixinStr
from uuid import uuid4


class Handler(SimpleHTTPRequestHandler):
    """
    Makes it able to give the handler a directory to serve from.

    Mostly Python 3.7 code backported.
    """
    sessions = {}

    def __init__(self, *args, directory: str = None, **kwargs):
        if directory is None:
            directory = os.getcwd()
        self.directory = directory
        self.morsel = None

        super().__init__(*args, **kwargs)

    def get_cookie(self):
        client_cookies = self.headers.get('Cookies', '')
        return SimpleCookie(client_cookies)

    def success_login(self):
        cookie = self.get_cookie()
        session_id, now = uuid4(), time()
        self.sessions[session_id] = now
        cookie['session_id'] = session_id
        sess_cookie = cookie['session_id']
        sess_cookie['max-age'] = 3600
        sess_cookie['expires'] = self.date_time_string(now + 3600)
        self.send_header('Set-Cookie', cookie['session_id'].OutputString())

    @property
    def logged_in(self):
        cookie = self.get_cookie()
        session_id = cookie.get('session_id')

        if session_id is None:
            return False
        elif self.sessions[session_id.value] - time() > 3600:
            return False
        return True

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

    def do_POST(self):
        if self.path == '/login':
            self.send_response(200)
            self.success_login()
            self.end_headers()
            return
        self.send_response(HTTPStatus.BAD_REQUEST)


class ThreadedServer(socketserver.ThreadingMixIn, HTTPServer):
    daemon_threads = True
