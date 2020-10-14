
//function to zoom the chart in and out
function zoom(){
	
	let chart_canvas = document.getElementById('output_chart');
	
	if (chart_canvas.width < 480){
	  //zoom in to 640 x 480 
	  chart_canvas.width = 640;
	  chart_canvas.height = 480;
	}else{
      //zoom out to 320x240
	  chart_canvas.width = 320;
	  chart_canvas.height = 240;
	}
	
	//redraw to new sizeToContent
	makeCalculation();
}

//function to create the chart displaying the CofG data sent to if from the calculated values

function chart_it(TO_weight, TO_CofG, landing_weight, landing_CofG, WandB_warning, fuel_reserve_warning) {
   
   //alert('inside chart function warning status is: ' + WandB_warning);
   //alert('inside chart function. fuel reserve warning is ' + fuel_reserve_warning);
   
   let chart_canvas = document.getElementById('output_chart');
   let canvas_ctx = chart_canvas.getContext('2d');

   const GEFH_IMG = document.getElementById('GEFH_1');
   const RGB_RED = 'rgb(255,0,0)';
   const RGB_GREEN = 'rgb(36, 214, 54)';
   
   let display_colour = 'rgb(0,255,0)';
   let tick_length = (chart_canvas.width * 0.025)/2; //set tick length relative to canvas width
   let Y_axis_length = (chart_canvas.height * 0.9); //set Y axis length relative to canvas height for future scaling
   let X_axis_length = (chart_canvas.width * 0.9); //let X axis length relative to canvas width for future scaling
   let X_tick_offset = (X_axis_length / 14); //X ticks spacing divide by number of desired tics
   let Y_tick_offset = (Y_axis_length / 10); //Y ticks spacing divide by number of desired tics
   let X_axis_margin = (chart_canvas.width-X_axis_length)/2; //margin between edge of canvas and start of chart relative for future scaling
   let Y_axis_margin = (chart_canvas.height - Y_axis_length)/2; //magin for Y axis chart for scaling
   let XY_axis_beginX = X_axis_margin; //set X axis zero X position relative to canvas for future scaling
   let XY_axis_beginY = Y_axis_margin+Y_axis_length; //set Y axis zero Y position relative to canvas for future scaling
   let font_ticks = '12px serif';
   let font_fuelwarning = '18px serif';
   let font_labels = '15px serif';
   let disp_count = 0;

   //set warning label colours
   (WandB_warning) ? display_colour = RGB_RED : display_colour = RGB_GREEN
   
   //set font size based on canvas zoom size
   
   if (chart_canvas.width > 320){
	  //set font for large chart size 
      font_ticks = '12px serif';
      font_fuelwarning = '18px serif';
      font_labels = '15px serif';
   }else{
      //set font for small chart size
      font_ticks = '6px serif';
      font_fuelwarning = '9px serif';
      font_labels = '8px serif';
   }
   
   //lets get the ball rolling and test the display
   function drawChart()
   {
	  //clear the canvas for a fresh start
	  canvas_ctx.clearRect(0, 0, chart_canvas.width, chart_canvas.height);
	  //set default stroke color
	  canvas_ctx.strokeStyle = 'black';
	  
      //background image
	  canvas_ctx.drawImage(GEFH_IMG, 0, 0, chart_canvas.width, chart_canvas.height);

	  
	  //draw a translucent white/ maybe yellow
	  canvas_ctx.fillStyle = ('rgba(255,255,255,0.3');//white
	  canvas_ctx.fillRect(0, 0, chart_canvas.width, chart_canvas.height);
	  
      //draw graph overlay
	  canvas_ctx.beginPath();
	  canvas_ctx.lineWidth = 4;
	  // Y axis line
	  canvas_ctx.moveTo(XY_axis_beginX, Y_axis_length + tick_length + Y_axis_margin);
	  canvas_ctx.lineTo(XY_axis_beginX, Y_axis_margin);
	  // X axis line
	  canvas_ctx.moveTo(XY_axis_beginX - tick_length, XY_axis_beginY);
	  canvas_ctx.lineTo(X_axis_length + X_axis_margin, XY_axis_beginY);
	  
	  canvas_ctx.stroke();
	  
	  //fill in X axis ticks
	  canvas_ctx.beginPath();
	  canvas_ctx.lineWidth = 1;
	  for(let i=1; i<15; i++ ){ //i<9 is the number of x tics.  9 for SBM but need 15 for EFH
		 //draw the tick 
		 canvas_ctx.beginPath();
         canvas_ctx.moveTo(XY_axis_beginX + X_tick_offset*i, XY_axis_beginY + tick_length);
	     canvas_ctx.lineTo(XY_axis_beginX + X_tick_offset*i, XY_axis_beginY - tick_length);	
		 canvas_ctx.stroke();
		 
      }
	  disp_count = 35;// starting number of x axis
	  canvas_ctx.fillStyle = 'rgb(0,0,0)';	
	  canvas_ctx.beginPath();
	  canvas_ctx.textAlign = 'center';
	  canvas_ctx.font = font_ticks;
	  canvas_ctx.fillText('34', XY_axis_beginX, XY_axis_beginY + tick_length*2.1);
	  for(let i=1; i<15; i++ ){//as above, for the number of tics on x axis
         //draw the text number below the tick
		 canvas_ctx.fillText(disp_count.toString(10), XY_axis_beginX + X_tick_offset*i, XY_axis_beginY + tick_length*2);
		 disp_count = disp_count + 1;
      }
	  
	  //fill Y axis ticks
	  disp_count = 1500;//y axis starting number
	  canvas_ctx.textAlign = 'end';
	  canvas_ctx.fillText(disp_count.toString(10), XY_axis_beginX - tick_length, XY_axis_beginY); 
	  for(let i=1; i<11; i++){
	     //draw the tick 
		 canvas_ctx.beginPath();
         canvas_ctx.moveTo(XY_axis_beginX - tick_length, XY_axis_beginY - Y_tick_offset*i);
	     canvas_ctx.lineTo(XY_axis_beginX + tick_length, XY_axis_beginY - Y_tick_offset*i);	
		 canvas_ctx.stroke();
		 disp_count = disp_count + 100;//this magic # is the lbs increase per tic on y axis
		 canvas_ctx.fillText(disp_count.toString(10), XY_axis_beginX - tick_length, XY_axis_beginY - Y_tick_offset*i);
	  }

	  //create the envelope outline
	  canvas_ctx.strokeStyle = 'black';
	  canvas_ctx.fillStyle = 'rgba(36, 214, 54, 0.2)';
	  canvas_ctx.lineWidth = 2;
	  //rectangle of lines connecting the corner points of the operating CG envelope
	  // x point formula = (COFGVALUE *(X_tick_offset/2))-(8*(X_tick_offset/2)) + X_axis_margin
	  // y point formula = (Y_axis_margin+Y_axis_length) -((WEIGHTVALUE * (Y_tick_offset/50)) - (750*(Y_tick_offset/50)))
	  canvas_ctx.beginPath();
	  
	  //bounding box of Normal catagory
	  canvas_ctx.moveTo((35.0 *(X_tick_offset))-(34*(X_tick_offset)) + X_axis_margin, (Y_axis_margin+Y_axis_length) -((1500 * (Y_tick_offset/100)) - (1500*(Y_tick_offset/100))));
	  canvas_ctx.lineTo((35.0 *(X_tick_offset))-(34*(X_tick_offset)) + X_axis_margin, (Y_axis_margin+Y_axis_length) -((1950 * (Y_tick_offset/100)) - (1500*(Y_tick_offset/100))));
	  canvas_ctx.lineTo((38.5 *(X_tick_offset))-(34*(X_tick_offset)) + X_axis_margin, (Y_axis_margin+Y_axis_length) -((2300 * (Y_tick_offset/100)) - (1500*(Y_tick_offset/100))));
	  canvas_ctx.lineTo((47.3 *(X_tick_offset))-(34*(X_tick_offset)) + X_axis_margin, (Y_axis_margin+Y_axis_length) -((2300 * (Y_tick_offset/100)) - (1500*(Y_tick_offset/100))));
	  canvas_ctx.lineTo((47.3 *(X_tick_offset))-(34*(X_tick_offset)) + X_axis_margin, (Y_axis_margin+Y_axis_length) -((1500 * (Y_tick_offset/100)) - (1500*(Y_tick_offset/100))));
	  canvas_ctx.lineTo((35.0 *(X_tick_offset))-(34*(X_tick_offset)) + X_axis_margin, (Y_axis_margin+Y_axis_length) -((1500 * (Y_tick_offset/100)) - (1500*(Y_tick_offset/100))));
	  canvas_ctx.stroke();
	  canvas_ctx.fill();
	  
	  //bounding box of Utility category
	  canvas_ctx.fillStyle = 'rgba(204, 230, 103, 0.2)';
	  canvas_ctx.beginPath();
	  canvas_ctx.moveTo((35.0 *(X_tick_offset))-(34*(X_tick_offset)) + X_axis_margin, (Y_axis_margin+Y_axis_length) -((1500 * (Y_tick_offset/100)) - (1500*(Y_tick_offset/100))));
	  canvas_ctx.lineTo((35.0 *(X_tick_offset))-(34*(X_tick_offset)) + X_axis_margin, (Y_axis_margin+Y_axis_length) -((1950 * (Y_tick_offset/100)) - (1500*(Y_tick_offset/100))));
	  canvas_ctx.lineTo((35.5 *(X_tick_offset))-(34*(X_tick_offset)) + X_axis_margin, (Y_axis_margin+Y_axis_length) -((2000 * (Y_tick_offset/100)) - (1500*(Y_tick_offset/100))));
	  canvas_ctx.lineTo((40.5 *(X_tick_offset))-(34*(X_tick_offset)) + X_axis_margin, (Y_axis_margin+Y_axis_length) -((2000 * (Y_tick_offset/100)) - (1500*(Y_tick_offset/100))));
	  canvas_ctx.lineTo((40.5 *(X_tick_offset))-(34*(X_tick_offset)) + X_axis_margin, (Y_axis_margin+Y_axis_length) -((1500 * (Y_tick_offset/100)) - (1500*(Y_tick_offset/100))));
	  canvas_ctx.lineTo((35.0 *(X_tick_offset))-(34*(X_tick_offset)) + X_axis_margin, (Y_axis_margin+Y_axis_length) -((1500 * (Y_tick_offset/100)) - (1500*(Y_tick_offset/100))));
	  canvas_ctx.stroke();
	  canvas_ctx.fill();
	  
	  
	  //Show fuel warning at top of chart in RED to alert when reserve is lower than about 30 minutes cruise
	  canvas_ctx.textAlign = 'start';
	  if(fuel_reserve_warning){
	  canvas_ctx.fillStyle = RGB_RED;
	  canvas_ctx.font = font_fuelwarning;
	  canvas_ctx.fillText ('FUEL RESERVE WARNING, estimated fuel reserve is less than 30 minutes!',
		XY_axis_beginX + X_axis_margin/2, Y_axis_margin*2);
	  }
	  
	  //set display color to warning level
	  canvas_ctx.fillStyle = display_colour;
	  
//xx working here	  

	  //calculate Take Off point for plotting to the chart
	  //X axis calculation X_tick_offset  = 90. 90/2 = 45 = 1 inch CG. so 10 in CG = (10 * (X_tick_offset/2)) - (8*(X_tick_offset/2)) + xmargin	  
	  // from SBM => let TO_xvalue = (TO_CofG *(X_tick_offset/2))-(8*(X_tick_offset/2)) + X_axis_margin;
	  let TO_xvalue = (TO_CofG *(X_tick_offset)) - (34*(X_tick_offset)) + X_axis_margin;
	  //Y axis calculation (TO_weight * (Y_tick_offset/50)) - (750*(Y_tick_offset/50)) + Y_axis_margin *-1
	  // from SMB => let TO_yvalue = (Y_axis_margin+Y_axis_length) -((TO_weight * (Y_tick_offset/50)) - (750*(Y_tick_offset/50)) );
	  let TO_yvalue = (Y_axis_margin+Y_axis_length) -((TO_weight * (Y_tick_offset/100)) - (1500*(Y_tick_offset/100)) );

	  //Paint the take off Weight and Balance to the chart
	  canvas_ctx.font = font_labels;
      canvas_ctx.beginPath();  
      canvas_ctx.arc( TO_xvalue, TO_yvalue, 4, 0, 2*Math.PI,false); 
	  canvas_ctx.fill();
	  //label the take off point
	  canvas_ctx.fillStyle = 'black';
	  canvas_ctx.fillText(' __Take Off Weight & Balance point',TO_xvalue, TO_yvalue);
	  
	  //calculate Landing point for plotting to the chart
	  //X axis calculation X_tick_offset  = 90. 90/2 = 45 = 1 inch CG. so 10 in CG = (10 * (X_tick_offset/2)) - (8*(X_tick_offset/2)) + xmargin	  
	  // from SMB => let LDG_xvalue = (landing_CofG *(X_tick_offset/2))-(8*(X_tick_offset/2)) + X_axis_margin;
	  let LDG_xvalue = (landing_CofG *(X_tick_offset))-(34*(X_tick_offset)) + X_axis_margin;
	  //Y axis calculation (TO_weight * (Y_tick_offset/50)) - (750*(Y_tick_offset/50)) + Y_axis_margin *-1
	  // from SBM => let LDG_yvalue = (Y_axis_margin+Y_axis_length) -((landing_weight * (Y_tick_offset/50)) - (750*(Y_tick_offset/50)) );
	  let LDG_yvalue = (Y_axis_margin+Y_axis_length) -((landing_weight * (Y_tick_offset/100)) - (1500*(Y_tick_offset/100)) );
	  
	  //Paint the Landing Weight and Balance to the chart
	  canvas_ctx.fillStyle = display_colour;
	  canvas_ctx.beginPath();  
      canvas_ctx.arc( LDG_xvalue, LDG_yvalue, 4, 0, 2*Math.PI,false); 
	  canvas_ctx.fill();
	  //label the take off point
	  canvas_ctx.fillStyle = 'black';
	  //displace display if too close together
	  if (chart_canvas.width > 320){
	     //set label offset for large chart size 
	     if(( LDG_yvalue - TO_yvalue)>14){
		   canvas_ctx.fillText(' __Landing Weight & Balance point',LDG_xvalue, LDG_yvalue);
	     }else{
		    canvas_ctx.fillText(' ~~Landing Weight & Balance point',LDG_xvalue, LDG_yvalue + 14); 
		 }
	  }else{
	     //set label offset for small chart size 
	     if(( LDG_yvalue - TO_yvalue)>7){
		   canvas_ctx.fillText(' __Landing Weight & Balance point',LDG_xvalue, LDG_yvalue);
	     }else{
		    canvas_ctx.fillText(' ~~Landing Weight & Balance point',LDG_xvalue, LDG_yvalue + 7);
	     }
	  }
	  
	  //draw a line on the chart connecting the two points
	  canvas_ctx.strokeStyle = display_colour;
	  canvas_ctx.beginPath();
	  canvas_ctx.lineWidth = 2;
	  canvas_ctx.moveTo(TO_xvalue, TO_yvalue);
	  canvas_ctx.lineTo(LDG_xvalue, LDG_yvalue); 
	  canvas_ctx.stroke();
	  
   }


   
   //make it do number onerror
   drawChart();
}
