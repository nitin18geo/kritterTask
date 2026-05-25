// ============================================
// Village Economic Growth Intelligence
// Google Earth Engine JavaScript

// India boundary

var india_boundary = districts
    .geometry()
    .buffer(0)
    .bounds()
    .simplify(1000);

Map.addLayer(india)


// NIGHTTIME LIGHT GROWTH

var ntl_2019 = ee.ImageCollection(
    'NOAA/VIIRS/DNB/MONTHLY_V1/VCMCFG'
)
.filterDate('2019-01-01', '2019-12-31')
.select('avg_rad')
.mean();

var ntl_2024 = ee.ImageCollection(
    'NOAA/VIIRS/DNB/MONTHLY_V1/VCMCFG'
)
.filterDate('2024-01-01', '2024-12-31')
.select('avg_rad')
.mean();

var ntl_growth = ntl_2024.subtract(ntl_2019)
.rename('ntl_growth');

// BUILT-UP GROWTH

// Built-up 2019

var built_2019 = ee.ImageCollection(
    'JRC/GHSL/P2023A/GHS_BUILT_S'
)
.filter(ee.Filter.eq('system:index', '2019'))
.first()
.select('built_surface');

// Built-up 2024

var built_2024 = ee.ImageCollection(
    'JRC/GHSL/P2023A/GHS_BUILT_S'
)
.filter(ee.Filter.eq('system:index', '2024'))
.first()
.select('built_surface');

// Built-up growth

var built_growth = built_2024
    .subtract(built_2019)
    .rename('built_growth');

// NDVI GROWTH

var ndvi_2019 = ee.ImageCollection(
    'MODIS/061/MOD13Q1'
)
.filterDate('2019-01-01', '2019-12-31')
.select('NDVI')
.mean();

var ndvi_2024 = ee.ImageCollection(
    'MODIS/061/MOD13Q1'
)
.filterDate('2024-01-01', '2024-12-31')
.select('NDVI')
.mean();

var ndvi_growth = ndvi_2024
    .subtract(ndvi_2019)
    .rename('ndvi_growth');

// RESAMPLE ALL RASTERS TO 1 KM

var targetProjection = ee.Projection('EPSG:4326')
    .atScale(1000);

ntl_growth = ntl_growth
    .resample('bilinear')
    .reproject(targetProjection);

built_growth = built_growth
    .resample('bilinear')
    .reproject(targetProjection);

ndvi_growth = ndvi_growth
    .resample('bilinear')
    .reproject(targetProjection);

// NORMALIZE LAYERS

function normalize(image, region) {

    var bandName = image.bandNames().get(0);

    var stats = image.reduceRegion({
        reducer: ee.Reducer.minMax(),
        geometry: region,
        scale: 1000,
        bestEffort: true,
        maxPixels: 1e13
    });

    var min = ee.Number(
        stats.get(
            ee.String(bandName).cat('_min')
        )
    );

    var max = ee.Number(
        stats.get(
            ee.String(bandName).cat('_max')
        )
    );

    return image.subtract(min)
        .divide(max.subtract(min));
}

var ntl_norm = normalize(
    ntl_growth,
    india
);

var built_norm = normalize(
    built_growth,
    india
);

var ndvi_norm = normalize(
    ndvi_growth,
    india
);

// ECONOMIC GROWTH SCORE
// 40-30-30 WEIGHTS

var growth_score = (
    ntl_norm.multiply(0.4)
    .add(
        built_norm.multiply(0.3)
    )
    .add(
        ndvi_norm.multiply(0.3)
    )
).rename('growth_score');

growth_score = growth_score.clip(india);

//--------------
// VISUALIZATION

var vis = {
    min: 0,
    max: 1,
    palette: [
        'black',
        'purple',
        'blue',
        'cyan',
        'yellow',
        'red'
    ]
};

Map.addLayer(
    growth_score,
    vis,
    'Economic Growth Score'
);

//--------------------------
// EXPORT FINAL SCORE RASTER

Export.image.toDrive({
    image: growth_score,
    description: 'india_growth_score',
    folder: 'GEE_Exports',
    fileNamePrefix: 'india_growth_score',
    region: india,
    scale: 1000,
    crs: 'EPSG:4326',
    maxPixels: 1e13
});