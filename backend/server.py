import os
import posixpath
import socketserver
from http import HTTPStatus
from http.cookies import SimpleCookie
from http.server import HTTPServer, SimpleHTTPRequestHandler
from time import time
from urllib.parse import parse_qsl, unquote
from uuid import uuid4

from passlib.context import CryptContext

from backend.db import User

context = CryptContext(
    schemes=['bcrypt_sha256', 'scrypt'],
    default='bcrypt_sha256'
)


class LoginError(Exception):
    pass


class Handler(SimpleHTTPRequestHandler):
    """
    Makes it able to give the handler a directory to serve from.

    Directory code mostly Python 3.7 code backported.
    """
    sessions = {}

    def __init__(self, *args, directory: str = None, **kwargs):
        if directory is None:
            directory = os.getcwd()
        self.directory = directory

        super().__init__(*args, **kwargs)

    def get_cookie(self) -> SimpleCookie:
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
    def is_logged_in(self) -> bool:
        cookie = self.get_cookie()
        session_id = cookie.get('session_id')

        if session_id is None:
            return False
        elif self.sessions[session_id.value] - time() > 3600:
            return False
        return True

    def get_form(self) -> dict:
        size = self.headers.get('Content-Length')

        if size is None:
            raise ValueError('???')

        data = self.rfile.read(int(size))
        return dict(parse_qsl(data.decode()))

    def validate_login(self, form: dict):
        try:
            user = User.objects.get(username=form['username'])
        except User.DoesNotExist:
            raise LoginError('That username does not exist.')

        if not context.verify(form['password'], user.password):
            raise LoginError('Invalid password.')

    def translate_path(self, path: str) -> str:
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
            form = self.get_form()
            try:
                self.validate_login(form)
            except LoginError as e:
                # TODO flash error message to user
                self.send_response(HTTPStatus.BAD_REQUEST)
        else:
            self.send_response(HTTPStatus.BAD_REQUEST)


class ThreadedServer(socketserver.ThreadingMixIn, HTTPServer):
    daemon_threads = True
