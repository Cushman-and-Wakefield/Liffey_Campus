 /* Copyright 2017 Esri

   Licensed under the Apache License, Version 2.0 (the "License");

   you may not use this file except in compliance with the License.

   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software

   distributed under the License is distributed on an "AS IS" BASIS,

   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

   See the License for the specific language governing permissions and

   limitations under the License.
   ​
   */

/*
 * Title: App Configuration Script
 * Author: Lisa Staehli
 * Date: 04/24/17
 * Description: Used to configure and link a webscene
 * with corresponding attributes for visualization
 * and statistics. A webscene with a scene service 
 * that contains the following required attributes on 
 * unit level for each feature needs to be set-up first: 
 * - building id (int)
 * - floor level (int)
 * - usage (string)
 * - area (float)
 */

define([
    "esri/core/declare",
    "esri/config",
    "esri/core/watchUtils",

    "esri/WebScene",
    "esri/views/SceneView",
    "esri/layers/SceneLayer",
    "esri/Basemap",

    "esri/widgets/BasemapToggle",
    "esri/widgets/Home",

    "dojo/dom",
    "dojo/on",
    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/dom-style",

    "esri/widgets/Search",

    "c-through/ToolsMenu",
    "c-through/welcome",
    "c-through/support/queryTools",
    "c-through/InfoWidget"

], function (
    declare, esriConfig, watchUtils,
    WebScene, SceneView, SceneLayer, Basemap,
    BasemapToggle, Home,
    dom, on, domCtr, win, domStyle,
    Search,
    ToolsMenu, Welcome, queryTools, InfoWidget) {

        // application settings
        var settings_demo = {
            name: "Demo",
            url: "https://cwireland.maps.arcgis.com",           // portal URL for config 
            //webscene: "dfdf7ab912d14d9d920db64cc9c7368f",   // portal item ID of the webscene
            webscene: "7c92b9e7312b4fae83b741d3b3c62cbe",
            usagename: "Use_",                             // usage attribute (string)
            tenancyname: "Tenant",                          // tenant names (string)
            floorname: "Floor1",                           // floor attribute (string)
            statusname: "Status",                           // status attribute like let, vacant etc. (string)
            leaseexpiryname: "Lease_Expiry_Year",                // lease expiry year attribute (int)
            reviewdatename: "Next_Review_Date_Year",        //review date year attribute (int)
            reviewtypename: "Review_Type",                  //review type attribute (string)
            OIDname: "OBJECTID",                            // objectid
            buildingIDname: "BuildID",                   // pat of building attribute (int)
            buildingname: "Building_No_",               // Whole Building Count (int)
            areaname: "sq_m",                           // area attribute (float)
            exactexpirydatename: "Lease_Expiry",        // whole lease expiry date for statistics part only (string)
            exactreviewdatename: "Next_Review_Date1",    // whole review date for statistics part only (string)
            color: [                                        // color ramp for unique value renderer
                    [141, 216, 243, 1],
                    [149, 208, 235, 1],
                    [160, 204, 224, 1],                     
                    [126, 153, 170, 1],
                    [117, 196, 225, 1],
                    [100, 175, 202, 1],
                    [84, 154, 179, 1],
                    [68, 134, 156, 1],
                    [52, 114, 134, 1],
                    [36, 94, 113, 1],
                    [19, 76, 93, 1],
                    [0, 58, 73, 1]
                ]
        };

        return declare(null, {

            constructor: function () {

            },

            init: function (settings) {

                // destroy welcome page when app is started
                domCtr.destroy("welcome");

                // create header with title according to choice on welcome page
                var header = domCtr.create("div", { id: "header" }, win.body());
                domCtr.create("div", { id: "headerTitle" }, header);

                // get settings from choice on welcome page
                this.settings = this.getSettingsFromUser(settings);

                // set portal url
                esriConfig.portalUrl = this.settings.url;

                // fix CORS issues by adding portal url to cors enabled servers list
                esriConfig.request.corsEnabledServers.push("http://zurich.maps.arcgis.com");

                // load scene with portal ID
                this.scene = new WebScene({
                    portalItem: {
                        id: this.settings.webscene
                    },
                    basemap: "gray-vector",
                    ground: "world-elevation"
                });

                // create a view
                this.view = new SceneView({
                    container: "viewDiv",
                    map: this.scene,
                    qualityProfile: "high"
                    
                });
             
                // environment settings for better visuals (shadows)
                this.view.environment.lighting.ambientOcclusionEnabled = true;
                this.view.environment.lighting.directShadowsEnabled = true;

                // create search widget
                /*var searchWidget = new Search({
                    view: this.view
                });
                this.view.ui.add(searchWidget, {
                    position: "top-right",
                    index: 2
                });*/

                // create home button that leads back to welcome page
                var home = domCtr.create("div", { className: "button", id: "homeButton", innerHTML: "Home" }, header);

                on(home, "click", function () {
                    var URI = window.location.href;
                    var newURI = URI.substring(0, URI.lastIndexOf("?"));
                    window.location.href = newURI;
                }.bind(this));

                // create home widget for scene view
                var homeWidget = new Home({
                    view: this.view
                });
                this.view.ui.add(homeWidget, "top-left");

                // wait until view is loaded
                this.view.when(function () {
                    // layer1 = active layer (receives renderers, used for statistics, selected)
                    // layer2 = background layer (shows remaining buildings, not selected)

                    // retrieve active layer from webscene
                    this.settings.layer1 = this.scene.layers.getItemAt(0);

                    // create background layer (identical copy of activ layer) for highlighting and add it to the scene
                    this.settings.layer2 = new SceneLayer({
                        url: this.settings.layer1.url,
                        popupEnabled: false
                    });
                    this.scene.add(this.settings.layer2);

                    this.settings.layer1.visible = true;
                    this.settings.layer2.visible = false;

                    this.view.popup = {
                      dockEnabled: true,
                      dockOptions: {
                        // Disables the dock button from the popup
                        buttonEnabled: false,
                        // Ignore the default sizes that trigger responsive docking
                        breakpoint: true
                      }
                    };
                 
                    this.settings.layer1.popupTemplate = {
                     title:  "<h6> Part of Building {Building_No_} </h6>",
                     content: `
                         <!-- Slider -->
                     <div id="slider">
                       <div class="slides">
                         <div class="slider">
                           <div class="image">
                             <img src="{Image}">
                           </div>
                         </div>
                         <div class="slider">
                           <div class="image">
                             <img src="{Image1}">
                           </div>
                         </div>
                        </div>
                         <div class="switch">
                         <ul>
                           <li>
                             <div class="on"></div>
                           </li>
                           <li></li>
                         </ul>
                       </div>
                     </div>
                     
                     <div class='info'>
                       <div id="leftie"><img src="img/tenant.png" title="Tenant Info"> {Tenant} </div>
                       <div id="rightie"><img src='img/usage.png' title="Usage"> {Use_} </div>
                       <div id="leftie"><img src="img/area.png" title="Area"> {sq_m} sqm </div>
                       <div id="rightie"><img src='img/floor.png' title="Floor"> {Floor} </div>
                     </div>
                     
                     <table class="styled-table">
                     <thead>
                         <tr>
                             <th>Variable</th>
                             <th>Value</th>
                         </tr>
                     </thead>
                     <tbody>
                         <tr>
                             <td>Passing Rent</td>
                             <td>{Passing_Rent}</td>
                         </tr>
                         <tr>
                             <td>Lease Expiry Date</td>
                             <td>{Lease_Expiry}</td>
                         </tr>
                         <tr>
                             <td>Next Review Date</td>
                             <td>{Next_Review_Date1}</td>
                         </tr>
                         <tr>
                             <td>Review Type</td>
                             <td>{Review_Type}</td>
                         </tr>
                          <tr>
                             <td>Term Commencement Date</td>
                             <td>{Term_Commencement_Date}</td>
                         </tr>
                         <tr>
                             <td>Option Date</td>
                             <td>{Option_Date}</td>
                         </tr>
                         <tr>
                             <td>Earliest Potential Available Date</td>
                             <td>{Earliest_Potential_Available_Da}</td>
                         </tr>
                         <tr>
                             <td>Notice Period</td>
                             <td>{Notice_Period}</td>
                         </tr>
                         
                         <!-- and so on... -->
                     </tbody>
                 </table>
                     `
                     };  
                 
                    // retrieve distinct values of usage attribute from feature service to create UI (filter dropdowns)
                    queryTools.distinctValues(this.settings.layer1, this.settings.usagename, this.settings.OIDname, function (distinctValues) {

                        distinctValues.sort();
                        this.settings.values = distinctValues;

                        // initiliaze tools menu with state
                        this.menu = new ToolsMenu({
                            config: this.settings,
                            map: this.scene,
                            view: this.view,
                            state: {
                                highlight: {
                                    name: "city",
                                    features: undefined
                                },
                                viz: {
                                    name: "white"
                                },
                                filter: {
                                    name: "none",
                                    usageFeatures: undefined,
                                    areaFeatures: undefined,
                                    floorFeatures: undefined,
                                    tenancyFeatures: undefined,
                                    statusFeatures: undefined
                                },
                                combinedFilteredFeatures: undefined
                            }
                        });
                     }.bind(this));
                     // retrieve distinct values of tenancy attribute from feature service to create UI (filter dropdowns)
                    queryTools.distinctValues_ten(this.settings.layer1, this.settings.tenancyname, this.settings.OIDname, function (distinctValues_ten) {

                        distinctValues_ten.sort();
                        this.settings.values_ten = distinctValues_ten;
                    }.bind(this));
                    

                }.bind(this)).otherwise(function (err) {
                    console.error(err);
                });

            },

            getSettingsFromUser: function (settings) {
                if (settings === "demo"){
                    dom.byId("headerTitle").innerHTML = "c-through Demo";
                    return settings_demo;
                }
            }
        });
    });




