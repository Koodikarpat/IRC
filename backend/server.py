import json
import os
import posixpath
import socketserver
from http import HTTPStatus
from http.cookies import SimpleCookie
from http.server import HTTPServer, SimpleHTTPRequestHandler
from time import time
from urllib.parse import unquote
from uuid import uuid4

from passlib.context import CryptContext

from backend import errors
from backend.db import User

context = CryptContext(
    schemes=["argon2", "bcrypt_sha256", "scrypt"],
    default="argon2"
)


class Handler(SimpleHTTPRequestHandler):
    sessions = {}

    def __init__(self, *args, directory: str = None, **kwargs):
        if directory is None:
            directory = os.getcwd()
        self.directory = directory

        self._cookie = None

        super().__init__(*args, **kwargs)

    @property
    def cookie(self) -> SimpleCookie:
        if self._cookie is None:
            self._cookie = SimpleCookie(self.headers.get('Cookies', ''))
        return self._cookie

    def success_login(self):
        session_id, now = uuid4(), time()
        self.sessions[session_id] = now
        self.cookie['session_id'] = session_id
        self.cookie['session_id']['max-age'] = 3600
        self.cookie['session_id']['expires'] = self.date_time_string(now + 3600)
        self.send_header('Set-Cookie', self.cookie['session_id'].OutputString())

    @property
    def is_logged_in(self) -> bool:
        session_id = self.cookie.get('session_id')

        if session_id is None:
            return False
        elif time() - self.sessions[session_id] > 3600:
            return False

        self.sessions[session_id] = time()
        return True

    def get_form(self) -> dict:
        # TODO validation
        size = self.headers.get('Content-Length')

        data = self.rfile.read(int(size))
        return json.loads(data)

    @staticmethod
    def verify_credentials(form: dict):
        try:
            user = User.objects.get(username=form['username'])
        except User.DoesNotExist:
            raise errors.LoginError('That username does not exist.')

        if not context.verify(form['password'], user.password):
            raise errors.LoginError('Invalid password.')

    @staticmethod
    def signup(form: dict):
        try:
            User.objects.get(username=form['username'])
        except User.DoesNotExist:
            pass
        else:
            raise errors.SignupError('An username with that name already exists.')

        try:
            user = User(
                username=form['username'],
                email=form['email'],
                password=context.hash(form['password'])
            )
        except Exception as e:
            # ???
            print(str(e))
        else:
            user.save()

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
        if self.path in ('/login', '/login/'):
            form = self.get_form()

            try:
                self.verify_credentials(form)
            except errors.LoginError as e:
                self.send_response(HTTPStatus.BAD_REQUEST, str(e))
                self.end_headers()
            else:
                self.send_response(HTTPStatus.MOVED_PERMANENTLY)
                self.success_login()
                self.send_header('Location', '/index.html')
                self.end_headers()
        elif self.path in ('/register', '/register/'):
            form = self.get_form()

            try:
                self.signup(form)
            except errors.SignupError as e:
                self.send_error(HTTPStatus.BAD_REQUEST, str(e))
            else:
                self.send_response(HTTPStatus.MOVED_PERMANENTLY)
                self.success_login()
                self.send_header('Location', '/authenticate.html')
                self.end_headers()
        else:
            self.send_error(HTTPStatus.BAD_REQUEST)


class ThreadedServer(socketserver.ThreadingMixIn, HTTPServer):
    daemon_threads = True
