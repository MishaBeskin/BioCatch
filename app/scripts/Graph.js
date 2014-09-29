function getUserID(userName) {
    var finalUrl = 'https://api.stackexchange.com/2.2/users?order=desc&sort=name&inname=' + userName + '&site=stackoverflow';
    return $.getJSON(finalUrl, function (data) {
        try {
            var bestMachUserId = data.items[0].user_id;
            return bestMachUserId;
        } catch (err) {
            return undefined;
        }
    });
}

function getUserData(users) {
    var finalUrl = 'http://api.stackexchange.com/2.2/users/' + users.items[0].user_id + '?order=desc&sort=reputation&site=stackoverflow';
    return $.getJSON(finalUrl, function (data) {
        try {
            var bestMachUser = data.items[0];
            return bestMachUser;
        } catch (err) {
            return undefined;
        }
    });
}

function gotUserData(userData) {
    showUserData(userData)
};

function gotUserID(userID) {
    getUserData(userID);
};

function showUserData(userData) {
    var data = formatDataForGraph(userData.items[0]);
    drawGraph(data);
};

window.findUser = function findUser() {
    var userID = $('#username').val();
    getUserID(userID).done(gotUserID)
        .done(showUserData);
};

var diameter = 960,
    format = d3.format(",d"),
    color = d3.scale.category20c();

var bubble = d3.layout.pack()
    .sort(null)
    .size([diameter, diameter])
    .padding(1.5);

var svg = d3.select("#userData").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .attr("class", "bubble");

function formatDataForGraph(rawData) {
    var result = {
        "name": "flare",
        "children": [{
            "name": " Stack User",
            "children": []
        }]
    };

    var circles = [];

    for (record in rawData) {
        var oneCircleToAdd = {
            "name": record.replace('_', ' ').capitalize() + ' : ' + rawData[record],
            "size": rawData[record].length
        };
        circles.push(oneCircleToAdd);
    };

    result.children[0].children = circles;

    return result;
}



function drawGraph(root, error) {
    var node = svg.selectAll(".node")
        .data(bubble.nodes(classes(root))
        .filter(function (d) {
            return !d.children;
        }))
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

    node.append("title")
        .text(function (d) {
            return d.className + ": " + format(d.value);
        });

    node.append("circle")
        .attr("r", function (d) {
            return d.r;
        })
        .style("fill", function (d) {
            return color(d.packageName);
        });

    node.append("text")
        .attr("dy", ".3em")
        .style("text-anchor", "middle")
        .text(function (d) {
            return d.className.substring(0, d.r / 3);
        });
};


// Returns a flattened hierarchy containing all leaf nodes under the root.
function classes(root) {
    var classes = [];

    function recurse(name, node) {
        if (node.children) node.children.forEach(function (child) {
            recurse(node.name, child);
        });
        else classes.push({
            packageName: name,
            className: node.name,
            value: node.size
        });
    }

    recurse(null, root);
    return {
        children: classes
    };
}

String.prototype.capitalize = function () {
    return this.replace(/(^|\s)([a-z])/g, function (m, p1, p2) { return p1 + p2.toUpperCase(); });
};
