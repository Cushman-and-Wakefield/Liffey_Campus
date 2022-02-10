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
    "esri/tasks/support/Query",

    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/on",
    "dojo/dom",

    "c-through/support/applyRenderer",
    "c-through/support/queryTools"

], function (
    declare, Query,
    domCtr, win, on, dom,
    applyRenderer, queryTools
) {
        return {

            createChartData: function (selection, settings, bins) {

                this.selection = selection;

                var chartData = [];
                var kernel = [];
                var totalrange = [];

                if (bins > selection.length) {
                    bins = selection.length - 1;
                }

                for (var j = 0; j < selection.length; j++) {
                    totalrange.push(selection[j].attributes[settings.areaname]);
                }

                function maxIterate(arr) {
                    var max = arr[0];
                    for (var i = 0; i < arr.length; i++) {
                        if (arr[i] > max) {
                            max = arr[i];
                        }
                    }
                    return max;
                }

                function minIterate(arr, max) {
                    var min = max;
                    for (var i = 0; i < arr.length; i++) {
                        if (arr[i] < min) {
                            min = arr[i];
                        }
                    }
                    return min;
                }

                var max = maxIterate(totalrange);
                var min = minIterate(totalrange, max);

                if (Math.round(min) === 1) {
                    min = 0;
                }

                var kernelwidth = (max - min) / bins;

                if (kernelwidth > 1000) {
                    kernelwidth = 500 * Math.round(kernelwidth / 500);
                }
                else if (kernelwidth < 1000 && kernelwidth > 500) {
                    kernelwidth = 250 * Math.round(kernelwidth / 250);
                }
                else if (kernelwidth < 500 && kernelwidth > 200) {
                    kernelwidth = 100 * Math.round(kernelwidth / 100);
                }
                else if (kernelwidth < 200 && kernelwidth > 100) {
                    kernelwidth = 50 * Math.round(kernelwidth / 50);
                }
                else if (kernelwidth < 100 && kernelwidth > 50) {
                    kernelwidth = 10 * Math.round(kernelwidth / 10);
                }
                else if (kernelwidth < 50 && kernelwidth > 10) {
                    kernelwidth = 5 * Math.round(kernelwidth / 5);
                }
                else {
                    kernelwidth = Math.round(kernelwidth);
                }

                min = kernelwidth * Math.round(min / kernelwidth);

                var bins_new = (max - min) / kernelwidth;

                // set up bins with ranges
                for (var n = 0; n < bins_new; n++) {
                    kernel.push({
                        min: min,
                        max: min + kernelwidth
                    });
                    min += kernelwidth;
                }

                var color = [];

                if (bins_new > 9) {
                    color = ["#003A49", "#00545d", "#0d6e6c", "#348975", "#5F7C61", "#7E9169", "#5da379", "#8cbc7b", "#c1d37f", "#fbe789"];

                }
                else {
                    color = ["#003A49", "#00545d", "#0d6e6c", "#8cbc7b", "#c1d37f", "#fbe789"];
                }



                for (var i = 0; i < kernel.length; i++) {
                    chartData.push({
                        kernel: Math.round(kernel[i].min) + "m2 - " + Math.round(kernel[i].max) + "m2",
                        count: 0,
                        subdata: [
                            { min: kernel[i].min, max: kernel[i].max }
                        ],
                        "color": color[i]
                    });
                }

                for (var k = 0; k < totalrange.length; k++) {
                    for (var m = 0; m < kernel.length; m++) {
                        if (totalrange[k] > kernel[m].min && totalrange[k] <= kernel[m].max) {
                            chartData[m].count += 1;
                        }
                    }
                }

                return chartData;
            },


            createChart: function (selection, data, settings, state, view, callback) {

                var chart = AmCharts.makeChart("chartDiv", {
                    "type": "serial",
                    "theme": "light",
                    "hideCredits":true,
                    "sequencedAnimation": false,
                    "dataProvider": data,
                    "fontSize": 12,
                    "fontFamily": "Avenir LT W01 65 Medium",
                    "valueAxes": [{
                        "gridColor": "#FFFFFF",
                        "gridAlpha": 0.2,
                        "dashLength": 0
                    }],
                    "gridAboveGraphs": true,
                    "startDuration": 1,
                    "graphs": [{
                        "balloonText": "[[category]]: <b>[[value]]</b>",
                        "fillAlphas": 0.8,
                        "lineAlpha": 0,
                        "fillColorsField": "color",
                        "type": "column",
                        "valueField": "count"
                    }],
                    "chartCursor": {
                        "categoryBalloonEnabled": false,
                        "cursorAlpha": 0,
                        "zoomable": false
                    },
                    "categoryField": "kernel",
                    "categoryAxis": {
                        "gridPosition": "start",
                        "labelRotation": 45,
                        "gridAlpha": 0,
                        "tickPosition": "start",
                        "tickLength": 20
                    },
                    "export": {
                        "enabled": true
                    }

                });

                callback("loaded");

                chart.addListener("clickGraphItem", function (event) {

                    var max = event.item.dataContext.subdata[0].max;
                    var min = event.item.dataContext.subdata[0].min;
                    var color = event.item.dataContext.color;

                    settings.layer1.renderer = applyRenderer.createRendererVVbar(min, max, color, settings.areaname);
                    
                    view.environment.lighting.directShadowsEnabled = false;
                    view.environment.lighting.ambientOcclusionEnabled = false;
                });

                on(dom.byId("reload"), "click", function (event) {

                    settings.layer1.renderer = applyRenderer.createRendererVV(selection, settings.areaname);
                    
                    view.environment.lighting.directShadowsEnabled = true;
                    view.environment.lighting.ambientOcclusionEnabled = true;
                });

            },
         
            createChart_small: function (selection, data, settings, state, view, callback) {

                var chart = AmCharts.makeChart("chartDiv", {
                    "type": "serial",
                    "theme": "light",
                    "hideCredits":true,
                    "sequencedAnimation": false,
                    "dataProvider": data,
                    "fontSize": 7,
                    "fontFamily": "Avenir LT W01 65 Medium",
                    "valueAxes": [{
                        "gridColor": "#FFFFFF",
                        "gridAlpha": 0.2,
                        "dashLength": 0
                    }],
                    "gridAboveGraphs": true,
                    "startDuration": 1,
                    "graphs": [{
                        "balloonText": "[[category]]: <b>[[value]]</b>",
                        "fillAlphas": 0.8,
                        "lineAlpha": 0,
                        "fillColorsField": "color",
                        "type": "column",
                        "valueField": "count"
                    }],
                    "chartCursor": {
                        "categoryBalloonEnabled": false,
                        "cursorAlpha": 0,
                        "zoomable": false
                    },
                    "categoryField": "kernel",
                    "categoryAxis": {
                        "gridPosition": "start",
                        "labelRotation": 45,
                        "gridAlpha": 0,
                        "tickPosition": "start",
                        "tickLength": 15
                    },
                    "export": {
                        "enabled": true
                    }

                });

                callback("loaded");

                chart.addListener("clickGraphItem", function (event) {

                    var max = event.item.dataContext.subdata[0].max;
                    var min = event.item.dataContext.subdata[0].min;
                    var color = event.item.dataContext.color;

                    settings.layer1.renderer = applyRenderer.createRendererVVbar(min, max, color, settings.areaname);
                    
                    //view.environment.lighting.directShadowsEnabled = false;
                    //view.environment.lighting.ambientOcclusionEnabled = false;
                });

                on(dom.byId("reload"), "click", function (event) {

                    settings.layer1.renderer = applyRenderer.createRendererVV(selection, settings.areaname);
                    
                    view.environment.lighting.directShadowsEnabled = true;
                    view.environment.lighting.ambientOcclusionEnabled = true;
                });

            },
         //For Lease Expiry Date
            createChartData_exp: function (selection, settings, bins) {
                
                this.selection = selection;

                var chartData = [];
                var year = [];
                var totalobjects = [];
                var totalrange = [];
             
                 for (var j = 0; j < selection.length; j++) {
                    //totalrange.push(selection[j].attributes[settings.leaseexpiryname]);
                    totalobjects.push({'key': selection[j].attributes[settings.tenancyname], 'value': selection[j].attributes[settings.leaseexpiryname]});
                }
                const filterUnwanted = (arr) => {
                  const required = arr.filter(el => {
                     return el.value;
                  });
                  return required;
                };
                totalobjects = filterUnwanted(totalobjects);
               
                totalobjects = [...new Map(totalobjects.map(obj => [JSON.stringify(obj), obj])).values()];
             
                totalrange = totalobjects.map(a => a.value);

                function onlyUnique(value, index, self) {
                     return self.indexOf(value) === index;
                }
                var unique_years = [];
                unique_years = totalrange.filter(onlyUnique);
             
                unique_years = unique_years.filter(function(value, index, arr){ 
                       return value != null;
                   });
             
                unique_years.sort(function (a, b) { return a - b; });
             
                var bins_new = unique_years.length;
             
                var color = [];

                if (bins_new > 9) {
                    //color = ["#003A49", "#00545d", "#0d6e6c", "#348975", "#5F7C61", "#7E9169", "#5da379", "#8cbc7b", "#c1d37f", "#fbe789"];
                      color = ["#003a49","#44869c", "#134c5d","#549ab3", "#245e71","#64afca", "#347286", "#7E99AA", "#75c4e1", "#86daf9"];

                }
                else {
                    color = ["#003a49","#44869c", "#134c5d","#549ab3", "#245e71", "#86daf9"];
                }
             
                for (var i = 0; i < unique_years.length; i++) {
                    chartData.push({
                        year: unique_years[i],
                        count: 0,
                        "color": color[i]
                    });
                }

                for (var k = 0; k < totalrange.length; k++) {
                    for (var m = 0; m < unique_years.length; m++) {
                        if (totalrange[k] == unique_years[m]) {
                            chartData[m].count += 1;
                        }
                    }
                }
                return chartData;
            },


            createChart_exp: function (selection, data, settings, state, view, callback) {

                var chart = AmCharts.makeChart("chartDiv", {
                    "type": "serial",
                    "theme": "light",
                    "hideCredits":true,
                    "sequencedAnimation": false,
                    "dataProvider": data,
                    "fontSize": 12,
                    "fontFamily": "Avenir LT W01 65 Medium",
                    "valueAxes": [{
                        "gridColor": "#FFFFFF",
                        "gridAlpha": 0.2,
                        "dashLength": 0
                    }],
                    "gridAboveGraphs": true,
                    "startDuration": 1,
                    "graphs": [{
                        "balloonText": "[[category]]: <b>[[value]]</b>",
                        "fillAlphas": 0.8,
                        "lineAlpha": 0,
                        "fillColorsField": "color",
                        "type": "column",
                        "valueField": "count"
                    }],
                    "chartCursor": {
                        "categoryBalloonEnabled": false,
                        "cursorAlpha": 0,
                        "zoomable": false
                    },
                    "categoryField": "year",
                    "categoryAxis": {
                        "gridPosition": "start",
                        "labelRotation": 45,
                        "gridAlpha": 0,
                        "tickPosition": "start",
                        "tickLength": 15
                    },
                    "export": {
                        "enabled": true
                    }

                });

                callback("loaded");

                chart.addListener("clickGraphItem", function (event) {

                    var year = event.item.dataContext.year;
                    var color = event.item.dataContext.color;

                    settings.layer1.renderer = applyRenderer.createRendererVVbar_exp(year, color, settings.leaseexpiryname);
                 
                    view.environment.lighting.directShadowsEnabled = false;
                    view.environment.lighting.ambientOcclusionEnabled = false;
                });

                
            },
         
            createChart_exp_small: function (selection, data, settings, state, view, callback) {

                var chart = AmCharts.makeChart("chartDiv", {
                    "type": "serial",
                    "theme": "light",
                    "hideCredits":true,
                    "sequencedAnimation": false,
                    "dataProvider": data,
                    "fontSize": 7,
                    "fontFamily": "Avenir LT W01 65 Medium",
                    "valueAxes": [{
                        "gridColor": "#FFFFFF",
                        "gridAlpha": 0.2,
                        "dashLength": 0
                    }],
                    "gridAboveGraphs": true,
                    "startDuration": 1,
                    "graphs": [{
                        "balloonText": "[[category]]: <b>[[value]]</b>",
                        "fillAlphas": 0.8,
                        "lineAlpha": 0,
                        "fillColorsField": "color",
                        "type": "column",
                        "valueField": "count"
                    }],
                    "chartCursor": {
                        "categoryBalloonEnabled": false,
                        "cursorAlpha": 0,
                        "zoomable": false
                    },
                    "categoryField": "year",
                    "categoryAxis": {
                        "gridPosition": "start",
                        "labelRotation": 45,
                        "gridAlpha": 0,
                        "tickPosition": "start",
                        "tickLength": 15
                    },
                    "export": {
                        "enabled": true
                    }

                });

                callback("loaded");

                chart.addListener("clickGraphItem", function (event) {

                    var year = event.item.dataContext.year;
                    var color = event.item.dataContext.color;

                    settings.layer1.renderer = applyRenderer.createRendererVVbar_exp(year, color, settings.leaseexpiryname);
                 
                    view.environment.lighting.directShadowsEnabled = false;
                    view.environment.lighting.ambientOcclusionEnabled = false;
                });

                
            },
         
            //For Review Date
            createChartData_rev: function (selection, settings, bins) {
                
                this.selection = selection;

                var chartData = [];
                var year = [];
                var totalobjects = [];
                var totalrange = [];
             
                 for (var j = 0; j < selection.length; j++) {
                    //totalrange.push(selection[j].attributes[settings.reviewdatename]);
                    totalobjects.push({'key': selection[j].attributes[settings.tenancyname], 'value': selection[j].attributes[settings.reviewdatename], 'type': selection[j].attributes[settings.reviewtypename]});
                }
                const filterUnwanted = (arr) => {
                  const required = arr.filter(el => {
                     return el.value;
                  });
                  return required;
                };
                totalobjects = filterUnwanted(totalobjects);
               
                totalobjects = [...new Map(totalobjects.map(obj => [JSON.stringify(obj), obj])).values()];
             
                totalrange = totalobjects.map(a => a.value);
             
                var totalreview = [];
                totalreview = totalobjects.map(a => a.type);
             
                function onlyUnique(value, index, self) {
                     return self.indexOf(value) === index;
                }
                var unique_years = [];
                unique_years = totalrange.filter(onlyUnique);
             
                unique_years = unique_years.filter(function(value, index, arr){ 
                       return value != null;
                   });
             
                unique_years.sort(function (a, b) { return a - b; });
             
                var bins_new = unique_years.length;
                
                //Add-on for stacked bar chart with review type
                //var totalreview = []
                /*for (var j = 0; j < selection.length; j++) {
                    totalreview.push(selection[j].attributes[settings.reviewtypename]);
                }*/
                
                var unique_types = [];
                unique_types = totalreview.filter(onlyUnique);
             
                unique_types = unique_types.filter(function(value, index, arr){ 
                       return value != null;
                   });
             
                unique_types.sort(function (a, b) { return a - b; });
             
                var color = [];

                if (bins_new > 9) {
                    //color = ["#003A49", "#00545d", "#0d6e6c", "#348975", "#5F7C61", "#7E9169", "#5da379", "#8cbc7b", "#c1d37f", "#fbe789"];
                      color = ["#003a49","#44869c", "#134c5d","#549ab3", "#245e71","#64afca", "#347286", "#7E99AA", "#75c4e1", "#86daf9"];

                }
                else {
                    color = ["#003a49","#44869c", "#134c5d","#549ab3", "#245e71", "#86daf9"];
                }
                    //color = ["#003A49", "#00545d", "#0d6e6c", "#8cbc7b", "#c1d37f", "#fbe789"];
               
             
                for (var i = 0; i < unique_years.length; i++) {
                         chartData.push({
                             "year": unique_years[i],
                             "CPI": 0,
                             "OMRV": 0,
                             "CPI_Cap_and_Collar": 0,
                             "color": color[i]
                          });
                }
             
                for (var k = 0; k < totalrange.length; k++) {
                    for (var m = 0; m < unique_years.length; m++) {
                          if ((totalrange[k] == unique_years[m]) && (totalreview[k] == "CPI")) {
                               chartData[m].CPI += 1;
                          }
                          else if ((totalrange[k] == unique_years[m]) && (totalreview[k] == "OMRV")) {
                               chartData[m].OMRV += 1;
                          }
                          else if ((totalrange[k] == unique_years[m]) && (totalreview[k] == "CPI Cap & Collar")) {
                              chartData[m].CPI_Cap_and_Collar += 1;
                         }
                    }
                }
                return chartData;
            },


            createChart_rev: function (selection, data, settings, state, view, callback) {

                var chart = AmCharts.makeChart("chartDiv", {
                    "type": "serial",
                    "hideCredits":true,
                    "theme": "light",
                    "legend": {
                        "horizontalGap": 12,
                        "maxColumns": 1,
                        "position": "right",
                        "useGraphSettings": true,
                        "markerSize": 12
                    },
                    "sequencedAnimation": false,
                    "dataProvider": data,
                    "fontSize": 12,
                    "fontFamily": "Avenir LT W01 65 Medium",
                    "valueAxes": [{
                        "stackType": "regular",
                        "gridColor": "#FFFFFF",
                        "gridAlpha": 0.2,
                        "dashLength": 0
                    }],
                    "gridAboveGraphs": true,
                    "startDuration": 1,
                    "graphs": [{
                        "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>[[value]]</b></span>",
                        "fillAlphas": 0.8,
                        "labelText": "[[value]]",
                        "lineAlpha": 0,
                        "title": "CPI",
                        "fillColors": "#003a49",
                        "type": "column",
                        "valueField": "CPI"
                    },
                       {
                        "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>[[value]]</b></span>",
                        "fillAlphas": 0.8,
                        "labelText": "[[value]]",
                        "lineAlpha": 0,
                        "title": "OMRV",
                        "fillColors": "#44869c",
                        "type": "column",
                        "valueField": "OMRV"
                    },
                       {
                        "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>[[value]]</b></span>",
                        "fillAlphas": 0.8,
                        "labelText": "[[value]]",
                        "lineAlpha": 0,
                        "title": "CPI Cap & Collar",
                        "fillColors": "#86daf9",
                        "type": "column",
                        "valueField": "CPI_Cap_and_Collar"
                    }],
                    "chartCursor": {
                        "categoryBalloonEnabled": false,
                        "cursorAlpha": 0,
                        "zoomable": false
                    },
                    "categoryField": "year",
                    "categoryAxis": {
                        "gridPosition": "start",
                        "labelRotation": 45,
                        "gridAlpha": 0,
                        "tickPosition": "start",
                        "tickLength": 15
                    },
                    "export": {
                        "enabled": true
                    }

                });

                callback("loaded");

                chart.addListener("clickGraphItem", function (event) {

                    var year = event.item.dataContext.year;
                    var CPI = event.item.dataContext.CPI;
                    var OMRV = event.item.dataContext.OMRV;
                    var CPI_Cap_and_Collar = event.item.dataContext.CPI_Cap_and_Collar;
                    var color = event.item.dataContext.color;

                    settings.layer1.renderer = applyRenderer.createRendererVVbar_exp(year, color, settings.reviewdatename);
                 
                    view.environment.lighting.directShadowsEnabled = false;
                    view.environment.lighting.ambientOcclusionEnabled = false;
                });

                
            },
         
            createChart_rev_small: function (selection, data, settings, state, view, callback) {

                var chart = AmCharts.makeChart("chartDiv", {
                    "type": "serial",
                    "hideCredits":true,
                    "theme": "light",
                    "legend": {
                        "horizontalGap": 7,
                        "maxColumns": 1,
                        "position": "right",
                        "useGraphSettings": true,
                        "markerSize": 7
                    },
                    "sequencedAnimation": false,
                    "dataProvider": data,
                    "fontSize": 7,
                    "fontFamily": "Avenir LT W01 65 Medium",
                    "valueAxes": [{
                        "stackType": "regular",
                        "gridColor": "#FFFFFF",
                        "gridAlpha": 0.2,
                        "dashLength": 0
                    }],
                    "gridAboveGraphs": true,
                    "startDuration": 1,
                    "graphs": [{
                        "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>[[value]]</b></span>",
                        "fillAlphas": 0.8,
                        "labelText": "[[value]]",
                        "lineAlpha": 0,
                        "title": "CPI",
                        "fillColors": "#003a49",
                        "type": "column",
                        "valueField": "CPI"
                    },
                       {
                        "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>[[value]]</b></span>",
                        "fillAlphas": 0.8,
                        "labelText": "[[value]]",
                        "lineAlpha": 0,
                        "title": "OMRV",
                        "fillColors": "#44869c",
                        "type": "column",
                        "valueField": "OMRV"
                    },
                       {
                        "balloonText": "<b>[[title]]</b><br><span style='font-size:14px'>[[category]]: <b>[[value]]</b></span>",
                        "fillAlphas": 0.8,
                        "labelText": "[[value]]",
                        "lineAlpha": 0,
                        "title": "CPI Cap & Collar",
                        "fillColors": "#86daf9",
                        "type": "column",
                        "valueField": "CPI_Cap_and_Collar"
                    }],
                    "chartCursor": {
                        "categoryBalloonEnabled": false,
                        "cursorAlpha": 0,
                        "zoomable": false
                    },
                    "categoryField": "year",
                    "categoryAxis": {
                        "gridPosition": "start",
                        "labelRotation": 45,
                        "gridAlpha": 0,
                        "tickPosition": "start",
                        "tickLength": 15
                    },
                    "export": {
                        "enabled": true
                    }

                });

                callback("loaded");

                chart.addListener("clickGraphItem", function (event) {

                    var year = event.item.dataContext.year;
                    var CPI = event.item.dataContext.CPI;
                    var OMRV = event.item.dataContext.OMRV;
                    var CPI_Cap_and_Collar = event.item.dataContext.CPI_Cap_and_Collar;
                    var color = event.item.dataContext.color;

                    settings.layer1.renderer = applyRenderer.createRendererVVbar_exp(year, color, settings.reviewdatename);
                 
                    view.environment.lighting.directShadowsEnabled = false;
                    view.environment.lighting.ambientOcclusionEnabled = false;
                });

                
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
