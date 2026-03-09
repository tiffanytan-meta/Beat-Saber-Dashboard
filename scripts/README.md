# Beat Saber Dashboard — Data Export Script

This script connects to Meta's internal data infrastructure (Daiquery/Presto) and exports Beat Saber analytics data to the dashboard's REST API.

## Prerequisites

- **Must be run inside a Meta Bento environment** (the data sources are internal-only)
- Python 3.8+
- `daiquery` package (available inside Meta's environment)
- `requests` and `pandas` packages

## Quick Start

```bash
# Inside your Bento notebook or terminal:
pip install requests pandas

python export_to_dashboard.py \
  --api-key "your-api-key-here" \
  --dashboard-url "https://your-dashboard.manus.space" \
  --start-date "2024-01-01" \
  --end-date "2025-12-31"
```

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `--api-key` | Dashboard API key (required) | — |
| `--dashboard-url` | Dashboard base URL (required) | — |
| `--start-date` | Start date (YYYY-MM-DD) | 12 months ago |
| `--end-date` | End date (YYYY-MM-DD) | Today |
| `--namespace` | Daiquery namespace | `de` |
| `--dashboard` | Which dashboard to export | `all` |
| `--output-json` | Save data to JSON file for debugging | — |

## Export Individual Dashboards

```bash
# Export only the Overview dashboard
python export_to_dashboard.py --api-key "..." --dashboard-url "..." --dashboard overview

# Export only Song Metrics
python export_to_dashboard.py --api-key "..." --dashboard-url "..." --dashboard song_metrics
```

## Programmatic Usage

```python
from export_to_dashboard import BeatSaberExporter

exporter = BeatSaberExporter(
    api_key="your-api-key",
    dashboard_url="https://your-dashboard.manus.space",
    start_date="2024-01-01",
    end_date="2025-12-31",
)

# Export everything
exporter.export_all()

# Or export specific dashboards
exporter.export_overview()
exporter.export_sales_overall()
exporter.export_individual_packs()
exporter.export_pack_release()
exporter.export_song_metrics()
```

## Scheduling with Dataswarm

To automate daily exports, create a Dataswarm pipeline that runs this script:

```python
# In your Dataswarm pipeline config:
from export_to_dashboard import BeatSaberExporter

def run_daily_export():
    exporter = BeatSaberExporter(
        api_key="your-api-key",
        dashboard_url="https://your-dashboard.manus.space",
    )
    exporter.export_all()
```

## API Endpoints

The dashboard exposes these REST endpoints for data upload:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `POST /api/data/upload` | POST | Upload data for any dashboard |
| `GET /api/data/:dashboardKey` | GET | Retrieve stored data |

### Upload Payload Format

```json
{
  "apiKey": "your-api-key",
  "dashboardKey": "overview",
  "payload": { ... },
  "dataDate": "2025-12-31"
}
```

Valid `dashboardKey` values: `overview`, `sales_overall`, `individual_pack`, `pack_release`, `song_metrics`

## Troubleshooting

- **"DaiqueryClient not available"**: You're not in a Meta Bento environment. The script will run in mock mode.
- **"requests not available"**: Install with `pip install requests`
- **Upload failures**: Check that the API key is valid and the dashboard URL is correct.
- **Empty data**: Verify the date range covers periods with data. Try `--output-json debug.json` to inspect raw query results.
