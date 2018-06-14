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
from backend.db import Channel, Cookie, Message, User

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

    def get_form(self, fields=()) -> dict:
        size = self.headers.get('Content-Length')

        data = self.rfile.read(int(size))
        data = json.loads(data)

        if not all(field in data for field in fields):
            raise ValueError('Must have all of the following: {}'.format(', '.join(fields)))

        return data

    def get_logged_in_user(self):
        session_id = self.cookie.get('session_id')
        if session_id is None:
            raise errors.LoginError('Must be logged in.')

        cookie = Cookie.objects.get(session_id=session_id.value)
        return cookie.user

    @staticmethod
    def login(form: dict):
        try:
            user = User.objects.get(username=form['username'])
        except User.DoesNotExist:
            raise errors.LoginError('That username does not exist.')

        if not context.verify(form['password'], user.password):
            raise errors.LoginError('Invalid password.')

        return user

    def logout(self):
        self.cookie['session_id'] = ''
        self.cookie['session_id']['path'] = '/'
        self.cookie['session_id']['max-age'] = -1
        self.cookie['session_id']['expires'] = self.date_time_string(0)
        self.send_header('Set-Cookie', self.cookie['session_id'].OutputString())

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

    def send_message(self, channel_id: str, form: dict):
        user = self.get_logged_in_user()

        message = Message(
            message_id=time() * 1000,
            content=form['content'],
            author=user
        )
        message.save()

        try:
            channel = Channel.objects.get(channel_id=int(channel_id))
        except Channel.DoesNotExist:
            return self.send_status(HTTPStatus.NOT_FOUND, 'Channel not found.')

        if user not in channel.users:
            return self.send_status(HTTPStatus.UNAUTHORIZED)

        channel.messages.append(message)
        channel.save()

        self.send_status(HTTPStatus.OK)

    def delete_message(self, channel_id: str, form: dict):
        user = self.get_logged_in_user()

        channel = Channel.objects.get(channel_id=int(channel_id))
        message_id = int(form['message_id'])

        for message in reversed(channel.messages):
            if message.message_id == message_id:
                if message.author != user:
                    return self.send_status(HTTPStatus.UNAUTHORIZED)
                message.content = 'This message was deleted.'
                message.deleted = True
                message.save()
                return self.send_status(HTTPStatus.OK)
        else:
            return self.send_status(HTTPStatus.NOT_FOUND)

    def new_messages(self, channel_id: int):
        user = self.get_logged_in_user()
        latest = user.latest_update

        if latest is None:
            latest = 0

        try:
            messages = Channel.objects.get(channel_id=channel_id).messages
        except Channel.DoesNotExist:
            return self.send_status(HTTPStatus.NOT_FOUND, 'No channel with that ID')

        out = []
        for message in sorted(messages, key=lambda m: m.message_id):
            if message.message_id > latest:
                out.append({
                    'id': message.message_id,
                    'content': message.content,
                    'author': message.author.username,
                    'date': '{:%d.%m %H:%M}'.format(message.correct_time)
                })
                user.latest_update = message.message_id

        user.save()
        messages = json.dumps(out)

        self.send_status(HTTPStatus.OK)
        self.wfile.write(messages.encode())

    def create_channel(self, form: dict):
        user = self.get_logged_in_user()
        channel = Channel(
            name=form['name'],
            messages=[],
            users=[user]
        )
        channel.save()

    def add_user_to_channel(self, channel_id, form: dict):
        author = self.get_logged_in_user()
        channel = Channel.objects.get(channel_id=channel_id)

        if author not in channel.users:
            return self.send_status(HTTPStatus.UNAUTHORIZED)
        try:
            user = User.objects.get(username=form['username'])
        except User.DoesNotExist:
            return self.send_status(HTTPStatus.NOT_FOUND, 'That user does not exist.')

        channel.users.append(user)
        channel.save()
        self.send_status(HTTPStatus.OK)

    def send_me(self):
        user = self.get_logged_in_user()
        data = {
            'username': user.username,
            'email': user.email
        }

        msg = json.dumps(data)
        self.send_status(HTTPStatus.OK)
        self.wfile.write(msg.encode())

    @staticmethod
    def get_channels(user: User) -> str:
        channels = Channel.objects(users__in=[user])

        data = []
        for channel in channels:
            inner = {
                'users': [user.username for user in channel.users],
                'id': channel.channel_id,
                'name': channel.name,
                'messages': []
            }
            data.append(inner)

            for message in sorted(channel.messages, key=lambda msg: msg.message_id)[-40:]:
                inner['messages'].append({
                    'author': message.author.username,
                    'content': message.content,
                    'id': message.message_id,
                    'date': '{:%d.%m %H:%M}'.format(message.correct_time),
                    'deleted': message.deleted
                })
        return json.dumps(data)

    def send_status(self, code=HTTPStatus.BAD_REQUEST, message=None):
        self.send_response(code, message=message)
        self.end_headers()

    def do_POST(self):
        if self.path.startswith('/channels/'):
            if not self.is_logged_in:
                return self.send_status(HTTPStatus.UNAUTHORIZED)

            endpoint = self.path[len('/channels/'):]
            channel_id, sep, endpoint = endpoint.partition('/')

            if channel_id == 'create':
                try:
                    form = self.get_form(fields=['name'])
                except ValueError as e:
                    return self.send_status(HTTPStatus.BAD_REQUEST, str(e))
                else:
                    self.create_channel(form)
                    return self.send_status(HTTPStatus.OK)
            elif channel_id == 'get':
                user = self.get_logged_in_user()
                data = self.get_channels(user)
                self.send_status(HTTPStatus.OK)
                self.wfile.write(data.encode())
                return

            if not sep:
                return self.send_status()

            if endpoint == 'sendmessage':
                try:
                    form = self.get_form(fields=['content'])
                except ValueError as e:
                    return self.send_status(HTTPStatus.BAD_REQUEST, str(e))
                self.send_message(channel_id, form)
            elif endpoint == 'deletemessage':
                try:
                    form = self.get_form(fields=['message_id'])
                except ValueError as e:
                    return self.send_status(HTTPStatus.BAD_REQUEST, str(e))
                self.delete_message(channel_id, form)
            elif endpoint == 'getupdates':
                self.new_messages(int(channel_id))
            elif endpoint == 'adduser':
                try:
                    form = self.get_form(fields=['username'])
                except ValueError as e:
                    return self.send_status(HTTPStatus.BAD_REQUEST, str(e))
                self.add_user_to_channel(int(channel_id), form)
            else:
                self.send_status(HTTPStatus.BAD_REQUEST)
        elif self.path in ('/login', '/login/'):
            form = self.get_form(fields=['username', 'password'])

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
            try:
                form = self.get_form(fields=['username', 'email', 'password'])
            except ValueError as e:
                return self.send_status(HTTPStatus.BAD_REQUEST, str(e))

            try:
                self.signup(form)
            except errors.SignupError as e:
                self.send_error(HTTPStatus.BAD_REQUEST, str(e))
            else:
                # TODO
                self.redirect('/authenticate.html')
                self.end_headers()
        elif self.path in ('/me', '/me/'):
            try:
                self.send_me()
            except errors.LoginError as e:
                self.send_status(HTTPStatus.UNAUTHORIZED, str(e))
        elif self.path in ('/logout', '/logout/'):
            self.redirect('/authenticate.html')
            self.logout()
            self.end_headers()
        else:
            self.send_status()

    def do_GET(self):
        if self.path == '/authenticate.html' and self.is_logged_in:
            self.redirect('/chat.html')
            self.end_headers()
            return
        elif self.path in self.requires_login and not self.is_logged_in:
            self.redirect('/authenticate.html')
            self.end_headers()
            return
        else:
            super().do_GET()


class ThreadedServer(socketserver.ThreadingMixIn, HTTPServer):
    daemon_threads = True
