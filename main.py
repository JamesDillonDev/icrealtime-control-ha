import os

import requests
from dotenv import load_dotenv
from requests.auth import HTTPDigestAuth
import time

load_dotenv()

HOST = os.getenv("CAMERA_HOST", "192.168.0.192")
USER = os.getenv("CAMERA_USER", "admin")
PASS = os.getenv("CAMERA_PASS", "")
SPEED = int(os.getenv("CAMERA_SPEED", "5"))
DURATION = float(os.getenv("CAMERA_DURATION", "0.5"))


def move(direction, speed=SPEED, duration=DURATION):
    requests.get(
        f"http://{HOST}/cgi-bin/ptz.cgi",
        params={
            "action": "start",
            "channel": 1,
            "code": direction,
            "arg1": 0,
            "arg2": speed,
            "arg3": 0,
        },
        auth=HTTPDigestAuth(USER, PASS),
        timeout=5,
    )

    time.sleep(duration)

    requests.get(
        f"http://{HOST}/cgi-bin/ptz.cgi",
        params={
            "action": "stop",
            "channel": 1,
            "code": direction,
        },
        auth=HTTPDigestAuth(USER, PASS),
        timeout=5,
    )


move("Up")
move("Down")
move("Left")
move("Right")