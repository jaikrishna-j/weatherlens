import os

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.shortcuts import render

# Create your views here.
import requests   # This library helps us to fetch data from API
import pandas as pd   #For handling data & analysing data
import numpy as np  #For numerical operations
import matplotlib.pyplot as plt  #For data visualization
import seaborn as sns  #For data visualization
from sklearn.model_selection import train_test_split  #To splitting data into training & testing sets
from sklearn.preprocessing import LabelEncoder  #To convert categorical data into numerical values
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor  #Models for classification & Regression task
from sklearn.metrics import mean_squared_error  #To measure the accuracy of our predictions
from datetime import datetime, timedelta, timezone  #To handle data and time

from .models import SearchHistory

BASE_URL = 'https://api.openweathermap.org/data/2.5/' #Base url for making API requests

def get_weather_api_key():
  api_key = getattr(settings, "WEATHER_API_KEY", None) or os.environ.get("WEATHER_API_KEY")
  if not api_key:
    raise ImproperlyConfigured("WEATHER_API_KEY is not set in settings or environment variables.")
  return api_key


#1. Fetch Current Weather Data

def get_current_weather(city):
  if not city or not city.strip():
    return None
  
  api_key = get_weather_api_key()
  url = f"{BASE_URL}weather?q={city.strip()}&appid={api_key}&units=metric"  #Contruct the API request URL
  response = requests.get(url) #send the get request to API
  data = response.json()
  
  # Check if API returned an error
  if response.status_code != 200 or ('cod' in data and data['cod'] != 200):
    return None
  
  # Check if required keys exist in the response
  if 'name' not in data or 'main' not in data or 'weather' not in data:
    return None
  
  return {
      'city': data['name'],
      'current_temp': round(data['main']['temp']),
      'feels_like': round(data['main']['feels_like']),
      'temp_min': round(data['main']['temp_min']),
      'temp_max' : round(data['main']['temp_max']),
      'humidity': round(data['main']['humidity']),
      'description': data['weather'][0]['description'],
      'country': data['sys']['country'],
      'wind_gust_dir': data.get('wind', {}).get('deg', 0),
      'pressure': data['main']['pressure'],
      'Wind_Gust_Speed': data.get('wind', {}).get('speed', 0),
      'clouds' : data.get('clouds', {}).get('all', 0),
      'Visibility' : data.get('visibility', 10000),
      'timezone_offset': data.get('timezone', 0),
  }

#2. Read Historical Data

def read_historical_data(filename):
  df = pd.read_csv(filename)
  df = df.dropna() #remove rows with missing values
  df = df.drop_duplicates()
  return df


#3. Prepare data for training

def prepare_data(data):
  le = LabelEncoder() #Create a LabelEncoder instance
  data['WindGustDir'] = le.fit_transform(data['WindGustDir'])
  data['RainTomorrow'] = le.fit_transform(data['RainTomorrow'])

  #Define the feature variables and target variables
  X = data[['MinTemp', 'MaxTemp', 'WindGustDir', 'WindGustSpeed', 'Humidity', 'Pressure', 'Temp']]  #Feature variables
  y = data['RainTomorrow']  #Target variable

  return X, y, le  #return feature variable, target variable and the label encoder


#4. Train Rain Prediction Model

def train_rain_model(X, y):
  X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
  model = RandomForestClassifier(n_estimators=100, random_state=42) #100 decision trees aloted and same random state for each to give accurate results
  model.fit(X_train, y_train) #Train the model

  y_pred = model.predict(X_test) #To make predictions on test set
  
  print("Mean Squared Error for Rain Model")

  print(mean_squared_error(y_test, y_pred))

  return model


#5. Prepare Regression Data

def prepare_regression_data(data, feature): # X is for feature values & y is for target values.
  X, y = [], [] #Initialize list for feature and target values

  for i in range(len(data) - 1):
    X.append(data[feature].iloc[i])

    y.append(data[feature].iloc[i+1])

  X = np.array(X).reshape(-1, 1)
  y = np.array(y)
  return X, y


#Train Regression Model

def train_regression_model(X, y):
  model = RandomForestRegressor(n_estimators=100, random_state=42)
  model.fit(X, y)
  return model


#Predict Future

def predict_future(model, current_value):
  predictions = [current_value]

  for i in range(5):
    next_value = model.predict(np.array([[predictions[-1]]]))

    predictions.append(next_value[0])

  return predictions[1:]


#Weather Analysis Function

def weather_view(request):
    if request.method == 'POST':
        city = request.POST.get('city', '').strip()
        
        # Validate city input
        if not city:
            context = {
                'error': 'Please enter a city name.',
            }
            return render(request, 'weather.html', context)
        
        current_weather = get_current_weather(city)
        
        # Check if weather data was successfully retrieved
        if current_weather is None:
            context = {
                'error': f'City "{city}" not found. Please check the spelling and try again.',
            }
            return render(request, 'weather.html', context)

        #load historical data
        csv_path = settings.BASE_DIR.parent / 'weather.csv'
        historical_data = read_historical_data(str(csv_path))

        #prepare & train the rain prediction model
        X, y, le = prepare_data(historical_data)

        rain_model = train_rain_model(X, y)

        #Map wind direction to compass points
        wind_deg = current_weather['wind_gust_dir'] % 360
        compass_points = [
            ("N", 0, 11.25), ("NNE", 11.25, 33.75), ("NE", 33.75, 56.25),
            ("ENE", 56.25, 78.75), ("E", 78.75, 101.25), ("ESE", 101.25, 123.75),
            ("SE", 123.75, 146.25), ("SSE", 146.25, 168.75), ("S", 168.75, 191.25),
            ("SSW", 191.25, 213.75), ("SW", 213.75, 236.25), ("WSW", 236.25, 258.75),
            ("W", 258.75, 281.25), ("WNW", 281.25, 303.75), ("NW", 303.75, 326.25),
            ("NNW", 326.25, 348.75)
        ]
        compass_direction = next(point for point, start, end in compass_points if start <= wind_deg < end)

        compass_direction_encoded = le.transform([compass_direction])[0] if compass_direction in le.classes_ else -1

        current_data = {
            'MinTemp': current_weather['temp_min'],
            'MaxTemp': current_weather['temp_max'],
            'WindGustDir': compass_direction_encoded,
            'WindGustSpeed': current_weather['Wind_Gust_Speed'],
            'Humidity': current_weather['humidity'],
            'Pressure': current_weather['pressure'],
            'Temp': current_weather['current_temp'],
        }

        current_df = pd.DataFrame([current_data])


        #Rain prediction

        rain_prediction = rain_model.predict(current_df)[0]


        #Prepare regression model for temperature and humidiy

        X_temp, y_temp = prepare_regression_data(historical_data, 'Temp')
        X_hum, y_hum = prepare_regression_data(historical_data, 'Humidity')

        temp_model = train_regression_model(X_temp, y_temp)
        hum_model = train_regression_model(X_hum, y_hum)


        #Predict future temperature & humidity
        future_temp = predict_future(temp_model, current_weather['temp_min'])
        future_humidity = predict_future(hum_model, current_weather['humidity'])



        #Prepare time for future predictions

        timezone_offset = int(current_weather.get('timezone_offset', 0) or 0)
        city_timezone = timezone(timedelta(seconds=timezone_offset))
        city_now = datetime.now(city_timezone)
        next_hour = (city_now + timedelta(hours=1)).replace(minute=0, second=0, microsecond=0)

        future_times = [(next_hour + timedelta(hours=i)).strftime("%H:%M") for i in range(5)]


        #Store each value seperately to send to template
        time1, time2, time3, time4, time5 = future_times
        temp1, temp2, temp3, temp4, temp5 = future_temp
        hum1, hum2, hum3, hum4, hum5 = future_humidity

        #Record search history for analytics
        SearchHistory.objects.create(
            city=current_weather['city'],
            user=request.user if request.user.is_authenticated else None,
            temperature=current_weather['current_temp'],
            humidity=current_weather['humidity'],
            description=current_weather['description'],
        )

        #Pass data to template
        context = {
          'location' : city,
          'current_temp' : current_weather['current_temp'],
          'MinTemp' : current_weather['temp_min'],
          'MaxTemp' : current_weather['temp_max'],
          'feels_like' : current_weather['feels_like'],
          'humidity' : current_weather['humidity'],
          'clouds' : current_weather['clouds'],
          'description' : current_weather['description'],
          'city' : current_weather['city'],
          'country' : current_weather['country'],

          'time' : city_now.strftime("%b %d, %Y; %I:%M %p"),
          'date' : city_now.strftime("%B %d, %Y"),

          'wind' : current_weather['Wind_Gust_Speed'],
          'pressure' : current_weather['pressure'],
          'visibility' : current_weather['Visibility'],

          'time1': time1,
          'time2': time2,
          'time3': time3,
          'time4': time4,
          'time5': time5,

          'temp1': f"{round(temp1, 1)}",
          'temp2': f"{round(temp2, 1)}",
          'temp3': f"{round(temp3, 1)}",
          'temp4': f"{round(temp4, 1)}",
          'temp5': f"{round(temp5, 1)}",

          'hum1': f"{round(hum1, 1)}",
          'hum2': f"{round(hum2, 1)}",
          'hum3': f"{round(hum3, 1)}",
          'hum4': f"{round(hum4, 1)}",
          'hum5': f"{round(hum5, 1)}",

        }

        return render(request, 'weather.html', context)
    
    return render(request, 'weather.html')


def health_check(request):
    """Simple health check endpoint for Render to verify the app is ready."""
    from django.http import JsonResponse
    return JsonResponse({'status': 'ok', 'service': 'weatherlens'})