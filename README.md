# kritterTask
This project is in response to the Senior Geospatial Data Scientist role at Kritter. Submitted by Nitin Sharma.

## Final map
<img width="4160" height="4768" alt="top100_clustered_map" src="https://github.com/user-attachments/assets/21b835b4-2a1f-4822-ad78-b4fa88c0d2b4" />

# Village Economic Growth Intelligence

## Overview

This project identifies the top 100 villages in India exhibiting the highest proxy indicators of economic growth between 2019 and 2024 using Earth Observation datasets and geospatial analytics.

The workflow combines:
- Google Earth Engine for raster generation and processing
- Python for village-level extraction, ranking, and visualization

---

# Data Sources

| Dataset | Purpose | Rationale |
|---|---|---|
| VIIRS Nighttime Lights | Economic activity proxy | Increased lighting intensity reflects electrification, industrialization, and economic activity |
| GHSL Built-up Surface | Infrastructure growth proxy | Expansion in built-up surface indicates settlement and infrastructure growth |
| MODIS NDVI | Agricultural productivity proxy | Increased vegetation productivity may indicate improved agricultural performance |
| India Village Boundaries | Spatial reference layer | Used for assigning growth scores to villages |

---

# Methodology

## Step 1 — India Boundary Generation

District boundaries were merged and simplified to create a single India-wide processing boundary.

The boundary was used for:
- raster clipping
- normalization
- export operations

---

## Step 2 — Nighttime Light Growth

Annual mean VIIRS nighttime light composites were generated for:
- 2019
- 2024

Growth was calculated as:

```math
NTL_{growth} = NTL_{2024} - NTL_{2019}
```

This captures:
- electrification
- commercial activity
- settlement intensity

---

## Step 3 — Built-up Growth

GHSL built-up surface datasets were used for:
- 2019
- 2024

Growth was calculated as:

```math
Built_{growth} = Built_{2024} - Built_{2019}
```

This captures:
- infrastructure expansion
- settlement growth
- construction activity

---

## Step 4 — NDVI Growth

MODIS NDVI composites were generated for:
- 2019
- 2024

Growth was calculated as:

```math
NDVI_{growth} = NDVI_{2024} - NDVI_{2019}
```

This acts as a proxy for:
- agricultural productivity
- vegetation improvement
- rural land productivity

---

## Step 5 — Raster Resampling

All rasters were resampled to:
- 1 km spatial resolution
- EPSG:4326 projection

Reasons:
- national-scale computational efficiency
- consistency across datasets
- manageable export size

---

## Step 6 — Normalization

Each growth layer was normalized using min-max scaling:

```math
X_{norm} = \frac{X - X_{min}}{X_{max} - X_{min}}
```

This ensured:
- comparable ranges
- balanced contribution between variables

---

# Economic Growth Estimation Formula

The final economic growth score was estimated using weighted linear combination:

```math
GrowthScore = 0.4(NTL_{norm}) + 0.3(Built_{norm}) + 0.3(NDVI_{norm})
```

## Weight Justification

| Variable | Weight | Reason |
|---|---|---|
| Nighttime Lights | 40% | Strongest proxy for economic activity |
| Built-up Growth | 30% | Indicates infrastructure and settlement expansion |
| NDVI Growth | 30% | Represents agricultural productivity and rural growth |

---

# Google Earth Engine Workflow

The following operations were performed in Google Earth Engine:

1. Generate nighttime light growth raster
2. Generate built-up growth raster
3. Generate NDVI growth raster
4. Normalize all layers
5. Generate final weighted economic growth raster
6. Export final raster (`india_growth_score.tif`)

The Google Earth Engine script is available in:

- `RasterProcessingGEE.js`

---

# Python Workflow

## Step 1 — Read Village Boundaries

Village polygons were loaded using GeoPandas.

Only required attributes were retained:
- village name
- state
- geometry

---

## Step 2 — Convert Villages to Centroids

Instead of polygon zonal statistics over ~600,000 villages, polygons were converted to centroid points.

Reasons:
- dramatically faster computation
- lower memory requirements
- acceptable at 1 km raster resolution

---

## Step 3 — Raster Sampling

The exported growth raster was sampled at village centroids using:
- rasterio
- numpy indexing

Each village centroid received a growth score from the raster.

---

## Step 4 — Rank Villages

Villages were ranked in descending order based on:
- growth score

Top 100 villages were extracted as the final output dataset.

---

# Outputs

| Output | Description |
|---|---|
| `india_growth_score.tif` | Final economic growth raster |
| `top100_growth_villages.csv` | Top 100 ranked villages |
| `top100_growth_villages.geojson` | Spatial output |
| `top100_clustered_map.png` | Clustered village visualization |
| `RasterProcessingGEE.js` | Google Earth Engine workflow |
| `GrowthRasterToTop100.ipynb` | Python processing workflow |

---

# Key Computational Optimizations

| Optimization | Benefit |
|---|---|
| Single raster export | Reduced I/O overhead |
| 1 km resolution | Faster processing |
| Centroid sampling | Avoided expensive polygon zonal statistics |
| Numpy-based raster extraction | Faster than iterative raster sampling |
| Simplified village attributes | Lower memory usage |

---

# Limitations

- EO proxies do not directly measure income or GDP
- Village centroid sampling may overlook intra-village variability
- Temporal resolution differs between datasets
- Built-up growth may not always indicate prosperity
- Agricultural productivity improvements do not universally translate to economic growth

Despite these limitations, the framework provides a scalable and interpretable intelligence system for identifying spatial growth patterns across rural India.

---

# Libraries Used

- Google Earth Engine
- GeoPandas
- Rasterio
- NumPy
- Pandas
- Matplotlib
- Contextily

---

# Author
Nitin Sharma
