# Setup Guide

Moltzer requires [Moltbot](https://github.com/moltbot/moltbot) Gateway to connect to AI models.

## Install Moltbot Gateway

Follow the official installation guide:

**[Moltbot Installation Guide](https://github.com/moltbot/moltbot#installation)**

### Quick Install

```bash
npm install -g moltbot
moltbot setup
```

This will:
1. Install the Moltbot CLI
2. Guide you through API key configuration
3. Start the gateway on `ws://localhost:18789`

## Connect Moltzer

1. Download Moltzer from [Releases](https://github.com/AlixHQ/moltzer-community/releases)
2. Launch the app
3. Open Settings (Cmd+,)
4. Enter Gateway URL: `ws://localhost:18789`
5. Click Connect

## Troubleshooting

### "Connection failed"
- Make sure Moltbot Gateway is running: `moltbot gateway status`
- Check the URL matches (default: `ws://localhost:18789`)

### "No models available"
- Verify API keys are configured in Moltbot: `moltbot config`

For more help, see the [Moltbot documentation](https://github.com/moltbot/moltbot).
