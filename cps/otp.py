import json
from functools import wraps

from flask import session, request, make_response, abort

from flask import Blueprint, flash, redirect, url_for
from flask_babel import gettext as _ 

from .cw_login import login_user, current_user
from sqlalchemy.orm.exc import NoResultFound
from .usermanagement import user_login_required

from . import constants, logger, config, app, ub

from werkzeug.security import generate_password_hash

from twilio.rest import Client
import random
from flask import Flask, request, render_template, session, redirect, url_for

from .render_template import render_title_template

import os

otp = Blueprint('otp', __name__)
log = logger.create()

# Twilio credentials
TWILIO_ACCOUNT_SID = 'your_account_sid'
TWILIO_AUTH_TOKEN = 'your_auth_token'
TWILIO_PHONE_NUMBER = 'your_twilio_phone_number'

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

def send_otp(phone_number, otp):
    message = client.messages.create(
        body=f"Your OTP is {otp}",
        from_=TWILIO_PHONE_NUMBER,
        to=phone_number
    )
    return message.sid
def otp_required(f):
    @wraps(f)
    def inner(*args, **kwargs):
        if config.config_login_type == constants.LOGIN_OAUTH:
            return f(*args, **kwargs)
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            data = {'status': 'error', 'message': 'Not Found'}
            response = make_response(json.dumps(data, ensure_ascii=False))
            response.headers["Content-Type"] = "application/json; charset=utf-8"
            return response, 404
        abort(404)

    return inner

@otp.route('/otp/', methods = ['GET', 'POST'])
def index():
    if request.method == 'POST':
        to_ = request.form['phone']
        otp_ = random.randint(100000, 999999)
        session['otp'] = otp_
        session['to'] = to_
        send_otp(to_, otp_)
        return redirect(url_for('otp.verify'))
    next_url = request.args.get('next', default=url_for("otp.verify"), type=str)
    if url_for("otp.index") == next_url:
        next_url = url_for("otp.verify")
    flash("YOU OTP SENDED! CHECK YOUR MESSAGE")
    return render_title_template('otp_index.html', title=_('OTP login'), next_url=next_url)

@otp.route('/otp/verify', methods=['GET', 'POST'])
def verify():
    print("i am heree")
    if request.method == 'POST':
        user_otp = request.form['otp']
        if 'otp' in session and int(user_otp) == session['otp']:
            return redirect(url_for('web.index'))
        else:
            flash(_('Invalid OTP. Please try again.'))
            redirect(url_for('otp.index'))
    next_url = request.args.get('next', default=url_for("otp.index"), type=str)
    if url_for("otp.index") == next_url:
        next_url = url_for("otp.verify")
    return render_title_template('otp_verify.html', title=_('OTP verify'), next_url=next_url)
        