export function extractTemperatureString(data) {
    const regex = /(?:^[^:]+:\s*)?(.*)/;
    const match = data.match(regex);
  
    if (match) {
      const temperatureString = match[1];
      return temperatureString;
    } else {
      return null;
    }
  }