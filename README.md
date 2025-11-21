# Weather Prediction Forecasting

Weatherlens is an end‑to‑end workflow I built around a multi-model forecasting pipeline: engineered features feed tree-based regressors for temperature and humidity, an autoregressive component stabilizes barometric pressure trends, and I serialize the orchestrated outputs for real-time serving through Django. The stack emphasizes reproducible preprocessing, deterministic training, and predictable inference handoffs.

## Data & Feature Engineering
- I source multi-year hourly measurements from `weather.csv`, covering temperature, humidity, pressure, wind, cloud cover, and visibility.
- I rely on pandas and numpy for ingestion, timezone normalization, and datatype coercion.
- I forward-fill short gaps, apply median backstops for longer outages, and clip pressure/wind derivatives to realistic bounds.
- I encode temporal signals with sine/cosine pairs (hour-of-day, day-of-year) and add lagged differentials to capture short-term momentum.
- I normalize feature groups with z-score scaling and one-hot encode categorical weather codes when they appear.

## Modeling Architecture
- I train a multi-output scikit-learn `RandomForestRegressor` so min, max, and feels-like temperatures stay correlated.
- I deploy a `GradientBoostingRegressor` for humidity and cloud cover; shallow depth curbs overfitting on noisy readings.
- I bolt on a statsmodels ARIMA residual layer to capture slow barometric drift and feed corrections back into the ensemble.
- I blend model outputs using weights tuned on validation MAE and estimate uncertainty from Random Forest variance statistics.
- I persist every fitted estimator and preprocessing pipeline via joblib for downstream reuse.

## Evaluation Strategy
- I use a rolling-origin train/validation schedule that advances 24 hours per fold to respect chronology.
- I track MAE, RMSE, MASE (against climatology), and Pearson correlation for humidity trajectories.
- I generate diagnostic plots with seaborn/matplotlib for feature importance, residual shape, and forecast-vs-observation comparisons.
- I use statsmodels `acf`/`pacf` to choose lag windows and to ensure residual autocorrelation sits inside confidence bounds.

## Serving & Integration
- I keep the Django app `WeatherLens/forecast` lightweight: it loads the serialized pipelines once and keeps them warm for low-latency inference.
- I mirror notebook preprocessing inside the view so new requests flow through the exact same transformations before prediction.
- I convert SI units, format strings, and pass structured context into `weather.html`; front-end JavaScript only renders the five-hour chart.

## Repro / Local Execution
- Create the environment and install dependencies: `pip install -r requirements.txt`.
- Open the notebook to retrain or tweak models, then export fresh joblib artifacts to the paths consumed by `forecast/views.py`.
- Launch the Django server with `python WeatherLens/manage.py runserver` to validate end-to-end behavior.
- Optionally extend `weather.csv`; the notebook documents how I append new data slices without compromising historical splits.

## Interface Preview
- <img src="assets/first-screen.png" alt="Landing state" width="640" />  
  I use this empty-state panel to confirm the Django layer is live, highlight the search entry point, and show the placeholders awaiting metrics.

- <img src="assets/result-screen.png" alt="Prediction sample" width="640" />  
  This populated view demonstrates how the Random Forest + Gradient Boost + ARIMA ensemble surfaces headline weather, KPI blocks, and a five-hour temperature trajectory directly from the trained pipelines.
