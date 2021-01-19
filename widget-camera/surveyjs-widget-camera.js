/**
 * developed by pedro.carmo @ Armilustrium
 */

var widget = {
    //the widget name. It should be unique and written in lowcase.
    name: "capturefromcamera",
    //the widget title. It is how it will appear on the toolbox of the SurveyJS Editor/Builder
    title: "Capture pictures from camera on mobile",
    //the name of the icon on the toolbox. We will leave it empty to use the standard one
    iconName: "",
    //If the widgets depends on third-party library(s) then here you may check if this library(s) is loaded
    widgetIsLoaded: function () {
        //return typeof $ == "function" && !!$.fn.select2; //return true if jQuery and select2 widget are loaded on the page
        return true; //we do not require anything so we just return true. 
    },
    //SurveyJS library calls this function for every question to check, if it should use this widget instead of default rendering/behavior
    isFit: function (question) {
        //we return true if the type of question is capturefromcamera
        return question.getType() === 'capturefromcamera';
        //the following code will activate the widget for a text question with inputType equals to date
        //return question.getType() === 'text' && question.inputType === "date";
    },
    //Use this function to create a new class or add new properties or remove unneeded properties from your widget
    //activatedBy tells how your widget has been activated by: property, type or customType
    //property - it means that it will activated if a property of the existing question type is set to particular value, for example inputType = "date" 
    //type - you are changing the behaviour of entire question type. For example render radiogroup question differently, have a fancy radio buttons
    //customType - you are creating a new type, like in our example "capturefromcamera"
    activatedByChanged: function (activatedBy) {
        //we do not need to check acticatedBy parameter, since we will use our widget for customType only
        //We are creating a new class and derived it from text question type. It means that text model (properties and fuctions) will be available to us
        Survey.JsonObject.metaData.addClass("capturefromcamera", [], null, "text");
        //signaturepad is derived from "empty" class - basic question class
        //Survey.JsonObject.metaData.addClass("signaturepad", [], null, "empty");
  
        //Add new property(s)
        //For more information go to https://surveyjs.io/Examples/Builder/?id=addproperties#content-docs
        Survey.JsonObject.metaData.addProperties("capturefromcamera", [
            { name: "buttonText", default: "Adicionar Fotografia" },
            { name: "buttonTextGaleria", default: "Adicionar da Galeria" },
            { name: "inputFileGaleria", default: "inputGaleria" }
        ]);
    },
    //If you want to use the default question rendering then set this property to true. We do not need any default rendering, we will use our our htmlTemplate
    isDefaultRender: false,
    //You should use it if your set the isDefaultRender to false
    htmlTemplate: "<div><input style='display:none;' /><input style='display:none' type='file' accept='image/*' /><button></button><button></button><div class='images-surveyjs-response'></div></div>",
    //The main function, rendering and two-way binding
    afterRender: function (question, el) {

        const filePrefixName = 'CameraImage_';

        //el is our root element in htmlTemplate, is "div" in our case
        //get the text element
        var text = el.getElementsByTagName("input")[0];
        //set some properties
        text.inputType = question.inputType;
        text.placeholder = question.placeHolder;

        var inputGaleria = el.getElementsByTagName("input")[1];
        //set some properties
        // text.inputType = question.inputType;
        // text.placeholder = question.placeHolder;

        //get button and set some rpoeprties
        var button = el.getElementsByTagName("button")[0];
        button.innerText = question.buttonText;

        //get button and set some rpoeprties
        var buttonGaleria = el.getElementsByTagName("button")[1];
        buttonGaleria.innerText = question.buttonTextGaleria;


        // surveyJSWidgetCaptureFromCamera.loadImagesFromJson(el, question);

        // var img = el.getElementsByTagName("img")[0];
        // img.src = question.value;
        
        var divimg = el.querySelector(".images-surveyjs-response");

        var jsonImages = [];
        if(question.value != '' && question.value != undefined){
            // jsonImages = JSON.parse(question.value);         
            jsonImages = question.value;         
            for(var i in jsonImages){
                let img = document.createElement('img');
                if(jsonImages[i].content === undefined){
                    img.src = jsonImages[i];
                } else {
                    img.src = jsonImages[i].content;
                }
                divimg.appendChild(img);        
            }
        }

        // camera button
        button.onclick = function () {
            try{

                camera.openCamera(this,
                    function(image){
                        
                    var lowerCase = image.toLowerCase();
                    if (lowerCase.indexOf("png") !== -1) extension = "png"
                    else if (lowerCase.indexOf("jpg") !== -1 || lowerCase.indexOf("jpeg") !== -1)
                        extension = "jpg"
                    else extension = "tiff";
    
                    let fileAs64 = {
                        name: `${filePrefixName}${Math.floor(Date.now() / 1000)}`,
                        type: `image/${extension}`,
                        content: image
                    }
    
                    if(question.value != '' && question.value != undefined){
                    //    var jsonImages = JSON.parse(question.value);
                       var jsonImages = question.value;


                       jsonImages.push(fileAs64);
                    } else {
                        var jsonImages = [fileAs64];
                    }
                    // question.value = JSON.stringify(jsonImages); 
                    question.value = jsonImages; 
                    
                    // question.value = image;
                    // img.src = image; 
                    let img = document.createElement('img');
                    img.src = image;
                    divimg.appendChild(img);  
                    
                    console.log(jsonImages);
                    // surveyJSWidgetCaptureFromCamera.addPhoto(el, image);
                    
                },
                function () { 
                    // question.value = 'fakephoto';
                })
            } catch(e){
                question.value = 'fakephoto';
            }
            // question.value = "You have clicked me";
        }


        // galeria click
        buttonGaleria.onclick = function(){
            inputGaleria.click();
        }
  

        inputGaleria.onchange = function(evt){

            const file = inputGaleria.files[0];
            const reader = new FileReader();
          
            // reader.addEventListener("load", function () {
            //   // converter o file de imagem oara uma string de base 64
            //   preview.src = reader.result;
            // }, false);
            

            reader.onload = function () {
                console.log(reader);
                // converter o file de imagem oara uma string de base 64
                let fileAs64Result = reader.result;

                var lowerCase = fileAs64Result.toLowerCase();
                if (lowerCase.indexOf("png") !== -1) extension = "png"
                else if (lowerCase.indexOf("jpg") !== -1 || lowerCase.indexOf("jpeg") !== -1)
                    extension = "jpg"
                else extension = "tiff";

                let fileAs64 = {
                    name: `${filePrefixName}${Math.floor(Date.now() / 1000)}`,
                    type: `image/${extension}`,
                    content: fileAs64Result
                }

                if(question.value != '' && question.value != undefined){
                    var jsonImages = JSON.parse(question.value);
                    jsonImages.push(fileAs64);
                } else {
                    var jsonImages = [fileAs64];
                }
                // question.value = JSON.stringify(jsonImages); 
                question.value = jsonImages; 
                
                // question.value = image;
                // img.src = image; 
                let img = document.createElement('img');
                img.src = fileAs64.content;
                divimg.appendChild(img);  
                console.log(jsonImages);

            }

          
            if (file) {
                let fileAs64 = reader.readAsDataURL(file);
            }


        }
        //set the changed value into question value
        // text.onchange = function () {
        //     // question.value = text.value;
        //     console.log('text.onchange');
        //     let img = document.createElement('img');
        //     img.src = image;
        //     divimg.appendChild(img);  

            
        // }
        var onValueChangedCallback = function () {
            console.log('onValueChangedCallback');
            text.value = question.value ? question.value : "";

        }
        var onReadOnlyChangedCallback = function() {
          if (question.isReadOnly) {
            text.setAttribute('disabled', 'disabled');
            button.setAttribute('disabled', 'disabled');
            buttonGaleria.setAttribute('disabled', 'disabled');
          } else {
            text.removeAttribute("disabled");
            button.removeAttribute("disabled");
            buttonGaleria.removeAttribute("disabled");
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

  var surveyJSWidgetCaptureFromCamera = {
      loadImagesFromJson: function(el, question){
            // var img = el.getElementsByTagName("img")[0];
            var divimg = el.querySelector("images-surveyjs-response");

            var jsonImages = [];
            if(question.value != ''){
                jsonImages = JSON.parse(question.value);         
                for(var i in jsonImages){
                    let img = document.createElement('img');
                    img.src = jsonImages[i];
                    divimg.appendChild(img);        
                    // img.src = question.value;
                }
            }
      },
      addPhoto: function(el, image){
            // var img = el.getElementsByTagName("img")[0];
            var divimg = el.querySelector("images-surveyjs-response");

            // var jsonImages = [];
            // if(question.value != ''){
            //     jsonImages = JSON.parse(question.value);         
            //     for(var i in jsonImages){
                    let img = document.createElement('img');
                    img.src = image;
                    divimg.appendChild(img);        
                    // img.src = question.value;
            //     }
            // }
      }
  }
  
  //Register our widget in singleton custom widget collection
  Survey.CustomWidgetCollection.Instance.addCustomWidget(widget, "customtype");
  