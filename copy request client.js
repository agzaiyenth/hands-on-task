api.controller = function ($scope, $rootScope) {
  var c = this;

  // Initialize startTimes array with 1 empty time slot
  c.startTimes = [{ time: "", index: 0 }];

  c.formVisible = false;
  c.reasonVisible = true;
  c.acceptTrigger = false;
  c.loading = false;
  c.timeOptions = [];
  c.finalTimes = [];
  var params = new URLSearchParams(window.location.search);
  var caseSysId = params.get('sys_id');

  // Open call form when trigger is received
  $rootScope.$on("triggerOpenCallForm", function (event, data) {
    if (data.triggerType == "acceptTrigger") {
      console.log("Accept trigger received for call number:", data.callNumber);
      c.acceptTrigger = true;
			
			// fetch the meeting duration
			c.server.get({
				callNumber: data.callNumber,
				acceptTrigger: c.acceptTrigger
			}).then(function (response) {
				if (response.data.duration) {
					c.meetingDuration = response.data.duration;
					console.log("Meeting duration fetched:", c.meetingDuration);
				} else {
					console.log("No meeting duration found.");
				}
			});
			
    }
    c.reasonVisible = false;
    c.callNumber = data.callNumber;
    c.openCallForm();
  });

  // Add new start time slot (max 3)
  c.addStartTime = function (index) {
    if (c.startTimes.length < 3) {
      c.startTimes.push({ time: "", index: index });
    }
  };

  // Fetch calculated cut-off time from server-side
  c.getCalculatedCutOffTime = function () {
    c.loading = true;
    var ga = new GlideAjax("CutOffTimeGeneration");
    ga.addParam("sysparm_name", "calculateCutOffTime");
    ga.addParam("sysparm_sysId", caseSysId);
    ga.getXMLAnswer(function (response) {
      c.data.localTime = response;
      cutOffTime = c.data.localTime;
      c.loading = false;
      c.openModal();
      c.earliestStartTime = new Date(cutOffTime); // Set earliest time for validation
      console.log("Earliest Start Time:", c.earliestStartTime);

      // Update Flatpickr minDate dynamically if already initialized
      updateFlatpickrMinDate(c.earliestStartTime);
    });
  };

  // Function to initialize Flatpickr dynamically
  function initializeFlatpickr() {
    setTimeout(function () {
      // Apply Flatpickr to all inputs with id starting with "datetimepicker"
      var inputs = document.querySelectorAll('[id^="datetimepicker"]');
      for (var i = 0; i < inputs.length; i++) {
        if (!inputs[i]._flatpickr) {
          flatpickr(inputs[i], {
            enableTime: true,
            dateFormat: "m/d/Y H:i:S",
            time_24hr: true,
            minuteIncrement: 15,
            //static: true,
            minDate: c.earliestStartTime || null, // Set minDate if available
          });
        }
      }
    }, 0);
  }

  // Load Flatpickr script and initialize
  $.getScript("https://cdn.jsdelivr.net/npm/flatpickr", function () {
    initializeFlatpickr();
  });

  // Watch for changes in startTimes array to reinitialize Flatpickr
  $scope.$watchCollection(
    function () {
      return c.startTimes;
    },
    function () {
      initializeFlatpickr();
    }
  );

  function updateFlatpickrMinDate(minDate) {
    var inputs = document.querySelectorAll('[id^="datetimepicker"]');
    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i]._flatpickr) {
        // Check if Flatpickr instance exists
        inputs[i]._flatpickr.set("minDate", minDate);
      }
    }
  }

  // Open modal for the call form
  c.openModal = function () {
    angular.element("#callRequestForm").modal("show");
  };

  // Submit the form data to the server
	c.submitForm = function () {
		
		console.log("Start Times : ",c.startTimes);

    // Include finalTimes in data sent to the server
    c.data.reason = c.reason;
    c.data.startTimesLength = c.startTimes.length;
    c.data.finalTimes = c.startTimes;
    c.data.duration = c.duration;
    c.data.sysId = caseSysId;
    c.data.reasonVisible = c.reasonVisible;
    c.data.acceptTrigger = c.acceptTrigger;
    c.data.callNumber = c.callNumber;

    // Send data to the server
    c.server
        .update({})
        .then(function (response) {
            $rootScope.$broadcast("refreshWidget");
            c.reasonVisible = true;
            c.acceptTrigger = false;
        });

    angular.element("#callRequestForm").modal("hide");
	};
	
  // Cancel the form and reset fields
  c.cancel = function () {
    c.startTimes = [{ time: "", index: 0 }];
    c.reasonVisible = true;
    c.acceptTrigger = false;
    angular.element("#callRequestForm").modal("hide");
  };

  // Open the call form when the modal is triggered
  c.openCallForm = function () {
    c.resetFormFields();
    c.formVisible = true;
    c.getCalculatedCutOffTime();
  };

  // Reset form fields
  c.resetFormFields = function () {
    c.reason = "";
    c.duration = "30";
    c.loading = false;
    c.startTimes = [{ time: "", index: 0 }];
  };
};
