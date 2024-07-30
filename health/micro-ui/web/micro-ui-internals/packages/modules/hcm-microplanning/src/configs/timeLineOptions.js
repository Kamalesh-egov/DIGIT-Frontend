 export const timeLineOptions = ()=> {
  return  [
      {
        "id": 0,
        "name": "CAMPAIGN_DETAILS",
        "component": "CampaignDetails",
        "checkForCompleteness": true,
        "updateCampaign": true
      },
      {
        "id": 1,
        "name": "MICROPLAN_DETAILS",
        "component": "MicroplanDetails",
        "checkForCompleteness": true
      },
      {
        "id": 2,
        "name": "BOUNDARY_SELECTION",
        "component": "BoundarySelection",
        "checkForCompleteness": true,
        "updateCampaign":true
      },
  
      {
        "id": 3,
        "name": "UPLOAD_DATA",
        "component": "Upload",
        "checkForCompleteness": true
      },
      {
        "id": 4,
        "name": "HYPOTHESIS",
        "component": "Hypothesis",
        "checkForCompleteness": true
      },
      {
        "id": 5,
        "name": "FORMULA_CONFIGURATION",
        "component": "RuleEngine",
        "checkForCompleteness": true
      },
      {
        "id": 6,
        "name": "MAPPING",
        "component": "Mapping",
        "checkForCompleteness": false
      },
      {
        "id": 7,
        "name": "MICROPLAN_GENERATION",
        "component": "MicroplanPreview",
        "checkForCompleteness": false
      }
    ]
 }

