import logging
from pathlib import Path

from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import HomeAssistant

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

PLATFORMS = ["button"]

_CARD_URL = "/icrealtime_ptz/icrealtime-ptz-card.js"
_CARD_PATH = Path(__file__).parent / "www" / "icrealtime-ptz-card.js"


async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    await hass.http.async_register_static_paths(
        [StaticPathConfig(_CARD_URL, str(_CARD_PATH), cache_headers=False)]
    )

    async def _register_lovelace_resource(event=None):
        try:
            lovelace = hass.data.get("lovelace")
            if lovelace is None:
                _LOGGER.warning("Lovelace not found; add %s as a resource manually", _CARD_URL)
                return

            resources = getattr(lovelace, "resources", None)
            if resources is None:
                _LOGGER.warning(
                    "Lovelace is in YAML mode; add %s as a resource manually", _CARD_URL
                )
                return

            await resources.async_load()
            existing = {item.get("url") for item in resources.async_items()}
            if _CARD_URL not in existing:
                await resources.async_create_item({"res_type": "module", "url": _CARD_URL})
                _LOGGER.info("Registered Lovelace resource: %s", _CARD_URL)
            else:
                _LOGGER.debug("Lovelace resource already registered: %s", _CARD_URL)
        except Exception as err:
            _LOGGER.warning("Could not auto-register Lovelace resource: %s", err)

    if hass.is_running:
        await _register_lovelace_resource()
    else:
        hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, _register_lovelace_resource)

    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = entry.data
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)
    return unload_ok
