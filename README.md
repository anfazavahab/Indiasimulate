# IndiaSimulate · Social Protection Atlas

[![status: pre-alpha](https://img.shields.io/badge/status-pre--alpha-orange)]()
[![data: 2024-25](https://img.shields.io/badge/data-2024--25-blue)]()
[![license: MIT](https://img.shields.io/badge/license-MIT-green)]()

State-level visualisation atlas for India's social protection system — old-age pensions, health insurance (SHIPs), and MGNREGS wages. Part of the [IndiaSimulate](https://github.com/anfazavahab/Indiasimulate) microsimulation project.

**Live site:** https://anfazavahab.github.io/social-protection-atlas

---

## Policy domains covered

| Domain | States | Year | Key metric |
|---|---|---|---|
| Old-age social pension | 21 | 2024 | ₹/month (central + state top-up) |
| Health insurance (SHIP) | 19 | 2023–24 | ₹ per capita SHIP budget |
| MGNREGS wages | 20 | 2024–25 | ₹/day (notified rate) |

---

## Repository structure

```
social-protection-atlas/
├── index.html                  ← GitHub Pages entry point
├── css/
│   └── style.css               ← All styles
├── js/
│   └── main.js                 ← Chart.js logic and data loading
├── data/
│   ├── pensions.json           ← Old-age pension by state
│   ├── health_insurance.json   ← SHIP budget & coverage
│   └── mgnregs.json            ← MGNREGS wage rates
└── README.md
```

---

## Deploy to GitHub Pages (3 steps)

1. Push this repo to `github.com/anfazavahab/social-protection-atlas`
2. Go to **Settings → Pages → Source → `main` branch, `/root`**
3. Site live at `anfazavahab.github.io/social-protection-atlas`

---

## Data sources

- **Pensions:** State government orders (G.O.Ms. references per state); [NSAP guidelines](https://nsap.nic.in), MoRD
- **Health insurance:** Vahab A. & Drèze J. (2025), [The India Forum](https://www.theindiaforum.in/public-policy/how-healthy-health-insurance); state budget documents
- **MGNREGS:** Ministry of Rural Development, S.O. gazette notification, March 2024

---

## Relation to IndiaSimulate

IndiaSimulate is being developed as India's first open-access social protection microsimulation model, starting with Kerala (v0.1), inspired by [SOUTHMOD](https://southmod.net) and [EUROMOD](https://euromod-web.jrc.ec.europa.eu). This Atlas provides the comparative empirical foundation.

---

## Contributing

Data corrections welcome. Open an issue with: the corrected figure, the official source URL, and the date of verification.

## License

MIT. Data sourced from public government documents and published research.
