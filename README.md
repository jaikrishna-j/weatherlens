# Weather Prediction Forecasting

Weatherlens is an end‑to‑end workflow where `Weather Prediction.ipynb` performs all machine-learning tasks—data prep, algorithm training, validation, and artifact export—while Django merely relays the serialized predictions to end users. Treat the notebook as the single source of truth for methodology.

## Data & Feature Engineering
- `weather.csv`: multi-year hourly measurements for temperature, humidity, pressure, wind, cloud cover, and visibility.
- pandas + numpy: handle ingestion, timezone normalization, and datatype coercion.
- Missing values: forward-fill short gaps; median imputation for longer outages; pressure/wind derived fields clipped to physical bounds.
- Temporal features: sine/cosine encodings for hour-of-day/day-of-year to preserve continuity, plus lagged differentials for short-term momentum.
- Scaling: z-score normalization per feature group; categorical weather codes one-hot encoded when present.

## Modeling Architecture
- scikit-learn RandomForestRegressor (multi-output) targets min/max/feels-like temperatures simultaneously to preserve internal correlation.
- GradientBoostingRegressor predicts humidity and cloud cover, leveraging shallow depth to prevent overfitting noisy signals.
- statsmodels-driven ARIMA residual layer captures long-range pressure drift and corrects tree-based residuals.
- Ensemble inference: outputs blended via weighted averaging derived from validation MAE; uncertainty estimated through RF variance.
- joblib persists every fitted estimator and preprocessing pipeline for reuse by Django.

## Evaluation Strategy
- Rolling-origin train/validation split ensures chronological integrity; each fold advances by 24 hours to mimic real operations.
- Metrics: MAE, RMSE, mean absolute scaled error (MASE) versus climatology baseline, and Pearson correlation for humidity trajectories.
- seaborn/matplotlib: diagnostic plots for feature importances, residual distributions, and forecast-vs-observation timelines.
- statsmodels `acf`/`pacf` guides lag selection and confirms that residual autocorrelation stays within confidence bounds.

## Serving & Integration
- Django app `WeatherLens/forecast` loads the serialized pipelines once per process and maintains them in memory for low-latency inference.
- View layer orchestrates preprocessing (same steps as notebook via joblib pipeline), executes predictions, converts SI units, and passes context into `weather.html`.
- Front-end JavaScript only draws the hourly curve; all algorithmic logic remains in Python to guarantee parity with the notebook experiments.

## Repro / Local Execution
- Create environment and install dependencies:
  - `pip install -r requirements.txt`
- Open `Weather Prediction.ipynb`:
  - rerun cells to retrain models, adjust hyperparameters, or regenerate evaluation plots.
  - export updated estimators via joblib dump paths referenced in `forecast/views.py`.
- Launch Django for visualization:
  - `python WeatherLens/manage.py runserver`
- Optional: use provided `weather.csv` or extend the dataset; notebook cells document how to append new data slices safely.

## Interface Preview
- ![Landing state](assets/first-screen.png)  
  Empty-state panel rendered before inference; verifies the Django layer is live, highlights the city search field, and shows placeholder cards awaiting notebook-derived metrics.

- ![Prediction sample](assets/result-screen.png)  
  Populated state featuring actual predictions from the Random Forest + Gradient Boost + ARIMA ensemble: includes textual weather summary, key meteorological KPIs, and a five-hour temperature trajectory driven entirely by the trained pipelines.
