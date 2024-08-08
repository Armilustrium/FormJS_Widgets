
/**
 * developed by pedro.carmo @ Armilustrium
 */

export function initQRCode(SurveyVue) {
var widgetQR = {
    //the widget name. It should be unique and written in lowcase.
    name: "capturefromqr",
    //the widget title. It is how it will appear on the toolbox of the SurveyJS Editor/Builder
    title: "Capture QR Codes and Serial Numbers from camera on mobile",
    //the name of the icon on the toolbox. We will leave it empty to use the standard one
    iconName: "icon-imagepicker",
    //If the widgets depends on third-party library(s) then here you may check if this library(s) is loaded
    widgetIsLoaded: function () {
        //return typeof $ == "function" && !!$.fn.select2; //return true if jQuery and select2 widget are loaded on the page
        return true; //we do not require anything so we just return true. 
    },
    //SurveyJS library calls this function for every question to check, if it should use this widget instead of default rendering/behavior
    isFit: function (question) {
        //we return true if the type of question is capturefromqr
        return question.getType() === 'capturefromqr';
        //the following code will activate the widget for a text question with inputType equals to date
        //return question.getType() === 'text' && question.inputType === "date";
    },
    //Use this function to create a new class or add new properties or remove unneeded properties from your widget
    //activatedBy tells how your widget has been activated by: property, type or customType
    //property - it means that it will activated if a property of the existing question type is set to particular value, for example inputType = "date" 
    //type - you are changing the behaviour of entire question type. For example render radiogroup question differently, have a fancy radio buttons
    //customType - you are creating a new type, like in our example "capturefromqr"
    activatedByChanged: function (activatedBy) {
        //we do not need to check acticatedBy parameter, since we will use our widget for customType only
        //We are creating a new class and derived it from text question type. It means that text model (properties and fuctions) will be available to us
        SurveyVue.JsonObject.metaData.addClass("capturefromqr", [], null, "text");
        //signaturepad is derived from "empty" class - basic question class
        //SurveyVue.JsonObject.metaData.addClass("signaturepad", [], null, "empty");
  
        //Add new property(s)
        //For more information go to https://surveyjs.io/Examples/Builder/?id=addproperties#content-docs
        SurveyVue.JsonObject.metaData.addProperties("capturefromqr", [
            { name: "buttonText", default: "Ler QR Code / Serial Number" }
        ]);
    },
    //If you want to use the default question rendering then set this property to true. We do not need any default rendering, we will use our our htmlTemplate
    isDefaultRender: false,
    //You should use it if your set the isDefaultRender to false
    htmlTemplate: "<div><input type='comment'/><button></button><div class='images-surveyjs-response'></div></div>",
    //The main function, rendering and two-way binding
    afterRender: function (question, el) {
        //el is our root element in htmlTemplate, is "div" in our case
        //get the text element
        var text = el.getElementsByTagName("input")[0];
        //set some properties
        text.inputType = question.inputType;
        text.placeholder = question.placeHolder;
        text.value = '';
        //get button and set some rpoeprties
        var button = el.getElementsByTagName("button")[0];
        button.innerText = question.buttonText;

        // Event listener for the button to handle QR code scanning
        button.onclick = function () {
            // Use the Cordova plugin to scan a barcode
            cordova.plugins.barcodeScanner.scan(
                function (result) {
                    // Check if the scan was not cancelled
                    if (!result.cancelled) {
                        try {
                            // Function to check if a string is valid JSON
                            function isValidJSONString(str) {
                                try {
                                    JSON.parse(str);
                                } catch (e) {
                                    return false;
                                }
                                return true;
                            }

                            // Trim any whitespace from the input text
                            let rawInput = result.text.trim();

                            // Handle different input formats
                            if (isValidJSONString(rawInput)) {
                                // If the input is valid JSON, parse it
                                let payload = JSON.parse(rawInput);

                                // Check if the parsed JSON contains a serial number
                                if (typeof payload === 'object' && payload.serialNumber) {
                                    // Set the question value to the serial number
                                    question.value = payload.serialNumber;
                                } else {
                                    // If no serial number, use the raw input
                                    question.value = rawInput;
                                }
                            } else {
                                // If the input is not JSON, use it directly as the serial number
                                question.value = rawInput;
                            }
                        } catch (error) {
                            // Handle any errors that occur during parsing
                            console.error("Error parsing JSON:", error);
                            swal({
                                type: "error",
                                title: "Impossível ler código",
                                text: "Tente novamente.",
                            });
                        }
                    } else {
                        // Notify the user if the scan was cancelled
                        swal("Leitura cancelada.");
                    }
                },
                function (error) {
                    // Handle any errors that occur during the scan
                    console.error("Scanner error:", error);
                    swal({
                        type: "error",
                        title: "Impossível ler código",
                        text: "Tente novamente.",
                    });
                }
            );
        };                     

        var onValueChangedCallback = function () {
            text.value = question.value ? question.value : "";
        }
        var onReadOnlyChangedCallback = function() {
            if (question.isReadOnly) {
                text.setAttribute('disabled', 'disabled');
                // button.setAttribute('disabled', 'disabled');
              } else {
                text.removeAttribute("disabled");
                // button.removeAttribute("disabled");
              }
        };
        //if question becomes readonly/enabled add/remove disabled attribute
        question.readOnlyChangedCallback = onReadOnlyChangedCallback;
        //if the question value changed in the code, for example you have changed it in JavaScript
        question.valueChangedCallback = onValueChangedCallback;
        //set initial value
        onValueChangedCallback();
        //make elements disabled if needed
        onReadOnlyChangedCallback();
  
    },
    //Use it to destroy the widget. It is typically needed by jQuery widgets
    willUnmount: function (question, el) {
        //We do not need to clear anything in our simple example
        //Here is the example to destroy the image picker
        //var $el = $(el).find("select");
        //$el.data('picker').destroy();
    }
  }
  
  //Register our widget in singleton custom widget collection
  SurveyVue.CustomWidgetCollection.Instance.addCustomWidget(widgetQR, "customtype");
}