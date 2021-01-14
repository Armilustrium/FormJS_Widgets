/**
 * developed by pedro.carmo @ Armilustrium
 */
export function initMap(Survey) {
var widgetMap = {
    //the widget name. It should be unique and written in lowcase.
    name: "readcoordinatesmapcadastro",
    //the widget title. It is how it will appear on the toolbox of the SurveyJS Editor/Builder
    title: "Map get Coords Cadastro",
    //the name of the icon on the toolbox. We will leave it empty to use the standard one
    iconName: "",
    //If the widgets depends on third-party library(s) then here you may check if this library(s) is loaded
    widgetIsLoaded: function () {
        //return typeof $ == "function" && !!$.fn.select2; //return true if jQuery and select2 widget are loaded on the page
        return true; //we do not require anything so we just return true. 
    },
    //SurveyJS library calls this function for every question to check, if it should use this widget instead of default rendering/behavior
    isFit: function (question) {
        //we return true if the type of question is readcoordinatesmapcadastro
        return question.getType() === 'readcoordinatesmapcadastro';
        //the following code will activate the widget for a text question with inputType equals to date
        //return question.getType() === 'text' && question.inputType === "date";
    },
    //Use this function to create a new class or add new properties or remove unneeded properties from your widget
    //activatedBy tells how your widget has been activated by: property, type or customType
    //property - it means that it will activated if a property of the existing question type is set to particular value, for example inputType = "date" 
    //type - you are changing the behaviour of entire question type. For example render radiogroup question differently, have a fancy radio buttons
    //customType - you are creating a new type, like in our example "readcoordinatesmapcadastro"
    activatedByChanged: function (activatedBy) {
        //we do not need to check acticatedBy parameter, since we will use our widget for customType only
        //We are creating a new class and derived it from text question type. It means that text model (properties and fuctions) will be available to us
        Survey.JsonObject.metaData.addClass("readcoordinatesmapcadastro", [], null, "text");
        //signaturepad is derived from "empty" class - basic question class
        //Survey.JsonObject.metaData.addClass("signaturepad", [], null, "empty");
  
        //Add new property(s)
        //For more information go to https://surveyjs.io/Examples/Builder/?id=addproperties#content-docs
        Survey.JsonObject.metaData.addProperties("readcoordinatesmapcadastro", [
            { name: "buttonText", default: "Abrir Mapa" },
            { name: "buttonCloseText", default: "Fechar Mapa" },
        ]);
    },
    //If you want to use the default question rendering then set this property to true. We do not need any default rendering, we will use our our htmlTemplate
    isDefaultRender: false,
    //You should use it if your set the isDefaultRender to false
    htmlTemplate: "<div><input style='display: none;' /><span></span><button></button><button style='display:none;'></button><div id='map-surveyjs-response' style='display:none;'></div></div>",
    //The main function, rendering and two-way binding
    afterRender: function (question, el) {

        //el is our root element in htmlTemplate, is "div" in our case
        //get the text element
        var text = el.getElementsByTagName("input")[0];
        //set some properties
        text.inputType = question.inputType;
        text.placeholder = question.placeHolder;
        //get button and set some rpoeprties
        var button = el.getElementsByTagName("button")[0];
        button.innerText = question.buttonText;
        
        //get button and set some rpoeprties
        var buttonClose = el.getElementsByTagName("button")[1];
        buttonClose.innerText = question.buttonCloseText;
        
        // buttonClose.setAttribute("style", question.style);
        
        var span = el.getElementsByTagName("span")[0];
        
        var divMap = el.querySelector("#map-surveyjs-response");

        // surveyJSWidgetreadcoordinatesmapcadastro.loadImagesFromJson(el, question);

        // var img = el.getElementsByTagName("img")[0];
        // img.src = question.value;
        
        // var divimg = el.querySelector(".images-surveyjs-response");

        // var jsonImages = [];
        // if(question.value != '' && question.value != undefined){
        //     jsonImages = JSON.parse(question.value);         
        //     for(var i in jsonImages){
        //         let img = document.createElement('img');
        //         img.src = jsonImages[i];
        //         divimg.appendChild(img);        
        //     }
        // }

        button.onclick = function () {
           
            console.log('entrei no click');
            
            button.setAttribute("style", "display:none;");
            buttonClose.setAttribute("style", "display:block;");
            divMap.setAttribute("style", "display:block; width: 100%; height: 500px;");
            let map = new L.map(divMap);

            var coords = {
                lat: 41.25386,
                lng: -8.54539
            }

            // get coords
            navigator.geolocation.getCurrentPosition(function(location) {
                coords.lat = location.coords.latitude;
                coords.lng = location.coords.longitude;		
            });	

            // define view
            map.setView([coords.lat, coords.lng], 13);

            // mutants
            var mutHybrid = L.gridLayer.googleMutant({
                type: 'hybrid',	// valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
                maxZoom: 20
            });
            // mutHybrid.addTo(map);
            var mutRoad = L.gridLayer.googleMutant({
                type: 'roadmap',	// valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
                maxZoom: 20
            });
            mutRoad.addTo(map);


            var control = {
                Rua: mutRoad,
                Hibrido: mutHybrid 
            };            		
            L.control.layers(control, {}, {
                position: 'bottomright'
                // collapsed: false
            }).addTo(map);

            // ???
            map.zoomControl.setPosition('bottomleft');

            // botao de fullscreen
            // L.Control.Fullscreen().addTo(map);
            
            // botao de localizacao
            var lc = L.control.locate({
                position: 'topright',
                strings: {
                    title: "Show me where I am, yo!"
                },
                locateOptions: {
                    maxZoom: 17,
                    enableHighAccuracy: true
    
                },
                keepCurrentZoomLevel: false,
                flyTo: true
            }).addTo(map);

            let markerCreatedByClick;

            if( question.value != undefined){
                coords = JSON.parse(question.value);
            }


            // shadow icon
            var myIcon = new L.Icon.Default();
            myIcon.options.shadowSize = [0,0];
            
            
            markerCreatedByClick = new L.marker(coords, {icon: myIcon}).addTo(map);
            if(!question.isReadOnly){
                question.value =  JSON.stringify(markerCreatedByClick.getLatLng());
                
                map.on('click', function (e) {
                    if(markerCreatedByClick){
                        this.removeLayer(markerCreatedByClick);
                    }
                    markerCreatedByClick = new L.marker(e.latlng, {icon: myIcon}).addTo(this);
                        
                    question.value =  JSON.stringify(markerCreatedByClick.getLatLng());
                        
                    // var latLngs = [ markerCreatedByClick.getLatLng() ];
                    // var markerBounds = L.latLngBounds(latLngs);
                    
                    // this.fitBounds(		
                        //     markerBounds
                        // );
                });
            }

           
            // map.toggleFullscreen() // Either go fullscreen, or cancel the existing fullscreen.

            // camera.openCamera(this,
            //     function(image){

            //         if(question.value != '' && question.value != undefined){
            //            var jsonImages = JSON.parse(question.value);
            //            jsonImages.push(image);
            //         } else {
            //             var jsonImages = [image];
            //         }
            //         question.value = JSON.stringify(jsonImages); 

            //         // question.value = image;
            //         // img.src = image; 
            //         let img = document.createElement('img');
            //         img.src = image;
            //         divimg.appendChild(img);  


            //         // surveyJSWidgetreadcoordinatesmapcadastro.addPhoto(el, image);

            //     },
            //     function () { 

            //     })
            // question.value = "You have clicked me";
            buttonClose.onclick = function () {
                button.setAttribute("style", "display:block;");
                buttonClose.setAttribute("style", "display:none;");
                divMap.setAttribute("style", "display:none;");
                map.remove();          
                map = null;          
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
            let showResponse = (text.value != '' ? text.value : 'Nenhum objecto selecionado.');

            try{
                showResponse = (question.value.properties.name != undefined ? question.value.properties.name : '');
            }catch(e){
                
            }
            span.innerHtml = showResponse;

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
  Survey.CustomWidgetCollection.Instance.addCustomWidget(widgetMap, "customtype");
}