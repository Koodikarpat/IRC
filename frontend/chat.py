#!/usr/bin/env python
# -*- coding: utf-8 -*-

from flask import Flask, render_template

app = Flask(__name__)


@app.route('/')    
def authenticate_page():
    return render_template("authenticate.html")

@app.route('/chat/')    
def chat_page():
    return render_template("chat.html")

if __name__ == "__main__":
    app.run()