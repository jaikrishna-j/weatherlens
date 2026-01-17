# WeatherLens – Machine Learning Weather Forecasting

WeatherLens is a machine-learning powered weather prediction system built primarily inside **Weather Prediction.ipynb**. The notebook handles the full ML workflow, including data preprocessing, visualization, feature encoding, and model training using Random Forest algorithms. Django is used only to display the predictions in a clean, user-friendly web interface so users can easily understand the results. 

## Machine Learning Workflow

- Uses `weather.csv` as the historical dataset.
- pandas and numpy manage data loading, cleaning (dropna, deduplication), and type conversions.
- Visualization tools:
  - Histogram for temperature distribution
  - Correlation heatmap (`sns.heatmap`)
  - Temperature vs humidity scatter plot
- LabelEncoder transforms categorical wind directions.
- ML Models used:
  - **RandomForestClassifier** → Predicts Rain Tomorrow (Yes/No)
  - **RandomForestRegressor** → Predicts next 5-hour Temperature
  - **RandomForestRegressor** → Predicts next 5-hour Humidity
- This full workflow is implemented and documented inside the notebook for ML learning and demonstration.

## Django Integration (Frontend Serving)

- Real-time data fetched using OpenWeather API.
- ML prediction pipeline is reproduced in views.py for consistent predictions.
- UI displays current weather, rain prediction, humidity, pressure, visibility, cloud cover, and 5-hour forecast.
- Chart.js renders the forecast graph.
- Dynamic background images change based on weather type (sunny, cloudy, rain, mist, etc.).

## Visual Preview

<div>
  <img src="assets/first-screen.png" alt="Initial screen" width="640"/>
  <p>Starting screen before entering a city.</p>
</div>

<div>
  <img src="assets/result-screen.png" alt="Forecast output" width="640"/>
  <p>ML-powered forecast results displayed in the web interface.</p>
</div>

## How to Use (Clone & Run)

### Clone the repository

```bash
git clone https://github.com/jaikrishna-j/weatherlens.git
cd weatherlens
```

### Install dependencies

```bash
pip install -r requirements.txt
```

### Run the Django server

```bash
cd WeatherLens
python manage.py runserver
```

### Open the application

```
http://127.0.0.1:8000/
```

### Optional — Retrain the ML model

Open:
```
Weather Prediction.ipynb
```

Modify preprocessing, visualize trends, retrain, and test new predictions.
