/**
 * developed by pedro.carmo @ Armilustrium
 */

var widgetCoords = {
    //the widget name. It should be unique and written in lowcase.
    name: "readcoordinates",
    //the widget title. It is how it will appear on the toolbox of the SurveyJS Editor/Builder
    title: "Read coordinates and set to input",
    //the name of the icon on the toolbox. We will leave it empty to use the standard one
    iconName: "",
    //If the widgets depends on third-party library(s) then here you may check if this library(s) is loaded
    widgetIsLoaded: function () {
        //return typeof $ == "function" && !!$.fn.select2; //return true if jQuery and select2 widget are loaded on the page
        return true; //we do not require anything so we just return true. 
    },
    //SurveyJS library calls this function for every question to check, if it should use this widget instead of default rendering/behavior
    isFit: function (question) {
        //we return true if the type of question is readcoordinates
        return question.getType() === 'readcoordinates';
        //the following code will activate the widget for a text question with inputType equals to date
        //return question.getType() === 'text' && question.inputType === "date";
    },
    //Use this function to create a new class or add new properties or remove unneeded properties from your widget
    //activatedBy tells how your widget has been activated by: property, type or customType
    //property - it means that it will activated if a property of the existing question type is set to particular value, for example inputType = "date" 
    //type - you are changing the behaviour of entire question type. For example render radiogroup question differently, have a fancy radio buttons
    //customType - you are creating a new type, like in our example "readcoordinates"
    activatedByChanged: function (activatedBy) {
        //we do not need to check acticatedBy parameter, since we will use our widget for customType only
        //We are creating a new class and derived it from text question type. It means that text model (properties and fuctions) will be available to us
        Survey.JsonObject.metaData.addClass("readcoordinates", [], null, "text");
        //signaturepad is derived from "empty" class - basic question class
        //Survey.JsonObject.metaData.addClass("signaturepad", [], null, "empty");
  

        // navigator.geolocation.getCurrentPosition(
        //     function(pos){
        //         // clearTimeout(gpsTimeout);
        //         Survey.JsonObject.metaData.addProperties("readcoordinates", [
        //             { name: "inputText", value: `${pos.coords.latitude}, ${pos.coords.longitude}`}
        //         ]);
        //         // scb(pos.coords.latitude,pos.coords.longitude);
        //     },
        //     function (error) {  
        //         Survey.JsonObject.metaData.addProperties("readcoordinates", [
        //             { name: "inputText", value: `Erro ao ler as coordenadas`}
        //         ]);

        //     }
        // );

        //Add new property(s)
        //For more information go to https://surveyjs.io/Examples/Builder/?id=addproperties#content-docs
        Survey.JsonObject.metaData.addProperties("readcoordinates", [
            { name: "loadingText", default: "A carregar..." }
        ]);

        // buscar as coordenadas
    },
    //If you want to use the default question rendering then set this property to true. We do not need any default rendering, we will use our our htmlTemplate
    isDefaultRender: false,
    //You should use it if your set the isDefaultRender to false
    htmlTemplate: "<div><input /></div>",
    //The main function, rendering and two-way binding
    afterRender: function (question, el) {
        //el is our root element in htmlTemplate, is "div" in our case
        //get the text element
        var text = el.getElementsByTagName("input")[0];
        //set some properties
        text.inputType = question.inputType;
        text.placeholder = question.placeHolder;
        text.value = question.loadingText;
        text.setAttribute('disabled', 'disabled');

        var messageErrorGPS = 'Erro ao ler as coordenadas';
        navigator.geolocation.getCurrentPosition(
            function(pos){

                if(question.value == undefined || question.value == '' || question.value == messageErrorGPS){
                    question.value = `${pos.coords.latitude}, ${pos.coords.longitude}`;
                }
            },
            function (error) {  
                if(question.value == undefined || question.value == ''){
                    question.value = messageErrorGPS;
                }
            }
        );

        //get button and set some rpoeprties
        // var button = el.getElementsByTagName("button")[0];
        // button.innerText = question.buttonText;


        // surveyJSWidgetreadcoordinates.loadImagesFromJson(el, question);

        // var img = el.getElementsByTagName("img")[0];
        // img.src = question.value;
        
  
        //set the changed value into question value
        // text.onchange = function () {
        //     // question.value = text.value;
        //     console.log('text.onchange');
        //     let img = document.createElement('img');
        //     img.src = image;
        //     divimg.appendChild(img);  

            
        // }
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
  Survey.CustomWidgetCollection.Instance.addCustomWidget(widgetCoords, "customtype");
  