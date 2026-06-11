// === Schematic Constants ===

JXG.Options.line.strokeColor = 'black';
JXG.Options.segment.strokeColor = 'black';
JXG.Options.arrow.strokeColor = 'black';
JXG.Options.circle.strokeColor = 'black'; 
JXG.Options.polygon.strokeColor = 'black';
JXG.Options.polygon.borders.strokeColor = 'black';
JXG.Options.polygon.borders.strokewidth = 2;

const R_height = 0.15;   //Höhe von R
const R_width = 0.44;  // Breite von R
const V_radius = 0.18;
const circle_arrow_offset = 0.08;
const circle_arrow_extend = 0.1;
const label_fontsize_default = 12;
const value_fontsize_default = 12;



const SI_prefix = [
{ power: 0, symbol: '' },
{ power: 3, symbol: 'k' },
{ power: 6, symbol: 'M' },
{ power: -1, symbol: 'd' },
{ power: -2, symbol: 'c' },
{ power: -3, symbol: 'm' },
{ power: -6, symbol: 'μ' },
{ power: -9, symbol: 'n' },
{ power: -12, symbol: 'p' },
]

// === DrawGrid ===

function drawGrid(nodes_rows = 4, nodes_columns = 4){

    board = JXG.JSXGraph.initBoard('box', {
    boundingbox: [0, nodes_rows + 1, nodes_columns + 1, 0],
    axis: false,
    grid: false,
    showNavigation: true,
    showCopyright: true
  });
}


//=== DrawNetwork ===

function drawNetwork(edgeList){
  edgeList.forEach(edge => {
    drawEdge(edge);
  });

}

// === DrawEdge ===

function drawEdge(edge){
    
    // read edge type, default w=wire

    let type = edge.type || 'W';
 
    // read coordinates, from 1 to 2
    let x1= edge.x1;
    let y1= edge.y1;
    let x2= edge.x2;
    let y2= edge.y2;




    // compute transformation matrix to move structure to coordinates 

    let rot_angle = JXG.Math.Geometry.rad([x1+1,y1],[x1, y1],[x2, y2]);
    let M_rotation = board.create('transform', [rot_angle, [0, 0]], {type: 'rotate'});
    let M_translation = board.create('transform', [x1,y1], {type: 'translate'});
    let M_transform = M_rotation.melt(M_translation);
    let e_length = JXG.Math.Geometry.distance([x1, y1],[x2,y2]); // edge length, Länge der Verbindung
    let R_wire = (e_length-R_width)/2; // Länge des Kabels, wire

    // read general variables for labels
    
    let label_fontSize = edge.label_fontSize || label_fontsize_default;
    let value = edge.value_re || 0; // Widerstandswert oder 0 falls leer
    let unit = edge.unit || '\Omega';
    let prefix = edge.prefix || 0;
    let show_label = edge.show_label !== false; //ist default true
    let show_value = edge.show_value === true; // ist default false
    let value_factor = JXG.Math.pow(10,prefix);
    let SI = SI_prefix.find(entry=>entry.power ===prefix)|| SI_prefix[0];


    // === Call Functions for Edge Type ===
    
    switch(type){
        
        case 'W':
        drawW(edge);
        break;

        case 'R':
        drawR(edge);
        break;

        case 'V':
        drawV(edge);
        break;


        case 'I':
        drawI(edge);
        break;


        case 'L':
        drawL(edge);
        break;


        case 'C':
        drawC(edge);
        break;

    }
}


//=== Sub Functions to Draw Edge Type ===
// Wire
function drawW(edge){

    // read edge characteristics
    let x1= edge.x1;
    let y1= edge.y1;
    let x2= edge.x2;
    let y2= edge.y2;

    // draw edge

    board.create('segment', [[x1, y1], [x2, y2]]);

}      


function drawR(edge){
    
    // === Draw Structure === 
    // declare variables


    // read edge characteristics
    let x1= edge.x1;
    let y1= edge.y1;
    let x2= edge.x2;
    let y2= edge.y2;


    // compute variables based on characteristics
    let e_length = JXG.Math.Geometry.distance([x1, y1],[x2,y2]); // edge length
    let R_wire = (e_length-R_width)/2; // Length of the wire leading to the resistor
    
    // compute transformation matrix to move structure to coordinates 
    let rot_angle = JXG.Math.Geometry.rad([x1+1,y1],[x1, y1],[x2, y2]);
    let M_rotation = board.create('transform', [rot_angle, [0, 0]], {type: 'rotate'});
    let M_translation = board.create('transform', [x1,y1], {type: 'translate'});
    let M_transform = M_rotation.melt(M_translation);
    
    // create points for the rectangle and wire connections
    let P0 = board.create('point', [0,0], {visible:false}); // start node
    let P1 = board.create('point', [R_wire, -R_height/2], {visible:false}); // lower left corner
    let P2 = board.create('point', [R_wire, R_height/2], {visible:false});  // upper left corner
    let P3 = board.create('point', [R_wire + R_width, R_height/2], {visible:false}); // upper right corner
    let P4 = board.create('point', [R_wire + R_width,-R_height/2], {visible:false}); // lower rigth corner
    let P5 = board.create('point', [R_wire, 0], {visible:false}); // connecting point left wire
    let P6 = board.create('point', [R_wire + R_width, 0], {visible:false}); // connecting point right wire
    let P7 = board.create('point', [e_length,0], {visible:false}); // end node

    // draw rectangle and wires
  
    board.create('polygon', 
        [
        [P1, M_transform],
        [P2, M_transform],
        [P3, M_transform],
        [P4, M_transform]
        ], 
        {fillColor: 'white', strokeColor: 'black', vertices: {fixed: true, size: 0} 
    }); 
      
    board.create('segment', [[P0, M_transform],[P5, M_transform]]);
    board.create('segment', [[P6, M_transform],[P7, M_transform]]);


    // === Place Label ===
    // read settings
   
    let show_label = edge.show_label !== false; //show_label default true
    let show_value = edge.show_value === true; // show_value feault false


    // for now, everything in the middle
    let label_align = 'middle';
    let label_fontSize = edge.label_fontSize || label_fontsize_default;
       
    // create value text with prefix and unit

    let value = edge.value_re || 0; // resistor value, 0 if emtpy
    let unit = edge.unit || '\Omega'; //unit, default is Ohm
    let prefix = edge.prefix || 0; //SI_prefix, default 0 => factor 1
    let value_factor = JXG.Math.pow(10,prefix); 
    let SI = SI_prefix.find(entry=>entry.power ===prefix)|| SI_prefix[0]; // lookup symbol
    let display_value = value/value_factor +'&nbsp;'+ SI.symbol + unit; 
    let label = edge.label || 'R'; // default Label for resistors is R
    let caption;

    // combine label and display value based on settings
    if (show_label&&show_value){
     
        caption = label+'&nbsp;&nbsp;&nbsp;&nbsp;'+display_value;
         
    } else if(!show_label&&show_value){
    
        caption = display_value;

    } else if (show_label&&!show_value){
    
        caption = label;

    }
    
    // create anchor point and show text
    if (show_label||show_value){
        let P_caption = board.create('point', [R_wire+R_width/2, -R_height], {visible: true})    
        let R_caption = board.create(
            'text', 
            [P_caption.X(),P_caption.Y(), caption],
            {anchorX: 'middle', fontSize: label_fontSize
            });

        M_transform.applyOnce(R_caption);
      }
}


function drawV(edge){
    
    // === Draw Structure === 
    // read edge characteristics
    let x1= edge.x1;
    let y1= edge.y1;
    let x2= edge.x2;
    let y2= edge.y2;

    // compute variables based on characteristics
    let e_length = JXG.Math.Geometry.distance([x1, y1],[x2,y2]); // edge length
    let V_wire = (e_length - 2*V_radius) / 2;
    
    
    // compute transformation matrix to move structure to coordinates 
    let rot_angle = JXG.Math.Geometry.rad([x1+1,y1],[x1, y1],[x2, y2]);
    let M_rotation = board.create('transform', [rot_angle, [0, 0]], {type: 'rotate'});
    let M_translation = board.create('transform', [x1,y1], {type: 'translate'});
    let M_transform = M_rotation.melt(M_translation);
    

    // create points for the circle and wire connections
    let P0 = board.create('point', [0, 0], {visible:false}); //start node
    let P1 = board.create('point', [V_wire, 0], {visible:false});  // connecting point left wire
    let P2 = board.create('point', [V_wire + V_radius, 0], {visible:false}); // center of the circle
    let P3 = board.create('point', [e_length - V_wire, 0], {visible:false}); // connecting point right wire
    let P4 = board.create('point', [e_length, 0], {visible:false}); // end node
    let P5 = board.create('point', [V_wire -circle_arrow_extend, -V_radius - circle_arrow_offset]); // start arrow
    let P6 = board.create('point', [e_length - V_wire + circle_arrow_extend,     -V_radius - circle_arrow_offset]); // end arrow
    
    // draw circle, wires and arrow

    board.create('segment', [[x1, y1], [x2, y2]]);
    board.create('circle', [[P2,M_transform], V_radius]);
    board.create('arrow', [[P5, M_transform],[P6, M_transform]], {firstArrow: false, lastArrow: true});


    // === Place Label ===
    // read settings
    let show_label = edge.show_label !== false; //show_label default true
    let show_value = edge.show_value === true; // show_value feault false


    // for now, everything in the middle
    let  label_align = 'middle';
    let label_fontSize = edge.label_fontSize || label_fontsize_default;

    // create value text with prefix and unit
    let value = edge.value_re || 0; // resistor value, 0 if emtpy
    let unit = edge.unit || 'V'; //unit, default is Volt
    let prefix = edge.prefix || 0; //SI_prefix, default 0 => factor 1
    let value_factor = JXG.Math.pow(10,prefix); 
    let SI = SI_prefix.find(entry=>entry.power ===prefix)|| SI_prefix[0]; // lookup symbol
    let display_value = value/value_factor +'&nbsp;'+ SI.symbol + unit; 
    let label = edge.label || 'U_q'; // default Label for volatge source is U_q
    let caption;

    // combine label and display value based on settings
    if (show_label&&show_value){
    
        caption = label+'<br><br>'+display_value;
         
    } else if(!show_label&&show_value){
    
        caption = display_value;

    } else if (show_label&&!show_value){
    
        caption = label;

    }
    
    // create anchor point and show text
    if (show_label||show_value){
        let P_caption = board.create('point', [e_length/2, -V_radius - 2*circle_arrow_offset], {visible: true})    
        let R_caption = board.create(
            'text', 
            [P_caption.X(),P_caption.Y(), caption],
            {anchorX: 'middle', fontSize: label_fontSize
            });

        M_transform.applyOnce(R_caption);
      }
}

//=== ToDo implement current source, inductor and capacitor 

function drawI(edge){
    // wire for now
    drawW(edge);

}

function drawL(edge){
    // wire for now
    drawW(edge);

}
function drawC(edge){
    // wire for now
    drawW(edge);

}

