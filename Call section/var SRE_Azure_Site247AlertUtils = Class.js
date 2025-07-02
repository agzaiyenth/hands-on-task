var SRE_Azure_Site247AlertUtils = Class.create();
SRE_Azure_Site247AlertUtils.prototype = {
    initialize: function() {},
    type: 'SRE_Azure_Site247AlertUtils'
};

SRE_Azure_Site247AlertUtils.init = function(payload, cloudType) {
    var alertLogSysId = "";
    
    // Use common utility for alert logging
    alertLogSysId = SRE_Alert_Utils.insertAlertLog(payload, "Azure", cloudType);

    var service = "";
    var contactType = "";
    var assignmentGroup = "";
    var shortDescription = "";
    var description = "";
    var impact = 3; // Set low value by default
    var urgency = 3; // Set low value by default
    var majorIncident = "";
    
    if (cloudType == "Choreo" || cloudType == "Choreo-major-incident") {
        service = "b9c999f81b86a01000ae86acdd4bcb61";
        assignmentGroup = "f72176479326751010f1f9084dba10d2";
        gs.info("Choreo");
    }
    if (cloudType == "Asgadio" || cloudType == "Asgardeo-major-incident") {
        service = "97ed1b8b1ba26c1000ae86acdd4bcbd3";
        assignmentGroup = "e66e38f7870bb110c04976e4dabb35aa";
        gs.info("Asgadio");
    }
    if (cloudType == "Choreo-major-incident" || cloudType == "Asgardeo-major-incident") {
        majorIncident = "Accepted";
    }

    if (payload.data) {
        var monitoringService = payload.data.essentials.monitoringService;
        var alertStatus = payload.data.alertContext.status;
        var monitorCondition = payload.data.essentials.monitorCondition;
        contactType = "1";

        var isTrigger = SRE_Azure_Site247AlertUtils.isTriggerAlert(monitoringService, alertStatus, monitorCondition);

        if (isTrigger) {
            var severity = payload.data.essentials.severity;
            impact = SRE_Azure_Site247AlertUtils.getImpact(severity);
            urgency = SRE_Azure_Site247AlertUtils.getUrgency(severity);
            shortDescription = payload.data.essentials.alertRule;

            try {
                description = SRE_Azure_Site247AlertUtils.descriptionGenerator(payload);
                gs.info("description : " + description);
            } catch (err) {
                gs.error("Description generation Error : " + err);
                return "error : " + err;
            }
            
            // Use common utility for alert insertion
            var alertParams = {
                service: service,
                impact: impact,
                urgency: urgency,
                shortDescription: shortDescription,
                description: description,
                contactType: contactType,
                assignmentGroup: assignmentGroup,
                alertLogSysId: alertLogSysId,
                majorIncident: majorIncident
            };
            SRE_Alert_Utils.insertAlert(alertParams);
        }
        gs.info("script include isTrigger " + isTrigger);
    }
    
    if (payload.INCIDENT_REASON && payload.INCIDENT_DETAILS) {
        if (payload.STATUS == "TROUBLE" || payload.STATUS == "DOWN" || payload.STATUS == "CRITICAL") {
            shortDescription = payload.MONITORNAME;
            contactType = "2";
            try {
                description = SRE_Azure_Site247AlertUtils.site24_7DescriptionGenerator(payload);
                gs.info("description : " + description);
            } catch (err) {
                gs.error("Description generation Error : " + err);
                return "error : " + err;
            }
            
            // Use common utility for alert insertion
            var alertParams = {
                service: service,
                impact: impact,
                urgency: urgency,
                shortDescription: shortDescription,
                description: description,
                contactType: contactType,
                assignmentGroup: assignmentGroup,
                alertLogSysId: alertLogSysId,
                majorIncident: majorIncident
            };
            SRE_Alert_Utils.insertAlert(alertParams);
        }
    }
};

SRE_Azure_Site247AlertUtils.isTriggerAlert = function(monitoringService, alertStatus, monitorCondition) {
    //health check APIs
    var healthAlerts = gs.getProperty('sre.alert.health.types');

    if (healthAlerts.indexOf(monitoringService) != -1) {
        if (alertStatus == "Active") {
            return true;
        }
    } else {
        if (monitorCondition == "Fired") {
            return true;
        }
    }
    //For filter correct alerts
    //return false;
    
    //Any alert result to Incident
    return true;
};

SRE_Azure_Site247AlertUtils.getImpact = function(severity) {
    if (severity == "Sev0") {
        return "1";
    } else if (severity == "Sev1") {
        return "1";
    } else if (severity == "Sev2") {
        return "1";
    } else if (severity == "Sev3") {
        return "2";
    } else {
        return "3";
    }
};

SRE_Azure_Site247AlertUtils.getUrgency = function(severity) {
    if (severity == "Sev0") {
        return "1";
    } else if (severity == "Sev1") {
        return "2";
    } else {
        return "3";
    }
};

// Keep these methods for backward compatibility - they now call the common utils
SRE_Azure_Site247AlertUtils.insertAlertLog = function(message, cloudType) {
    return SRE_Alert_Utils.insertAlertLog(message, "Azure", cloudType);
};

SRE_Azure_Site247AlertUtils.insertAlert = function(service, impact, urgency, shortDescription, description, contactType, assignmentGroup, majorIncident) {
    var alertParams = {
        service: service,
        impact: impact,
        urgency: urgency,
        shortDescription: shortDescription,
        description: description,
        contactType: contactType,
        assignmentGroup: assignmentGroup,
        alertLogSysId: alertLogSysId,
        majorIncident: majorIncident
    };
    return SRE_Alert_Utils.insertAlert(alertParams);
};

SRE_Azure_Site247AlertUtils.jsonToHtml = function(json) {
    var html = "<ul>";
    for (var key in json) {
        if (json.hasOwnProperty(key)) {
            html += "<li><strong>" + key + ":</strong> ";
            if (typeof json[key] === "object" && json[key] !== null) {
                html += SRE_Azure_Site247AlertUtils.jsonToHtml(json[key]);
            } else {
                if (key == "LinkToSearchResults" || key == "LinkToFilteredSearchResultsUI" || key == "LinkToSearchResultsAPI" || key == "LinkToFilteredSearchResultsAPI") {
                    html += SRE_Azure_Site247AlertUtils.urlGenerator(json[key]);
                } else {
                    html += json[key];
                }
            }
            html += "</li>";
        }
    }
    html += "</ul>";
    return html;
};

SRE_Azure_Site247AlertUtils.urlGenerator = function(url) {
    return '<a href="' + url + '" target="_blank">' + url + "</a>";
};

SRE_Azure_Site247AlertUtils.descriptionGenerator = function(payload) {
    gs.info("script include descriptionGenerator " + JSON.stringify(payload));
    var firedDateTime = payload.data.essentials.firedDateTime;
    var description = payload.data.essentials.description;
    var alertId = payload.data.essentials.alertId;
    if (alertId !== null) {
        alertId = SRE_Azure_Site247AlertUtils.urlGenerator("https://portal.azure.com/#view/Microsoft_Azure_Monitoring/AlertDetailsTemplateBlade/alertId" + alertId);
    }

    var generatedDescription = "FiredDateTime : " + firedDateTime + "<br/>" +
        "Description : " + description + "<br/>" +
        "AlertId : " + alertId + "<br/><br/>" +
        SRE_Azure_Site247AlertUtils.jsonToHtml(payload.data.alertContext);

    return generatedDescription;
};

SRE_Azure_Site247AlertUtils.site24_7DescriptionGenerator = function(payload) {
    gs.info("script include descriptionGenerator " + JSON.stringify(payload));
    var firedDateTime = payload.INCIDENT_TIME;
    var monitorId = payload.MONITOR_ID;
    if (monitorId !== null) {
        monitorId = SRE_Azure_Site247AlertUtils.urlGenerator("https://www.site24x7.com/app/client#/home/monitors/" + monitorId);
    }

    var generatedDescription = "FiredDateTime : " + firedDateTime + "<br/>" +
        "MonitorId : " + monitorId + "<br/><br/>" +
        SRE_Azure_Site247AlertUtils.jsonToHtml(payload);

    return generatedDescription;
};