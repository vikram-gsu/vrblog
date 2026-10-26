# WhatsApp tracker setup

Log sessions for `/currently-working-on` by texting a WhatsApp number.

**Status:** code is deployed; the WhatsApp connection itself isn't set up yet.

## How it works

```
your phone ──WhatsApp──▶ Meta Cloud API ──webhook──▶ vikrampareddy.com/api/whatsapp
                                                         │ (Vercel function)
                                                         ▼
                                     GitHub API: commit to content/tracker/log.yaml
                                                         │
                                                         ▼
                                     Vercel redeploys, the page updates (~1 min)
```

- `api/whatsapp.ts`: the webhook. It verifies Meta's `X-Hub-Signature-256`, only accepts `WHATSAPP_ALLOWED_FROM`, skips retried deliveries (the WhatsApp message id goes into the commit message), and replies on WhatsApp.
- `api/_lib/bot.ts`: message parsing and `log.yaml` edits, with no I/O.
- `tests/`: run with `npm test`.

## Setting it up

Run the wizard in a terminal. It walks through every dashboard and checks each value as you go:

```
./scripts/setup-whatsapp.sh
```

It never writes secrets to disk or prints them. Each one goes to the clipboard only while you paste it into Vercel or Meta.

Stages:
1. GitHub fine-grained token on `vikram-gsu` with **Contents: read and write** on `vrblog` only.
2. Meta developer app with the WhatsApp use case.
3. Test number: note the **Phone number ID** and **WhatsApp Business Account ID**, and add your phone as a recipient.
4. **App secret** (App settings → Basic).
5. Permanent **system user token** (Business settings → System users) with `whatsapp_business_messaging` and `whatsapp_business_management`, assigned the app and the WhatsApp account. The token on the API Setup page expires in 24h.
6. Vercel environment variables (Production, Sensitive).
7. Redeploy. The wizard waits until the webhook handshake passes.
8. Meta → WhatsApp → Configuration: callback URL `https://vikrampareddy.com/api/whatsapp`, the verify token, and the `messages` webhook field. The wizard also calls `POST /{WABA_ID}/subscribed_apps`.
9. Text `today` to the test number.

## Environment variables (Vercel, Production)

| Name | What |
|---|---|
| `GITHUB_TOKEN` | Fine-grained token, Contents read/write on `vikram-gsu/vrblog` |
| `WHATSAPP_APP_SECRET` | Meta app secret, used to verify webhook signatures |
| `WHATSAPP_ACCESS_TOKEN` | System user token, used to send replies |
| `WHATSAPP_VERIFY_TOKEN` | Any random string; must match the one entered in Meta's webhook config |
| `WHATSAPP_PHONE_NUMBER_ID` | ID of the number that sends replies (the test number) |
| `WHATSAPP_ALLOWED_FROM` | Your number, digits with country code (e.g. `14045551234`) |
| `TRACKER_TZ` | Optional, default `America/New_York`. Decides what "today" means |
| `GITHUB_REPO` / `GITHUB_BRANCH` | Optional, default `vikram-gsu/vrblog` / `main` |
| `WHATSAPP_GRAPH_VERSION` | Optional, default `v23.0` |

The endpoint rejects everything until `WHATSAPP_APP_SECRET` is set. Environment variable changes only apply after a redeploy.

## Messages

```
llm 50 ch1 done          log 50 min on the LLM book, with a note
lc 35                    LeetCode, 35 min
ddia 1h30 isolation      time: 45, 45m, 1h, 1h30, 1.5h (optional)
yesterday xu 2h          or a date: 10/22 xu 2h
llm 50
lc 35                    several lines = several entries
today   (or ?)           today's checklist; yesterday? for yesterday
undo                     remove the last entry
help
```

Short names: `llm`, `ddia`, `xu`, `papers`, `algo`, `lc`, `sd`, `agents` (or `server`), `harness`, `exp` (full task ids from `plan.yaml` work too).

## Troubleshooting (Vercel → Logs → `/api/whatsapp`)

- **401 "Bad signature"**: `WHATSAPP_APP_SECRET` doesn't match the Meta app, or wasn't redeployed.
- **"Ignoring message from unlisted number"**: `WHATSAPP_ALLOWED_FROM` doesn't match the number in the log line.
- **No requests at all**: the `messages` webhook field isn't subscribed, or the app isn't subscribed to the WhatsApp account (`POST /{WABA_ID}/subscribed_apps`).
- **Bot replies "Something went wrong"**: the error text follows. GitHub 401/403 means `GITHUB_TOKEN` expired or lacks Contents write.
- **No reply, but the entry was logged**: `WHATSAPP_ACCESS_TOKEN` is wrong or expired (check the "WhatsApp reply failed" log line).

## Upkeep

- The GitHub token expires on the date you chose. Make a new one and update `GITHUB_TOKEN` in Vercel (re-running the wizard works too), then redeploy.
- When the home server is up, the same handler can move there. Only the hosting changes, not the WhatsApp or GitHub side.
