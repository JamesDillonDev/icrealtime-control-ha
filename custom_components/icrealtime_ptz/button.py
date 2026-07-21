from __future__ import annotations

import time

import requests
from requests.auth import HTTPDigestAuth

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_HOST, CONF_PASSWORD, CONF_USERNAME
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import CONF_DURATION, CONF_SPEED, DEFAULT_DURATION, DEFAULT_SPEED, DOMAIN

DIRECTIONS = ["Up", "Down", "Left", "Right"]


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    data = hass.data[DOMAIN][entry.entry_id]
    async_add_entities(
        PTZButton(
            direction=direction,
            host=data[CONF_HOST],
            username=data[CONF_USERNAME],
            password=data[CONF_PASSWORD],
            speed=data.get(CONF_SPEED, DEFAULT_SPEED),
            duration=data.get(CONF_DURATION, DEFAULT_DURATION),
            entry_id=entry.entry_id,
        )
        for direction in DIRECTIONS
    )


class PTZButton(ButtonEntity):
    _attr_has_entity_name = True

    def __init__(
        self,
        direction: str,
        host: str,
        username: str,
        password: str,
        speed: int,
        duration: float,
        entry_id: str,
    ) -> None:
        self._direction = direction
        self._host = host
        self._username = username
        self._password = password
        self._speed = speed
        self._duration = duration
        self._attr_name = f"Pan {direction}"
        self._attr_unique_id = f"{entry_id}_ptz_{direction.lower()}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, host)},
            name=f"IC Realtime PTZ ({host})",
            manufacturer="IC Realtime",
            model="PTZ Camera",
        )

    def press(self) -> None:
        auth = HTTPDigestAuth(self._username, self._password)
        base_url = f"http://{self._host}/cgi-bin/ptz.cgi"

        requests.get(
            base_url,
            params={
                "action": "start",
                "channel": 1,
                "code": self._direction,
                "arg1": 0,
                "arg2": self._speed,
                "arg3": 0,
            },
            auth=auth,
            timeout=5,
        )

        time.sleep(self._duration)

        requests.get(
            base_url,
            params={
                "action": "stop",
                "channel": 1,
                "code": self._direction,
            },
            auth=auth,
            timeout=5,
        )
