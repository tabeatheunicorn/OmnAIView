# OmnAIScope Backend & Debugging Guide

Praxiswissen zum lokalen OmnAIScope-Backend (`OmnAIScope-DataServer.exe`) und wie man
"kein Gerät gefunden"-Probleme systematisch eingrenzt. Entstanden aus einer realen
Debug-Session, in der der OmnAIScope in der App nicht auftauchte.

## Das Backend im Überblick

Die Angular-App bekommt ihre Live-Daten nicht direkt vom OmnAIScope, sondern über ein
lokales CLI-Backend, das Electron beim Start als Kindprozess hochfährt.

- **Binary:** `electron/res/omnai_BE/OmnAIScope-DataServer.exe` (Dev) bzw.
  `<resources>/OmnAIScope-DataServer.exe` (paketiert). Pfad wird gesetzt in
  [electron/src/omnaiBackend.ts](../electron/src/omnaiBackend.ts) (`getBackendPath`).
- **Start durch Electron:** `omnaiscopeBackendManager.startBackend()` in
  [electron/src/main.ts](../electron/src/main.ts) spawnt das Binary auf einem freien,
  vom OS zugewiesenen Port mit den Argumenten `-w -p <port>`.
- **Port-Weitergabe an Angular:** per IPC (`get-omnaiscope-backend-port`), gelesen in
  [backend-port.service.ts](../angular-frontend/src/app/omnai-datasource/omnai-scope-server/backend-port.service.ts).
- **Datenweg in der App:** [live-data.service.ts](../angular-frontend/src/app/omnai-datasource/omnai-scope-server/live-data.service.ts)
  ruft `http://127.0.0.1:<port>/UUID` (Geräteliste) und `ws://127.0.0.1:<port>/ws` (Datenstrom).

> ⚠️ **Wichtig:** `startBackend()` startet das Binary nur, wenn `existsSync(exePath)` true ist —
> **ohne Fehlermeldung, wenn die Datei fehlt oder der Prozess crasht** (kein `else`-Zweig).
> Ein fehlendes/abgestürztes Backend äußert sich für den Nutzer nur als "kein Gerät".

## CLI-Optionen (`OmnAIScope-DataServer.exe --help`)

Das Backend ist ein eigenständiges CLI-Tool. Für Debugging kann man es **direkt** ausführen,
komplett ohne Electron/Angular:

| Option | Bedeutung |
|---|---|
| `-s, --search` | **Listet alle angeschlossenen Geräte** (Farbe = aktuelle LED-Farbe). Bester Erkennungstest. |
| `-d, --device <UUID...>` | Startet die Geräte mit den gegebenen UUIDs |
| `-o, --output <FILE>` | Datei, in die die Daten gespeichert werden |
| `-v, --verbose` | Zusätzliche Debug-Ausgaben |
| `-j, --json` | Ausgabeformat JSON |
| `-w, --websocket` | Startet den Websocket (braucht eine UUID zum Senden von Daten) |
| `-p, --port <INT>` | Port für den Websocket |
| `--version` | Version (aus Git-Tag). Beobachtet: **v1.2.0** |
| `-h, --help` | Hilfe |

### Bekannte Backend-Macke (v1.2.0)

- **`-s` ohne angeschlossenes Gerät hängt** in einer 100%-CPU-Endlosschleife, statt sauber
  zu beenden. Ausgabe kommt (`no omni devices found`), aber der Prozess terminiert nicht.
  → Beim direkten CLI-Test immer mit **hartem Timeout** starten und den Prozess killen.
- **Mit** angeschlossenem Gerät beendet sich `-s` korrekt (ExitCode 0).
- Das Backend leert seinen Konsolen-Buffer nicht selbst — Electron drainiert stdout/stderr
  bewusst mit leeren Handlern, sonst blockiert das Backend bei vollem Buffer
  (siehe Kommentar in `omnaiBackend.ts`).

## Debugging: "Kein Gerät gefunden"

Systematisches Vorgehen, das Software- von Hardware-Ursachen trennt. Von unten (Hardware)
nach oben (App) ist am schnellsten, weil die häufigste Ursache ganz unten liegt.

### Schritt 1 — Läuft das Backend überhaupt? (Software)

```powershell
Get-Process OmnAIScope-DataServer -ErrorAction SilentlyContinue
```

Kein Prozess, obwohl Electron läuft? → Backend wurde nicht gestartet (fehlende exe,
Race beim Start, oder Crash). Binary-Existenz prüfen:

```powershell
Test-Path "electron\res\omnai_BE\OmnAIScope-DataServer.exe"
```

### Schritt 2 — Sieht Windows das Gerät auf dem USB-Bus? (Hardware)

Der OmnAIScope meldet sich mit **VID `2E8A`** (RP2040/Raspberry Pi) als Gerät namens
`Omniscope`. Prüfen:

```powershell
# Taucht ein Nicht-Dock-USB-Gerät auf? (Dock = Microsoft VID_045E)
Get-PnpDevice -PresentOnly | Where-Object {
  $_.InstanceId -match '^USB\\VID_' -and $_.InstanceId -notmatch 'VID_045E'
} | Select-Object Status, FriendlyName, InstanceId | Format-Table -AutoSize -Wrap

# Gibt es Problem-/Treibergeräte (gelbes Ausrufezeichen)?
Get-PnpDevice -PresentOnly | Where-Object { $_.Status -ne 'OK' -or $_.Problem -ne 0 }
```

Interpretation:
- **`Omniscope VID_2E8A ... Status OK`** → Gerät korrekt erkannt, weiter bei Schritt 4.
- **Gerät mit Problem-Code / gelbem Ausrufezeichen** → Treiberproblem (WinUSB/libusb).
- **Gar nichts Neues** → **keine Datenverbindung** (nicht Treiber!). Siehe Schritt 3.

### Schritt 3 — Wenn nichts auf dem USB-Bus erscheint (häufigste Ursache)

**LED leuchtet ≠ Datenverbindung.** Die LED zeigt nur, dass Strom fließt. Ein reines
Ladekabel oder ein zickiger Dock-Port liefert Strom (LED an), aber keine Datenadern →
Windows enumeriert nichts.

Der Fix, der die reale Session gelöst hat:
1. **Anderes Kabel** (sicheres Datenkabel, kein reines Ladekabel).
2. **Direkt am Laptop** einstecken, **nicht** über Dock/Hub (Surface Dock 2 war das Problem).
3. Anderen Port probieren.

Nach jedem Versuch Schritt 2 wiederholen.

### Schritt 4 — Findet das Backend das Gerät? (End-to-End ohne App)

Backend direkt als CLI ausführen — umgeht Electron/Angular komplett:

```powershell
$be = "electron\res\omnai_BE\OmnAIScope-DataServer.exe"
$psi = [System.Diagnostics.ProcessStartInfo]::new()
$psi.FileName = $be; $psi.Arguments = "-s"
$psi.RedirectStandardOutput = $true; $psi.RedirectStandardError = $true
$psi.UseShellExecute = $false; $psi.CreateNoWindow = $true
$proc = [System.Diagnostics.Process]::Start($psi)
$out = $proc.StandardOutput.ReadToEndAsync()
if (-not $proc.WaitForExit(6000)) { $proc.Kill() }   # harter Timeout gg. Hänger
$out.Result
```

Erwartete Ausgabe bei Erfolg:
```
The following devices are connected:
Device: E4620C205B422834
```

Alternativ über den laufenden HTTP-Endpoint (Backend mit `-w -p <port>` starten):
```powershell
Invoke-RestMethod "http://127.0.0.1:<port>/UUID"
# { "error": "No devices are connected..." }  -> kein Gerät
# { "devices": [...], "colors": [...] }        -> ok
```

### Schritt 5 — App neu starten

Backend läuft, Gerät wird per CLI gefunden, App zeigt aber nichts?
→ Die App muss das Backend **mit bereits angeschlossenem Gerät** starten.
Electron neu starten:

```
npm run start:electron
```

Danach in der App (Advanced Mode aus) ▶ Play drücken → verbindet automatisch mit dem Scope.

## Merksätze

- **Erst Hardware ausschließen, dann Software.** Vier unabhängige Signale sagen dasselbe,
  wenn kein Gerät da ist: leere Windows-USB-Liste, `-s` "no omni devices found",
  `/UUID` "No devices", kein Datenstrom.
- **LED = Strom, nicht Daten.** Das Kabel/der Dock-Port ist der Top-Verdächtige.
- **Backend direkt per CLI testen** ist der schnellste Weg, App-Fehler von
  Backend/Hardware-Fehlern zu trennen.
- **`-s` immer mit Timeout** wegen der Endlosschleifen-Macke ohne Gerät.
