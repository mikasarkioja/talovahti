// src/lib/services/fmiParser.ts

export interface FmiDataPoint {
  time: Date;
  value: number;
}

export interface FmiForecastResponse {
  temperature: FmiDataPoint[];
  snowDepth: FmiDataPoint[];
  windSpeed: FmiDataPoint[];
}

/**
 * Parses the GML/XML response from FMI WFS TimeValuePair queries.
 * Standard query: fmi::forecast::harmonie::surface::point::timevaluepair
 */
export function parseFmiXml(xmlString: string): FmiForecastResponse {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");

  // Helper to extract values by FMI parameter name (e.g., 't2m', 'snow_aws')
  const extractParameterData = (paramName: string): FmiDataPoint[] => {
    const dataPoints: FmiDataPoint[] = [];
    
    // FMI uses 'om:OM_Observation' to wrap each parameter's time series
    const observations = xmlDoc.getElementsByTagName("om:OM_Observation");
    
    for (let i = 0; i < observations.length; i++) {
      const obs = observations[i];
      const observedProperty = obs.getElementsByTagName("om:observedProperty")[0];
      const href = observedProperty?.getAttribute("xlink:href") || "";

      // Check if this observation block matches our desired parameter
      if (href.includes(`parameter=${paramName}`)) {
        const timeValuePairs = obs.getElementsByTagName("wml2:point");
        
        for (let j = 0; j < timeValuePairs.length; j++) {
          const timeStr = timeValuePairs[j].getElementsByTagName("wml2:time")[0]?.textContent;
          const valStr = timeValuePairs[j].getElementsByTagName("wml2:value")[0]?.textContent;

          if (timeStr && valStr) {
            dataPoints.push({
              time: new Date(timeStr),
              value: parseFloat(valStr),
            });
          }
        }
      }
    }
    return dataPoints;
  };

  return {
    temperature: extractParameterData("t2m"),
    snowDepth: extractParameterData("snow_aws"),
    windSpeed: extractParameterData("windspeedms"),
  };
}