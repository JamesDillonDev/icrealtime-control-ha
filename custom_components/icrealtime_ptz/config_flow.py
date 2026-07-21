import voluptuous as vol
from homeassistant import config_entries
from homeassistant.const import CONF_HOST, CONF_PASSWORD, CONF_USERNAME

from .const import CONF_DURATION, CONF_SPEED, DEFAULT_DURATION, DEFAULT_SPEED, DOMAIN


class ICRealtimePTZConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(self, user_input=None):
        errors = {}

        if user_input is not None:
            return self.async_create_entry(title=user_input[CONF_HOST], data=user_input)

        schema = vol.Schema(
            {
                vol.Required(CONF_HOST): str,
                vol.Required(CONF_USERNAME, default="admin"): str,
                vol.Required(CONF_PASSWORD): str,
                vol.Optional(CONF_SPEED, default=DEFAULT_SPEED): vol.All(
                    int, vol.Range(min=1, max=10)
                ),
                vol.Optional(CONF_DURATION, default=DEFAULT_DURATION): vol.All(
                    float, vol.Range(min=0.1, max=5.0)
                ),
            }
        )

        return self.async_show_form(step_id="user", data_schema=schema, errors=errors)
