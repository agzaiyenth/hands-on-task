(function() {
    data.myCalls = [];
    data.wso2Calls = [];
		data.refreshRequired = false; 
		data.isAssigned = false;
		var finalTimes = [];
	
		var caseRecord = new GlideRecord('sn_customerservice_case');
	
		var timeZoneConverter = new global.TimeZoneConversions();
		var calendarApi = new global.GoogleCalendarAPI();
		var handleCallStates = new global.AddCommentsAndWorkNotes();

    if (input) {

				var parentSysId = input.parentSysId;
			
				if (input.parentSysId) {
						if (caseRecord.get(input.parentSysId)) {
								var assignedTo = caseRecord.getValue('assigned_to');
								if (assignedTo) {
										data.isAssigned = true;
								} else {
										data.isAssigned = false;
								}
								gs.info("[Call Management] Case assignee is : "+ data.isAssigned);
						} else {
								data.isAssigned = false;
								gs.info("[Call Management] Record with parentSysId not found: " + input.parentSysId);
						}
				} else {
						data.isAssigned = false;
						gs.info("[Call Management] parentSysId not provided.");
				}
				
				var gr = new GlideRecord('sn_customerservice_customer_call');  
				gr.addQuery('parent', parentSysId);  
				gr.query();

				while (gr.next()) {
					var status, color,stateread;
					if (gr.getValue('state') == 1) {
						status = "Request";
						stateread="Requested";
						color = 'red';
					} else if (gr.getValue('state') == 2) {
						status = "Pending";
						stateread="Pending";
						color = 'orange';
					} else if (gr.getValue('state') == 3) {
						status = "Scheduled";
						stateread="Scheduled";
						color = 'green';
					} else if (gr.getValue('state') == 7) {
						status = "Notes Pending";
						stateread="Notes Pending";
						color = 'orange';
					} else {
						continue;
					}

					var reason = gr.getValue('u_reason') || "";
					var status2 = gr.getValue('state');
					console.log(status);
					var isAgentReason = reason.startsWith("[AGENT]");
					reason = reason.replace(/^\[(CUSTOMER|AGENT)\]\s*/, "");

					// Query the 'u_time_slots' table for start times
					var startTimes = [];
					var tempMeetingDate = gr.getValue("u_meeting_date"); // Get the selected temp meeting date
					//var finalTimesJSON = gr.getValue("u_final_times"); // Get the JSON times field
					var meetingLink = gr.getValue('u_call_link');

					console.log("Fetched finalTimes");
					console.log("Call Number: " + gr.getValue("number"));

					if (status2 == 2) {
						console.log("u_temp_meeting_date is empty. Adding times from u_final_times.");

						console.log(gr.getValue("u_final_times"));					

						if (gr.getValue("u_final_times")) {
							console.log("finalTimes:");
							//console.log(finalTimesJSON);
							
							var finalTimesArray = JSON.parse(gr.getValue("u_final_times"));
							console.log("finalTimesArray :"+finalTimesArray);

							try {	
								finalTimesArray.forEach(function (timeObj) {
									if (timeObj.time) {
										var convertedTime = timeZoneConverter.convertToUserTimezone(timeObj.time);
										console.log("Converted Time for each : "+convertedTime);
										startTimes.push(convertedTime);										
									}
								});															

							} catch (e) {
								console.log("Error parsing u_final_times JSON: ");
							}
						}
					} else if (status2 == 3 || status2 == 7) {
						console.log("u_temp_meeting_date is selected: ");
						var convertedTime = timeZoneConverter.convertToUserTimezone(tempMeetingDate);
						startTimes.push(convertedTime);
					}
					
					data.finalTimes1 = finalTimes;
					
					var callData = {
							callNumber: gr.getValue('number'),
							reason: reason,
							startTimes: startTimes || "You have to Accept the request and provide convenient start times.",
							status: status,
							stateread:stateread,
							statusColor: color,
							meetingLink: gr.getValue('u_call_link') || "No link provided"
					};
				

					if (isAgentReason) {
							data.wso2Calls.push(callData);
					} else {
							data.myCalls.push(callData);
					}
					
				}
			
				var callRecord;
				var callNumber;
				var updateResult;
				var cancelReason;
				var isCommented = false;
			
				if (input.callNumber && input.cancelReason) {
							callRecord = new GlideRecord('sn_customerservice_customer_call');
							callNumber = input.callNumber;
							cancelReason = "[CUSTOMER] "+input.cancelReason;
							console.log(cancelReason);
							console.log(callNumber);						
								
							if (cancelReason) {
								gs.info("[Call Management] inside the if block. parentSysId ::: ");
								if (!isCommented) {
									handleCallStates.addAComment(parentSysId,"Call ["+ callNumber +"]  has been cancelled.");
									cancelReason = "";
									isCommented=true;
								}								
								gs.info("[Call Management] Comment added");
							}

							if (callRecord.get('number', callNumber)) {
								
									if (callRecord.getValue('state') == 3) {
										var calendarId = callRecord.getValue('u_calendar_event_id');
										gs.info("[Call Management] calendarId from widget : "+calendarId);
										calendarApi.deleteEvent(calendarId);
									}
								
									callRecord.setValue('state', 6); 
									callRecord.setValue('u_reason_to_reject_close', cancelReason);		
									
									callRecord.update();
								
							} else {
									gs.error("No call record found for call number: " + callNumber);
							}						
				}

    }
})();

