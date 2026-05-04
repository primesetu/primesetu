# SMRITI-OS Deployment Scripts

## Files in this folder

| Script | Purpose |
|---|---|
| `deploy-local.ps1` | Full on-premise local deployment (Nginx + Windows Services) |
| `deploy-hybrid.ps1` | Setup Cloudflare Tunnel or FRP for hybrid access |
| `switch-mode.ps1` | Quick switch between LOCAL / CLOUD / HYBRID modes |

## Usage

### Deploy Locally (Single Store, No Internet)
```powershell
# Run as Administrator
.\deploy-local.ps1 -ServerIP "192.168.1.104" -AppPath "D:\IMP\GitHub\primesetu"
```

### Setup Hybrid with Cloudflare (Recommended for most clients)
```powershell
.\deploy-hybrid.ps1 -Mode CLOUDFLARE -Domain "yourdomain.com"
```

### Setup Hybrid with FRP (Cloudflare alternative)
```powershell
.\deploy-hybrid.ps1 -Mode FRP -VpsIP "123.45.67.89" -Domain "yourdomain.com"
```

### Switch Modes On-the-fly
```powershell
.\switch-mode.ps1 -Mode LOCAL    # Full sovereign, no internet
.\switch-mode.ps1 -Mode CLOUD    # Full cloud (Supabase)
.\switch-mode.ps1 -Mode HYBRID   # Best of both
```

## Client Deployment Decision

```
Client Budget?
    Low  → deploy-local.ps1 (₹0/month)
    Mid  → deploy-hybrid.ps1 with Cloudflare
    High → deploy-hybrid.ps1 with own VPS + FRP
```

## Prerequisites

- **NSSM**: `winget install nssm` (for Windows services)
- **Node.js**: For frontend build
- **Python 3.11+**: For backend
- **Nginx for Windows**: https://nginx.org/en/download.html
