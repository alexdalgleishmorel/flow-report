<table style="border-collapse: collapse; border: none;">
  <tr>
    <td style="border: none;">
      <img src="https://github.com/alexdalgleishmorel/flow-report/blob/main/src/water-outline-modified-modified.png" alt="alt text" width="300" height="300">
    </td>
    <td style="border: none;">
      <h1>Flow Report App</h1>
      <p>Surf the Perfect Wave: Forecasted River Flow Rates at Your Fingertips.</p>
    </td>
  </tr>
</table>

## Description
The Flow Report App is a specialized tool designed for surfers to monitor and analyze the forecasted flow rate of the Kananaskis River.
By leveraging up-to-date data from TransAlta, the app provides a four-day flow rate forecast via a user-friendly interface.

### Key Features:
#### 1. **Flow Rate Forecast Visualization**
Visualize the forecasted flow rate for the next four days with beautiful chart.js bar charts, that dynamically change based on your desired flow rate.
#### 2. **Dynamic Minimum Flow Rate Filter**
Adjust the minimum flow rate required for surfing. The graph and informational displays update accordingly.
#### 3. **Real-Time Flow Status**
An upper toolbar indicates whether the current flow rate is adequate for surfing based on the user-set minimum, alongside a countdown timer displaying when the next suitable flow will begin or when the current flow will end.
#### 4. **Interactive Data Visualization**
Color-coded graphs help users visually distinguish between optimal and suboptimal surfing days.
#### 5. **Automatic Data Refresh**
A GitHub workflow automatically refreshes the flow and weather data every 24 hours, ensuring the latest flow rate and weather forecasts.
#### 6. **Customizable User Settings**
A lower toolbar allows for adjustments to the minimum flow rate, updating visual indicators and forecast information.

## Technologies Used
1. **[Node.js V21](https://nodejs.org/en)**
2. **[React V18](https://react.dev/)**
3. **[Ionic Framework](https://ionicframework.com/)**
4. **GitHub Actions for Automatic Data Refresh**
5. **Flow data sourced from TransAlta's Forecasted Flow Rate API**
6. **Weather data sourced from [Open-Meteo Weather API](https://open-meteo.com/)**

## Demo Video
https://youtu.be/1zs52CFQ0kw
