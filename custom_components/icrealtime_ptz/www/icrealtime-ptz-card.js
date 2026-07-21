class ICRealtimePTZCard extends HTMLElement {
  setConfig(config) {
    this._config = {
      title: "PTZ Control",
      up: "button.pan_up",
      down: "button.pan_down",
      left: "button.pan_left",
      right: "button.pan_right",
      ...config,
    };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  _render() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });

    const { title, up, down, left, right } = this._config;

    this.shadowRoot.innerHTML = `
      <ha-card>
        <div class="card-header">${title}</div>
        <div class="dpad">
          <button class="btn up"    data-entity="${up}"    title="Pan Up">▲</button>
          <button class="btn left"  data-entity="${left}"  title="Pan Left">◀</button>
          <div class="center"></div>
          <button class="btn right" data-entity="${right}" title="Pan Right">▶</button>
          <button class="btn down"  data-entity="${down}"  title="Pan Down">▼</button>
        </div>
        <style>
          .card-header {
            padding: 12px 16px 0;
            font-size: 1.1em;
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
            gap: 6px;
            padding: 16px;
            max-width: 200px;
            margin: 0 auto;
          }
          .btn {
            background: var(--primary-color);
            color: var(--text-primary-color);
            border: none;
            border-radius: 10px;
            font-size: 22px;
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
      btn.addEventListener("click", () =>
        this._hass.callService("button", "press", {
          entity_id: btn.dataset.entity,
        })
      );
    });
  }

  getCardSize() {
    return 3;
  }

  static getStubConfig() {
    return {
      title: "PTZ Control",
      up: "button.pan_up",
      down: "button.pan_down",
      left: "button.pan_left",
      right: "button.pan_right",
    };
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
