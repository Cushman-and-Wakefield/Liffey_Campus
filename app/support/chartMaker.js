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

define([
    "esri/core/declare",

    "dojo/dom-construct",
    "dojo/_base/window",

    "c-through/support/applyRenderer"

], function (
    declare,
    domCtr, win,
    applyRenderer
) {
        return {

            createChartData: function (selection, settings) {

                var color = this.rgbToHex(settings.color);

                var chartData = [];

                for (var j = 0; j < settings.values.length; j++) {
                    chartData.push({
                        usage: settings.values[j],
                        area: 0,
                        color: color[j]
                    });
                }
                for (var k = 0; k < selection.length; k++) {
                    var selectionusage = selection[k].attributes[settings.usagename];
                    var selectionarea = selection[k].attributes[settings.areaname];
                    for (var m = 0; m < chartData.length; m++) {
                        if (selectionusage === chartData[m].usage) {
                            chartData[m].area += selectionarea;
                        }
                    }
                }

                for (var i = 0; i < chartData.length; i++) {
                    chartData[i].area = Math.round(chartData[i].area);
                }
             
                chartData.sort((a, b) => {
                    return b.area - a.area;
                });
             
                return chartData;
            },
         
            createChartData_ten: function (selection, settings) {

                   var color = this.rgbToHex(settings.color);

                   var chartData_ten = [];

                   for (var j = 0; j < settings.values_ten.length; j++) {
                       chartData_ten.push({
                           tenancy: settings.values_ten[j],
                           area: 0,
                           color: color[j]
                       });
                   }
                   for (var k = 0; k < selection.length; k++) {
                       var selectiontenancy = selection[k].attributes[settings.tenancyname];
                       var selectionarea = selection[k].attributes[settings.areaname];
                       for (var m = 0; m < chartData_ten.length; m++) {
                           if (selectiontenancy === chartData_ten[m].tenancy) {
                               chartData_ten[m].area += selectionarea;
                           }
                       }
                   }

                   for (var i = 0; i < chartData_ten.length; i++) {
                       chartData_ten[i].area = Math.round(chartData_ten[i].area);
                   }
             
                   chartData_ten.sort((a, b) => {
                    return b.area - a.area;
                   });
             
                   return chartData_ten;
               },


            createChart: function (view, data, settings, state, callback) {

                var color = this.rgbToHex(settings.color);

                var groupPercentValue = 0;

                if (settings.name !== "Zurich") {
                    groupPercentValue = "0";
                }

                var chart = AmCharts.makeChart("chartDiv", {
                    "type": "pie",
                    "theme": "light",
                    "hideCredits":true,
                    "dataProvider": data,
                    "valueField": "area",
                    "titleField": "usage",
                    "colorField": "color",
                    "groupPercent": groupPercentValue,
                    "startRadius": 100,
                    "fontSize": 12,
                    "fontFamily": "Avenir LT W01 65 Medium",
                    "radius": 100,
                    "marginTop": 80,
                    "pieAlpha": 1,
                    "sequencedAnimation": true,
                    "balloon": {
                        "fixedPosition": true
                    },
                    "clickSlice": function (dataItem, event) {

                        var value = dataItem.title;

                        var fields = [];
                        for (var i = 0; i < settings.values.length; i++) {
                            fields.push({
                                values: settings.values[i],
                                color: [135, 135, 135, 0.2]
                            });
                        }

                        for (var j = 0; j < fields.length; j++) {
                            if (fields[j].values === value) {
                                fields[j].color = color[j];
                            }
                        }

                        var selectedvalues = [];
                        var selectedcolor = [];

                        for (var k = 0; k < fields.length; k++) {
                            selectedvalues.push(fields[k].values);
                            selectedcolor.push(fields[k].color);
                        }


                        if (dataItem.pulled) {
                            chart.pullSlice(dataItem, 0);
 
                            settings.layer1.renderer = applyRenderer.createRenderer(settings.values, settings.color, settings.usagename);
                            
                            view.environment.lighting.directShadowsEnabled = true;
                            view.environment.lighting.ambientOcclusionEnabled = true;

                        } else {
                            chart.pullSlice(dataItem, 1);

                            settings.layer1.renderer = applyRenderer.createRenderer(selectedvalues, selectedcolor, settings.usagename);
                            
                            view.environment.lighting.directShadowsEnabled = false;
                            view.environment.lighting.ambientOcclusionEnabled = false;
                        }

                    }.bind(this),
                    "export": {
                        "enabled": true
                    }
                });

                callback("loaded");

            },
         
            createChart_small: function (view, data, settings, state, callback) {

                var color = this.rgbToHex(settings.color);

                var groupPercentValue = 0;

                if (settings.name !== "Zurich") {
                    groupPercentValue = "0";
                }

                var chart = AmCharts.makeChart("chartDiv", {
                    "type": "pie",
                    "theme": "light",
                    "hideCredits":true,
                    "dataProvider": data,
                    "valueField": "area",
                    "titleField": "usage",
                    "colorField": "color",
                    "groupPercent": groupPercentValue,
                    "startRadius": 100,
                    "fontSize": 7,
                    "fontFamily": "Avenir LT W01 65 Medium",
                    "radius": 40,
                    "marginTop": 60,
                    "pieAlpha": 1,
                    "sequencedAnimation": true,
                    "balloon": {
                        "fixedPosition": true
                    },
                    "clickSlice": function (dataItem, event) {

                        var value = dataItem.title;

                        var fields = [];
                        for (var i = 0; i < settings.values.length; i++) {
                            fields.push({
                                values: settings.values[i],
                                color: [135, 135, 135, 0.2]
                            });
                        }

                        for (var j = 0; j < fields.length; j++) {
                            if (fields[j].values === value) {
                                fields[j].color = color[j];
                            }
                        }

                        var selectedvalues = [];
                        var selectedcolor = [];

                        for (var k = 0; k < fields.length; k++) {
                            selectedvalues.push(fields[k].values);
                            selectedcolor.push(fields[k].color);
                        }


                        if (dataItem.pulled) {
                            chart.pullSlice(dataItem, 0);
 
                            settings.layer1.renderer = applyRenderer.createRenderer(settings.values, settings.color, settings.usagename);
                            
                            view.environment.lighting.directShadowsEnabled = true;
                            view.environment.lighting.ambientOcclusionEnabled = true;

                        } else {
                            chart.pullSlice(dataItem, 1);

                            settings.layer1.renderer = applyRenderer.createRenderer(selectedvalues, selectedcolor, settings.usagename);
                            
                            view.environment.lighting.directShadowsEnabled = false;
                            view.environment.lighting.ambientOcclusionEnabled = false;
                        }

                    }.bind(this),
                    "export": {
                        "enabled": true
                    }
                });

                callback("loaded");

            },
         
            createChart_ten: function (view, data, settings, state, callback) {

                var color = this.rgbToHex(settings.color);

                var groupPercentValue = 0;

                if (settings.name !== "Zurich") {
                    groupPercentValue = "0";
                }

                var chart = AmCharts.makeChart("chartDiv", {
                    "type": "pie",
                    "theme": "light",
                    "hideCredits":true,
                    "dataProvider": data,
                    "valueField": "area",
                    "titleField": "tenancy",
                    "colorField": "color",
                    "groupPercent": groupPercentValue,
                    "startRadius": 100,
                    "fontSize": 12,
                    "fontFamily": "Avenir LT W01 65 Medium",
                    "radius": 100,
                    "marginTop": 80,
                    "pieAlpha": 1,
                    "sequencedAnimation": true,
                    "balloon": {
                        "fixedPosition": true
                    },
                    "clickSlice": function (dataItem, event) {

                        var value_ten = dataItem.title;

                        var fields = [];
                        for (var i = 0; i < settings.values_ten.length; i++) {
                            fields.push({
                                values_ten: settings.values_ten[i],
                                color: [135, 135, 135, 0.2]
                            });
                        }

                        for (var j = 0; j < fields.length; j++) {
                            if (fields[j].values_ten === value_ten) {
                                fields[j].color = color[j];
                            }
                        }

                        var selectedvalues_ten = [];
                        var selectedcolor = [];

                        for (var k = 0; k < fields.length; k++) {
                            selectedvalues_ten.push(fields[k].values_ten);
                            selectedcolor.push(fields[k].color);
                        }


                        if (dataItem.pulled) {
                            chart.pullSlice(dataItem, 0);
 
                            settings.layer1.renderer = applyRenderer.createRenderer(settings.values_ten, settings.color, settings.tenancyname);
                            
                            view.environment.lighting.directShadowsEnabled = true;
                            view.environment.lighting.ambientOcclusionEnabled = true;

                        } else {
                            chart.pullSlice(dataItem, 1);

                            settings.layer1.renderer = applyRenderer.createRenderer(selectedvalues_ten, selectedcolor, settings.tenancyname);
                            
                            view.environment.lighting.directShadowsEnabled = false;
                            view.environment.lighting.ambientOcclusionEnabled = false;
                        }

                    }.bind(this),
                    "export": {
                        "enabled": true
                    }
                });

                callback("loaded");

            },
         
            createChart_ten_small: function (view, data, settings, state, callback) {

                var color = this.rgbToHex(settings.color);

                var groupPercentValue = 0;

                if (settings.name !== "Zurich") {
                    groupPercentValue = "0";
                }

                var chart = AmCharts.makeChart("chartDiv", {
                    "type": "pie",
                    "theme": "light",
                    "hideCredits":true,
                    "dataProvider": data,
                    "valueField": "area",
                    "titleField": "tenancy",
                    "colorField": "color",
                    "groupPercent": groupPercentValue,
                    "startRadius": 100,
                    "fontSize": 7,
                    "fontFamily": "Avenir LT W01 65 Medium",
                    "radius": 40,
                    "marginTop": 60,
                    "pieAlpha": 1,
                    "sequencedAnimation": true,
                    "balloon": {
                        "fixedPosition": true
                    },
                    "clickSlice": function (dataItem, event) {

                        var value_ten = dataItem.title;

                        var fields = [];
                        for (var i = 0; i < settings.values_ten.length; i++) {
                            fields.push({
                                values_ten: settings.values_ten[i],
                                color: [135, 135, 135, 0.2]
                            });
                        }

                        for (var j = 0; j < fields.length; j++) {
                            if (fields[j].values_ten === value_ten) {
                                fields[j].color = color[j];
                            }
                        }

                        var selectedvalues_ten = [];
                        var selectedcolor = [];

                        for (var k = 0; k < fields.length; k++) {
                            selectedvalues_ten.push(fields[k].values_ten);
                            selectedcolor.push(fields[k].color);
                        }


                        if (dataItem.pulled) {
                            chart.pullSlice(dataItem, 0);
 
                            settings.layer1.renderer = applyRenderer.createRenderer(settings.values_ten, settings.color, settings.tenancyname);
                            
                            view.environment.lighting.directShadowsEnabled = true;
                            view.environment.lighting.ambientOcclusionEnabled = true;

                        } else {
                            chart.pullSlice(dataItem, 1);

                            settings.layer1.renderer = applyRenderer.createRenderer(selectedvalues_ten, selectedcolor, settings.tenancyname);
                            
                            view.environment.lighting.directShadowsEnabled = false;
                            view.environment.lighting.ambientOcclusionEnabled = false;
                        }

                    }.bind(this),
                    "export": {
                        "enabled": true
                    }
                });

                callback("loaded");

            },

            rgbToHex: function (color) {

                var colorhex = [];

                for (var i = 0; i < color.length; i++) {
                    var r = color[i][0];
                    var g = color[i][1];
                    var b = color[i][2];

                    var hex = "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);

                    colorhex.push(hex);
                }

                return colorhex;
            },

            componentToHex: function (c) {
                var hex = c.toString(16);
                return hex.length == 1 ? "0" + hex : hex;
            }
        };
    });
