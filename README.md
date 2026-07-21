# IC Realtime PTZ

A Home Assistant custom integration for controlling the pan/tilt movement of IC Realtime cameras (e.g. the ORB series).

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)

## Features

- Control camera pan/tilt via 4 button entities: **Pan Up**, **Pan Down**, **Pan Left**, **Pan Right**
- Configurable PTZ speed and move duration
- Set up entirely through the Home Assistant UI — no YAML required

## Installation

### Via HACS (recommended)

1. Open HACS in Home Assistant
2. Go to **Integrations** → ⋮ → **Custom repositories**
3. Add `https://github.com/JamesDillonDev/icrealtime-control-ha` with category **Integration**
4. Install **IC Realtime PTZ** and restart Home Assistant

### Manual

1. Copy the `custom_components/icrealtime_ptz` folder into your HA `config/custom_components/` directory
2. Restart Home Assistant

## Configuration

1. Go to **Settings → Integrations → Add Integration**
2. Search for **IC Realtime PTZ**
3. Enter your camera details:

| Field | Description | Default |
|---|---|---|
| Host | Camera IP address | — |
| Username | Camera username | `admin` |
| Password | Camera password | — |
| PTZ Speed | Movement speed (1–10) | `5` |
| Move Duration | How long to move in seconds | `0.5` |

## Entities

Once configured, four button entities are created:

| Entity | Description |
|---|---|
| `button.pan_up` | Tilts the camera up |
| `button.pan_down` | Tilts the camera down |
| `button.pan_left` | Pans the camera left |
| `button.pan_right` | Pans the camera right |

## Requirements

- Home Assistant 2023.1.0 or newer
- IC Realtime camera with CGI PTZ support accessible on your local network

