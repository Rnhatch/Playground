var BubbleChart, root;
var __bind = function(fn, me) { return function() { return fn.apply(me, arguments); }; };
BubbleChart = (function() {
    function BubbleChart(data) {
        this.hide_details = __bind(this.hide_details, this);
        this.show_details = __bind(this.show_details, this);
        this.hide_Months = __bind(this.hide_Months, this);
        this.display_Months = __bind(this.display_Months, this);
        this.move_towards_Month = __bind(this.move_towards_Month, this);
        this.display_by_Month = __bind(this.display_by_Month, this);
        this.move_towards_center = __bind(this.move_towards_center, this);
        this.display_group_all = __bind(this.display_group_all, this);
        this.start = __bind(this.start, this);
        this.create_vis = __bind(this.create_vis, this);
        this.create_nodes = __bind(this.create_nodes, this);
        var max_amount;
        this.data = data;
        this.width = 980;
        this.height = 700;
        this.tooltip = CustomTooltip("gates_tooltip", 240);
        this.center = {
            x: this.width / 2,
            y: this.height / 2
        };
        
        this.Month_centers = {
            "January": {
                x: (this.width / 12) * 3,
                y: this.height / 3
            },
            "February": {
                x: (this.width / 12) * 5,
                y: this.height / 3
            },
            "March": {
                x: (this.width / 12) * 7,
                y: this.height / 3
            },
            "April": {
                x: (this.width / 12) * 9,
                y: this.height / 3
            },
            "May": {
                x: (this.width / 12) * 3,
                y: this.height / 2
            },
            "June": {
                x: (this.width / 12) * 5,
                y: this.height / 2
            },
            "July": {
                x: (this.width / 12) * 7,
                y: this.height / 2
            },
            "August": {
                x: (this.width / 12) * 9,
                y: this.height / 2
            },
            "September": {
                x: (this.width / 12) * 3,
                y: (this.height / 3) * 2
            },
            "October": {
                x: (this.width / 12) * 5,
                y: (this.height / 3) * 2
            },
            "November": {
                x: (this.width / 12) * 7,
                y: (this.height / 3) * 2
            },
            "December": {
                x: (this.width / 12) * 9,
                y: (this.height / 3) * 2
            }

        };
        this.layout_gravity = -0.01;
        this.damper = 0.1;
        this.vis = null;
        this.nodes = [];
        this.force = null;
        this.circles = null;
        this.fill_color = d3.scale.ordinal().domain(["Pregnancy", "Musculoskeletal / ConnectiveTissue", "Injury / Poisoning"])
            .range(["#981C30",
		            "#989415",
		            "#1E4559",
		            "#7F7274",
		            "#4C4A12",
		            "#ffffff",
		            "#4B0612",
		            "#1EAAE4",
		            "#AD5E71",
		            "#000000"
        ]);
        
        max_amount = d3.max(this.data, function(d) {
            return parseInt(d.TotalPTD);
        });
        this.radius_scale = d3.scale.pow().exponent(0.5).domain([0, max_amount]).range([1, 30]);
        this.create_nodes();
        this.create_vis();
    }
    BubbleChart.prototype.create_nodes = function() {
        this.data.forEach(__bind(function(d) {
            var node;
            node = {
                CL_Number: d.CL_Number,
                radius: this.radius_scale(parseInt(d.TotalPTD)),
                TotalPTD: d.TotalPTD,
                group: d.group,
                Month: d.Month,
                x: Math.random() * 900,
                y: Math.random() * 800
            };
            return this.nodes.push(node);
        }, this));
        return this.nodes.sort(function(a, b) {
            return b.value - a.value;
        });
    };
    BubbleChart.prototype.create_vis = function() {
        var that;
        this.vis = d3.select("#vis").append("svg").attr("width", this.width).attr("height", this.height).attr("id", "svg_vis");
        this.circles = this.vis.selectAll("circle").data(this.nodes, function(d) {
            return d.CL_Number;
        });
        that = this;
        this.circles.enter().append("circle").attr("r", 0).attr("fill", __bind(function(d) {
            return this.fill_color(d.group);
        }, this)).attr("stroke-width", 2).attr("stroke", __bind(function(d) {
            return d3.rgb(this.fill_color(d.group)).darker();
        }, this)).attr("id", function(d) {
            return "bubble_" + d.id;
        }).on("mouseover", function(d, i) {
            return that.show_details(d, i, this);
        }).on("mouseout", function(d, i) {
            return that.hide_details(d, i, this);
        });
        return this.circles.transition().duration(2000).attr("r", function(d) {
            return d.radius;
        });
    };
    BubbleChart.prototype.charge = function(d) {
        return -Math.pow(d.radius, 2.0) / 8;
    };
    BubbleChart.prototype.start = function() {
        return this.force = d3.layout.force().nodes(this.nodes).size([this.width, this.height]);
    };
    BubbleChart.prototype.display_group_all = function() {
        this.force.gravity(this.layout_gravity).charge(this.charge).friction(0.9).on("tick", __bind(function(e) {
            return this.circles.each(this.move_towards_center(e.alpha)).attr("cx", function(d) {
                return d.x;
            }).attr("cy", function(d) {
                return d.y;
            });
        }, this));
        this.force.start();
        return this.hide_Months();
    };
    BubbleChart.prototype.move_towards_center = function(alpha) {
        return __bind(function(d) {
            d.x = d.x + (this.center.x - d.x) * (this.damper + 0.02) * alpha;
            return d.y = d.y + (this.center.y - d.y) * (this.damper + 0.02) * alpha;
        }, this);
    };

    //where year to Month conversion starts

    BubbleChart.prototype.display_by_Month = function() {
        this.force.gravity(this.layout_gravity).charge(this.charge).friction(0.9).on("tick", __bind(function(e) {
            return this.circles.each(this.move_towards_Month(e.alpha)).attr("cx", function(d) {
                return d.x;
            }).attr("cy", function(d) {
                return d.y;
            });
        }, this));
        this.force.start();
        return this.display_Months();
    };
    BubbleChart.prototype.move_towards_Month = function(alpha) {
        return __bind(function(d) {
            var target;
            target = this.Month_centers[d.Month];
            d.x = d.x + (target.x - d.x) * (this.damper + 0.02) * alpha * 1.1;
            return d.y = d.y + (target.y - d.y) * (this.damper + 0.02) * alpha * 1.1;
        }, this);
    };
    BubbleChart.prototype.display_Months = function() {
        var Months, Months_data, Months_x, Months_y;
        Months_x = {
            "January": 100,
            "February": 376,
            "March": 600,
            "April": 800,
            "May": 100,
            "June": 376,
            "July": 600,
            "August": 800,
            "September": 100,
            "October": 376,
            "November": 600,
            "December": 800

        };
        Months_y = {
            "January": 40,
            "February": 40,
            "March": 40,
            "April": 40,
            "May": 275,
            "June": 275,
            "July": 275,
            "August": 275,
            "September": 500,
            "October": 500,
            "November": 500,
            "December": 500

        };
        
        Months_data = d3.keys(Months_x);
        Months = this.vis.selectAll(".Months").data(Months_data);
        return Months.enter().append("text").attr("class", "years").attr("x", __bind(function(d) {
            return Months_x[d];
        }, this)).attr("y", __bind(function(d) {
            return Months_y[d];
        }, this)).attr("text-anchor", "middle").text(function(d) {
            return d;
        });
    };
    BubbleChart.prototype.hide_Months = function() {
        var Months;
        return Months = this.vis.selectAll(".years").remove();
    };
    
    
    //end of Month code - start of tooltip code
    
    BubbleChart.prototype.show_details = function(data, i, element) {
        var content;
        d3.select(element).attr("stroke", "black");
        content = "<span class=\"name\">Claim Number:</span><span class=\"value\"> " + data.CL_Number + "</span><br/>";
        content += "<span class=\"name\">Amount:</span><span class=\"value\"> $" + (addCommas(data.TotalPTD)) + "</span><br/>";
        content += "<span class=\"name\">Month:</span><span class=\"value\"> " + data.Month + "</span><br/>";
        content += "<span class=\"name\">Cagetory:</span><span class=\"value\"> " + data.group + "</span>";
        return this.tooltip.showTooltip(content, d3.event);
    };
    BubbleChart.prototype.hide_details = function(data, i, element) {
        d3.select(element).attr("stroke", __bind(function(d) {
            return d3.rgb(this.fill_color(d.group)).darker();
        }, this));
        return this.tooltip.hideTooltip();
    };
    return BubbleChart;
})();
root = typeof exports !== "undefined" && exports !== null ? exports : this;
$(function() {
    var chart, render_vis;
    chart = null;
    render_vis = function(csv) {
        chart = new BubbleChart(csv);
        chart.start();
        return root.display_all();
    };
    root.display_all = __bind(function() {
        return chart.display_group_all();
    }, this);
    root.display_Month = __bind(function() {
        return chart.display_by_Month();
    }, this);
    root.toggle_view = __bind(function(view_type) {
        if (view_type === 'Month') {
            return root.display_Month();
        } else {
            return root.display_all();
        }
    }, this);
    return d3.csv("data/claims.csv", render_vis);
});