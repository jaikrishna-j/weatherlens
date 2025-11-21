# Weather Prediction Forecasting

Weatherlens is an end‑to‑end weather prediction workflow: all modeling, feature engineering, and evaluation live in `Weather Prediction.ipynb`, and the trained outputs are surfaced through a lightweight Django UI for quick inspection. The primary artefact is the notebook—the web layer simply exposes the prediction results to non-technical users.

## Notebook Workflow
- **Dataset**: `weather.csv`, a multi-year hourly feed containing pressure, humidity, cloud cover, visibility, and temperature metrics.
- **Pre-processing**: Missing data handled with forward fill + median backstop, temporal features (hour-of-day, day-of-year) encoded numerically, and pressure/wind derived metrics normalized via z-score.
- **Feature Selection**: Mutual information + permutation importance to retain variables that maximize 1-step and 5-step forecast skill while preventing leakage.
- **Model Stack**:
  - Random Forest Regressor for near-term temperature (multi-output for min/max).
  - Gradient Boosting Regressor for humidity and cloud cover.
  - ARIMA-inspired residual correction for pressure trends.
- **Libraries**: pandas, numpy, scikit-learn, statsmodels, seaborn/matplotlib for diagnostics, joblib for serialization.
- **Evaluation**: Time-series aware train/validation split (rolling origin). Metrics tracked: MAE, RMSE, and skill score against climatology baseline.

Every experiment, plot, and discussion of algorithm trade-offs is documented directly within `Weather Prediction.ipynb`. Treat the notebook as the canonical technical report for this project.

## Django Delivery Layer
- Minimal Django app (`WeatherLens/forecast`) loads the latest serialized estimators and exposes them through a form-based interface.
- Views orchestrate inference calls, format units, and feed the results into `weather.html`.
- Static assets (JS/CSS) only handle pagination and basic charting; model logic remains in Python.

## Running Locally
1. Create a virtual environment and install dependencies:
   ```
   pip install -r requirements.txt
   ```
2. Open `Weather Prediction.ipynb` to retrain or inspect the models.
3. Export the fitted estimators (joblib) as described in the notebook and place them where the Django view expects.
4. Launch the web client for quick visualization:
   ```
   python WeatherLens/manage.py runserver
   ```

## Interface Preview
- ![Landing state](assets/first-screen.png)  
  Initial page before inference. Prompts for city input, confirms connection to the trained estimators, and displays placeholder panels ready to host the forecast outputs.

- ![Prediction sample](assets/result-screen.png)  
  Same layout populated with real predictions from the notebook-trained stack: headline weather description, key meteo metrics, and the five-hour temperature trajectory pulled directly from the serialized models.
