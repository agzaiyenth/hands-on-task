var SRE_Alert_Utils = Class.create();
SRE_Alert_Utils.prototype = {
    initialize: function() {
    },
    type: 'SRE_Alert_Utils'
};

/**
 * Common alert log insertion
 * Standardizes logging across both AWS and Azure alerts
 * @param {Object} message - The alert payload/message to log
 * @param {String} channel - The channel (e.g., "AWS", "Azure")
 * @param {String} cloudType - The cloud service type (e.g., "Choreo", "Asgardeo")
 * @returns {String} alertLogSysId - The sys_id of the created alert log record
 */
SRE_Alert_Utils.insertAlertLog = function(message, channel, cloudType) {
    var gr = new GlideRecord('u_alert_log');
    gr.initialize();
    gr.u_message = JSON.stringify(message);
    gr.u_channel = channel;
    gr.u_service = cloudType;
    var alertLogSysId = gr.insert();
    return alertLogSysId;
};

/**
 * Common incident creation
 * Standardizes incident creation with all common fields
 * @param {Object} alertParams - Object containing all incident parameters
 * @param {String} alertParams.service - Business service sys_id
 * @param {String} alertParams.impact - Impact level (1-3)
 * @param {String} alertParams.urgency - Urgency level (1-3)
 * @param {String} alertParams.shortDescription - Short description of the incident
 * @param {String} alertParams.description - Detailed description of the incident
 * @param {String} alertParams.contactType - Contact type
 * @param {String} alertParams.assignmentGroup - Assignment group sys_id
 * @param {String} alertParams.alertLogSysId - Related alert log sys_id
 * @param {String} alertParams.majorIncident - Major incident state (optional)
 * @returns {String} result - The sys_id of the created incident record
 */
SRE_Alert_Utils.insertAlert = function(alertParams) {
    var gr = new GlideRecord('incident');
    gr.initialize();
    
    // Log parameters for debugging
    gs.info("SRE_Alert_Utils - service: " + alertParams.service);
    gs.info("SRE_Alert_Utils - impact: " + alertParams.impact);
    gs.info("SRE_Alert_Utils - urgency: " + alertParams.urgency);
    gs.info("SRE_Alert_Utils - shortDescription: " + alertParams.shortDescription);
    gs.info("SRE_Alert_Utils - description: " + alertParams.description);
    
    // Set incident fields
    gr.business_service = alertParams.service;
    gr.impact = alertParams.impact;
    gr.urgency = alertParams.urgency;
    gr.short_description = alertParams.shortDescription;
    gr.description = alertParams.description;
    gr.contact_type = alertParams.contactType;
    gr.assignment_group = alertParams.assignmentGroup;
    gr.caller_id = "6802942d47227950a85346bd416d4371"; // Common caller ID
    gr.u_alert_id = alertParams.alertLogSysId;
    gr.state = 1; // New state
    gr.category = "service_interruption"; // Common category
    
    // Set major incident state if provided
    if (alertParams.majorIncident) {
        gr.major_incident_state = alertParams.majorIncident;
    }
    
    var result = gr.insert();
    return result;
};