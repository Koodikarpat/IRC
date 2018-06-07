from mongoengine import Document, fields


class User(Document):
    username = fields.StringField(required=True, unique=True)
    email = fields.EmailField(required=True)
    password = fields.StringField(required=True)  # hash of password
