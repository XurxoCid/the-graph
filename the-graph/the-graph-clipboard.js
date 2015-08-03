/**
 * Created by mpricope on 05.09.14.
 */

(function (context) {
  "use strict";
  var TheGraph = context.TheGraph;

  TheGraph.Clipboard = {};
  var clipboardContent = {};

  var cloneObject = function (obj) {
    return JSON.parse(JSON.stringify(obj));
  };

  var makeNewId = function (label) {
    var num = 60466176; // 36^5
    num = Math.floor(Math.random() * num);
    var id = label + '_' + num.toString(36);
    return id;
  };

  TheGraph.Clipboard.copy = function (graph, keys) {
    clipboardContent = {nodes:[], edges:[]};
    var map = {};
    var i, len;
    for (i = 0, len = keys.length; i < len; i++) {
      var node = graph.getNode(keys[i]);
      var newNode = cloneObject(node);
      newNode.id = makeNewId(node.component);
      clipboardContent.nodes.push(newNode);
      map[node.id] = newNode.id;
    }
    for (i = 0, len = graph.edges.length; i < len; i++) {
      var edge = graph.edges[i];
      var fromNode = edge.from.node;
      var toNode = edge.to.node;
      if (map.hasOwnProperty(fromNode) && map.hasOwnProperty(toNode)) {
        var newEdge = cloneObject(edge);
        newEdge.from.node = map[fromNode];
        newEdge.to.node = map[toNode];
        clipboardContent.edges.push(newEdge);
      }
    }
  };

  TheGraph.Clipboard.paste = function (graph) {
    var map = {};
    var pasted = {nodes:[], edges:[]};
    var i, len;
    for (i = 0, len = clipboardContent.nodes.length; i < len; i++) {
      var node = clipboardContent.nodes[i];
      var meta = cloneObject(node.metadata);
      meta.x += 36;
      meta.y += 36;
      var newNode = graph.addNode(makeNewId(node.component), node.component, meta);
      map[node.id] = newNode.id;
      pasted.nodes.push(newNode);
    }
    for (i = 0, len = clipboardContent.edges.length; i < len; i++) {
      var edge = clipboardContent.edges[i];
      var newEdgeMeta = cloneObject(edge.metadata);
      var newEdge;
      if (edge.from.hasOwnProperty('index') || edge.to.hasOwnProperty('index')) {
        // One or both ports are addressable
        var fromIndex = edge.from.index || null;
        var toIndex = edge.to.index || null;
        newEdge = graph.addEdgeIndex(map[edge.from.node], edge.from.port, fromIndex, map[edge.to.node], edge.to.port, toIndex, newEdgeMeta);
      } else {
        newEdge = graph.addEdge(map[edge.from.node], edge.from.port, map[edge.to.node], edge.to.port, newEdgeMeta);
      }
      pasted.edges.push(newEdge);
    }
    return pasted;
  };

  TheGraph.Clipboard.displayMenu =  function(graph, node) {

    $('#modalForm').empty();
    if ( isNaN(node.component.substring(node.component.length-2,node.component.length)) ) {
        name = node.component;
    } else {
        name = node.component.substring(0,node.component.length-2);
    };

    var requireAjaxRequest = [
      "ddi", "schedule", "ivr", "device", "user",
      "queue", "voicemail", "playback", "script", "conference",
    ];

    if (requireAjaxRequest.indexOf(name)>= 0) {
      $.ajax({
        url: "/webadmin/inroutes/components/"+name+"s/",
        type : "GET",
        dataType: "json",
        data : {
          csrfmiddlewaretoken: $.cookie('csrftoken'),
          current_tenant: localStorage.getItem("current_tenant"),
        }
      })
      .done(function( data, textStatus, jqXHR){
          var panel = createForm(node, data, editor);
          $('#modalTitle').html(panel.title);
          $('#modalForm').append(panel.content);
          activateEvents(node, data);
          $('#myModal').modal('toggle');
          $('#saveNode').off();
          $('#saveNode').click(function() {
            saveForm(node, editor);
            editor.rerender();
            $('#myModal').modal('toggle');
          });
      })
      .fail(function( jqXHR, textStatus, errorThrown){
        console.log('ERROR');
      });

    } else {

      var panel = createForm(node, null, editor);
      $('#modalTitle').html(panel.title);
      $('#modalForm').append(panel.content);
      activateEvents(node, null);
      $('#myModal').modal('toggle');
      $('#saveNode').off();
      $('#saveNode').click(function() {
        saveForm(node, editor);
        editor.rerender();
        $('#myModal').modal('toggle');
      });

    };


  };


})(this);
