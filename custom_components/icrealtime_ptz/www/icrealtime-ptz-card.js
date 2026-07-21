const HA_COLORS = {
  primary:      "var(--primary-color)",
  accent:       "var(--accent-color)",
  red:          "var(--red-color)",
  pink:         "var(--pink-color)",
  purple:       "var(--purple-color)",
  indigo:       "var(--indigo-color)",
  blue:         "var(--blue-color)",
  cyan:         "var(--cyan-color)",
  teal:         "var(--teal-color)",
  green:        "var(--green-color)",
  lime:         "var(--lime-color)",
  yellow:       "var(--yellow-color)",
  amber:        "var(--amber-color)",
  orange:       "var(--orange-color)",
  brown:        "var(--brown-color)",
  grey:         "var(--grey-color)",
};

class ICRealtimePTZCard extends HTMLElement {
  constructor() {
    super();
    this._entities = { up: null, down: null, left: null, right: null };
    this._entitiesResolved = false;
    this._built = false;
  }

  setConfig(config) {
    this._config = { title: "", color: "primary", ...config };

    // Reset resolved state when config changes
    this._entitiesResolved = false;

    // If explicit entities provided use them directly
    this._entities = {
      up:    config.up    || null,
      down:  config.down  || null,
      left:  config.left  || null,
      right: config.right || null,
    };

    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    // Auto-discover entities from device ID on first hass update
    if (this._config.device && !this._entitiesResolved) {
      this._resolveEntities();
    }
    if (this._built) this._applyColor();
  }

  async _resolveEntities() {
    try {
      const deviceId = await this._resolveDeviceId();
      if (!deviceId) {
        console.error("IC Realtime PTZ: device not found:", this._config.device);
        return;
      }
      const all = await this._hass.callWS({ type: "config/entity_registry/list" });
      for (const e of all) {
        if (e.device_id !== deviceId) continue;
        const name = (e.name || e.original_name || "").toLowerCase();
        if      (name.includes("up"))    this._entities.up    = e.entity_id;
        else if (name.includes("down"))  this._entities.down  = e.entity_id;
        else if (name.includes("left"))  this._entities.left  = e.entity_id;
        else if (name.includes("right")) this._entities.right = e.entity_id;
      }
      this._entitiesResolved = true;
      this._updateButtonEntities();
    } catch (err) {
      console.error("IC Realtime PTZ: could not resolve entities", err);
    }
  }

  async _resolveDeviceId() {
    const device = this._config.device;
    // If it looks like a UUID, use it directly
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(device)) {
      return device;
    }
    // Otherwise look up by device name (case-insensitive)
    const devices = await this._hass.callWS({ type: "config/device_registry/list" });
    const match = devices.find(
      (d) => (d.name_by_user || d.name || "").toLowerCase() === device.toLowerCase()
    );
    return match?.id ?? null;
  }

  _updateButtonEntities() {
    if (!this._built) return;
    for (const [dir, entityId] of Object.entries(this._entities)) {
      const btn = this.shadowRoot.querySelector(`.btn.${dir}`);
      if (btn && entityId) btn.dataset.entity = entityId;
    }
  }

  _applyColor() {
    const btnColor = HA_COLORS[this._config.color] ?? this._config.color;
    this.shadowRoot.host.style.setProperty("--btn-color", btnColor);
  }

  _render() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });

    if (!this._built) {
      this.shadowRoot.innerHTML = `
        <ha-card>
          <div class="card-header" id="header" style="display:none"></div>
          <div class="dpad">
            <button class="btn up"    title="Pan Up">▲</button>
            <button class="btn left"  title="Pan Left">◀</button>
            <div class="center"></div>
            <button class="btn right" title="Pan Right">▶</button>
            <button class="btn down"  title="Pan Down">▼</button>
          </div>
          <style>
            :host { --btn-color: var(--primary-color); }
            .card-header {
              padding: 8px 12px 0;
              font-size: 1em;
              font-weight: 500;
              color: var(--ha-card-header-color, var(--primary-text-color));
            }
            .dpad {
              display: grid;
              grid-template-areas:
                ". up ."
                "left center right"
                ". down .";
              grid-template-columns: 1fr 1fr 1fr;
              grid-template-rows: 1fr 1fr 1fr;
              gap: 4px;
              padding: 10px;
              max-width: 140px;
              margin: 0 auto;
            }
            .btn {
              background: var(--btn-color);
              color: var(--text-primary-color);
              border: none;
              border-radius: 8px;
              font-size: 16px;
              cursor: pointer;
              aspect-ratio: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: filter 0.1s, transform 0.1s;
            }
            .btn:hover  { filter: brightness(1.15); }
            .btn:active { filter: brightness(0.75); transform: scale(0.92); }
            .up     { grid-area: up; }
            .down   { grid-area: down; }
            .left   { grid-area: left; }
            .right  { grid-area: right; }
            .center { grid-area: center; }
          </style>
        </ha-card>
      `;

      this.shadowRoot.querySelectorAll(".btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const entityId = btn.dataset.entity;
          if (entityId) this._hass.callService("button", "press", { entity_id: entityId });
        });
      });

      this._built = true;
    }

    // Update title
    const header = this.shadowRoot.getElementById("header");
    if (this._config.title) {
      header.textContent = this._config.title;
      header.style.display = "";
    } else {
      header.style.display = "none";
    }

    this._applyColor();
    this._updateButtonEntities();
  }

  getCardSize() { return 2; }

  static getStubConfig() {
    return { color: "primary", device: "" };
  }
}

customElements.define("icrealtime-ptz-card", ICRealtimePTZCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "icrealtime-ptz-card",
  name: "IC Realtime PTZ Card",
  description: "D-pad control card for IC Realtime PTZ cameras",
  preview: false,
});
