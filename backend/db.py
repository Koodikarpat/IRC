from mongoengine import Document, fields


class User(Document):
    username = fields.StringField(required=True, unique=True)
    email = fields.EmailField(required=True)
    password = fields.StringField(required=True)  # hash of password
    latest_update = fields.IntField()


class Message(Document):
    content = fields.StringField(required=True)
    author = fields.ReferenceField(User, required=True)
    date = fields.IntField(required=True)
