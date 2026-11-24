$(function () {
    // Data now comes from the database (server.js + index.ejs).
    // This file only sets up the jQuery UI widgets.

    $("button").button();
    $("#dashboardTabs").tabs();
    $("#customerDate").datepicker();
    $("#accordion").accordion({ collapsible: true, heightStyle: "content" });

    $("#customerDialog").dialog({
        autoOpen: false,
        modal: true,
        width: 450,
        buttons: {
            "Create Customer": function () {
                var name = $("#customerName").val();
                var email = $("#customerEmail").val();
                if (!name || !email) {
                    alert("Please enter a name and email.");
                    return;
                }
                alert("Customer created: " + name);
                $(this).dialog("close");
            },
            "Cancel": function () {
                $(this).dialog("close");
            }
        }
    });

    $("#newCustomerButton").on("click", function () {
        $("#customerDialog").dialog("open");
    });
});