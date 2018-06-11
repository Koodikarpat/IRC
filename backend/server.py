import json
import os
import posixpath
import socketserver
from datetime import datetime
from http import HTTPStatus
from http.cookies import SimpleCookie
from http.server import HTTPServer, SimpleHTTPRequestHandler
from time import time
from urllib.parse import unquote
from uuid import uuid4

from passlib.context import CryptContext

from backend import errors
from backend.db import Cookie, User

context = CryptContext(
    schemes=["argon2", "bcrypt_sha256", "scrypt"],
    default="argon2"
)


class Handler(SimpleHTTPRequestHandler):
    requires_login = [
        '/chat.html'
    ]

    def __init__(self, *args, directory: str = None, **kwargs):
        if directory is None:
            directory = os.getcwd()
        self.directory = directory

        self._cookie = None

        super().__init__(*args, **kwargs)

    @property
    def cookie(self) -> SimpleCookie:
        if self._cookie is None:
            self._cookie = SimpleCookie(self.headers.get('Cookie', ''))
        return self._cookie

    def redirect(self, location, *, code=HTTPStatus.MOVED_PERMANENTLY):
        self.send_response(code)
        self.send_header('Location', location)

    def success_login(self, user: User):
        session_id = str(uuid4())
        now = time()
        cookie = Cookie(
            session_id=session_id,
            created=datetime.fromtimestamp(now),
            user=user
        )
        cookie.save()

        self.cookie['session_id'] = session_id
        self.cookie['session_id']['path'] = '/'
        self.cookie['session_id']['max-age'] = 3600
        self.cookie['session_id']['expires'] = self.date_time_string(now + 3600)
        self.send_header('Set-Cookie', self.cookie['session_id'].OutputString())

    @property
    def is_logged_in(self) -> bool:
        session_id = self.cookie.get('session_id')

        # No session_id header, not logged in
        if session_id is None:
            return False

        # Session id exists - see if it's saved in DB
        try:
            Cookie.objects.get(session_id=session_id.value)
        except Cookie.DoesNotExist:  # session id has expired somehow or is invalid
            return False
        else:
            return True

    def get_form(self) -> dict:
        # TODO validation
        size = self.headers.get('Content-Length')

        data = self.rfile.read(int(size))
        return json.loads(data)

    @staticmethod
    def login(form: dict):
        try:
            user = User.objects.get(username=form['username'])
        except User.DoesNotExist:
            raise errors.LoginError('That username does not exist.')

        if not context.verify(form['password'], user.password):
            raise errors.LoginError('Invalid password.')

        return user

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
                user = self.login(form)
            except errors.LoginError as e:
                self.send_response(HTTPStatus.BAD_REQUEST, str(e))
                self.end_headers()
            else:
                self.redirect('/chat.html')
                self.success_login(user)
                self.end_headers()
        elif self.path in ('/register', '/register/'):
            form = self.get_form()

            try:
                self.signup(form)
            except errors.SignupError as e:
                self.send_error(HTTPStatus.BAD_REQUEST, str(e))
            else:
                # TODO
                self.send_response(HTTPStatus.OK, '/authorization.html')
                self.end_headers()
        else:
            self.send_error(HTTPStatus.BAD_REQUEST)

    def do_GET(self):
        if self.path == '/authenticate.html' and self.is_logged_in:
            self.send_response(HTTPStatus.PERMANENT_REDIRECT)
            self.send_header('Location', '/chat.html')
            self.end_headers()

        if self.path in self.requires_login and not self.is_logged_in:
            self.send_response(HTTPStatus.PERMANENT_REDIRECT)
            self.send_header('Location', '/authenticate.html')
            self.end_headers()
        else:
            super().do_GET()


class ThreadedServer(socketserver.ThreadingMixIn, HTTPServer):
    daemon_threads = True
