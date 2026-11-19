## Before you install

- **Mac:** open the downloaded `.dmg` and drag Demand DNS to Applications. The app is signed and notarized by Apple, so
  macOS opens it without an "unidentified developer" warning.
- **Windows:** run the downloaded `-setup.exe`. The installer is not code-signed yet, so Windows SmartScreen may say it
  protected your PC. Choose _More info_, then _Run anyway_.
- **Check your download:** each file has a SHA-256 checksum next to it. Compare it with `shasum -a 256 <file>` on a Mac,
  or `Get-FileHash <file>` in PowerShell on Windows.

## After you download

1. Install Demand DNS on a machine on your local network.
2. Open the administration GUI and complete the initial setup.
3. Follow the [Documentation](/documentation) to add records and point your devices at the server.
