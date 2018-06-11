from time import time

from mongoengine import Document, fields


class User(Document):
    username = fields.StringField(required=True, unique=True)
    email = fields.EmailField(required=True)
    password = fields.StringField(required=True)  # hash of password
    latest_update = fields.IntField()
    chats = fields.ListField(fields.IntField())


class Cookie(Document):
    session_id = fields.StringField(required=True, unique=True)
    created = fields.DateTimeField(required=True)
    user = fields.ReferenceField(User, required=True)


class Message(Document):
    message_id = fields.IntField(required=True, default=time)
    content = fields.StringField(required=True)
    author = fields.ReferenceField(User, required=True)


class Channel(Document):
    name = fields.StringField(required=True)
    channel_id = fields.IntField(required=True)
    messages = fields.ListField(fields.ReferenceField(Message))
    users = fields.ListField(fields.ReferenceField(User))
