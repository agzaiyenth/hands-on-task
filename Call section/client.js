api.controller = function($scope, $http, $rootScope) {
    var c = this;

    c.selectedCall = {};
    c.cancelReason = ""; 
		c.data.cancelReason = c.cancelReason;
		c.isSubmitting = false;
	
		var params = new URLSearchParams(window.location.search);
    var caseSysId = params.get('sys_id'); 

    c.data.parentSysId = caseSysId;  

    // Initial call to update the data on load
    c.server.update().then(function(response) {
        console.log("Initial data loaded");
    });
	
		var glideAjax = new GlideAjax('TimeZoneConversions2');

    // Function to open the cancel modal
    c.cancelCall = function(callNumber) {
        c.selectedCall.callNumber = callNumber;
        c.cancelReason = ""; 
				c.isSubmitting = false;
        angular.element('#cancelCallModal').modal('show');
    };

    // Function to open the cancel modal
    c.rejectRequest = function(callNumber) {
        c.selectedCall.callNumber = callNumber;
        c.cancelReason = ""; 
				c.isSubmitting = false;
        angular.element('#cancelCallModal').modal('show');
    };

    // Function to confirm the cancellation
    c.confirmCancellation = function() {
				if (c.isSubmitting) {
						return; // Prevent duplicate submissions
				}
        if (c.cancelReason) {
						console.log("Cancelling call:", c.selectedCall.callNumber);
            console.log("Cancellation reason:", c.cancelReason);
					
						c.data.callNumber = c.selectedCall.callNumber;
						c.data.cancelReason = c.cancelReason; 
					
						c.isSubmitting = true;
            c.closeCancelModal();						
						c.refreshData();
					
        } else {
            alert("Please provide a reason for cancellation.");
        }
    };

    // Function to close the cancel modal
    c.closeCancelModal = function() {
        angular.element('#cancelCallModal').modal('hide'); 
        c.cancelReason = "";
    };

    // Function to refresh the widget data
    c.refreshData = function() {
        c.server.update({ parentSysId: c.data.parentSysId}).then(function(response) {
						if(c.data.cancelReason) {
							c.data.cancelReason = "";
							c.refreshData();
						}
					
            console.log("Data refreshed successfully");
        });
    };

    // Listen for the custom event to refresh the widget
    $rootScope.$on('refreshWidget', function() {
        c.refreshData();
    });

    // Function to reschedule a call
    c.reschedule = function(callNumber) {
        $rootScope.$broadcast('triggerOpenCallForm4', { callNumber: callNumber,isReschedule:true });
    };
	
		// Function to reschedule a call
		c.acceptRequest = function(callNumber) {
			$rootScope.$broadcast('triggerOpenCallForm3', {
				triggerType: 'acceptTrigger1',
				callNumber: callNumber,
			});
		};
	
		c.openCallDetails = function(call) {
			
				var formattedStartTime = Array.isArray(call.startTimes) ? call.startTimes.join('\n') 
														: call.startTimes || "Not scheduled";

				c.selectedCall = {
					callNumber: call.callNumber,
					startTime: formattedStartTime,
					reason: call.reason || "No reason provided",
					status: call.status,
					state:call.stateread,
					statusColor: call.statusColor
				};
			
				if (call.status === "Scheduled" || call.status === "Notes Pending") {
					c.selectedCall.meetingLink = call.meetingLink || "No link provided";
				}
			
				angular.element('#callDetailsModal').modal('show');			
				
		};

    // Function to close the modal
    c.closeModal = function() {				
        angular.element('#callDetailsModal').modal('hide'); // Hide the modal
        c.selectedCall = {}; 
    };

    // Store the sys_id in the scope variable
    if (caseSysId) {
        console.log("Extracted case sys_id: " + c.data.parentSysId);
    } else {
        console.error("No sys_id found in URL.");
    }
	
};

