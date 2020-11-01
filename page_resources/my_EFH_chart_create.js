
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
   
   //****************************************************************************************
   //in this part, some constants that define the chart X and Y properties to fit individual aircraft types
   const Y_AXIS_START_WEIGHT = 1500;//	starting wight value for the Y axis
   const Y_AXIS_INCREMENT_VALUE = 100;// The value that the Y axis is incremented by
   const Y_AXIS_NUMBEROFTICS = 10;// Number of tics in the Y axis
   
   const X_AXIS_START_INCHES = 34;// Number to start the X axis inches centre of gravity at
   const X_AXIS_INCREMENT_VALUE = 1;// The value that the X axis is incemented by
   const X_AXIS_NUMBEROFTICS = 15;// Number of tics in the X axis
   //****************************************************************************************
   
   let chart_canvas = document.getElementById('output_chart');
   let canvas_ctx = chart_canvas.getContext('2d');

   const GEFH_IMG = document.getElementById('GEFH_1');
   const RGB_RED = 'rgb(255,0,0)';
   const RGB_GREEN = 'rgb(36, 214, 54)';
   
   let display_colour = 'rgb(0,255,0)';
   let tick_length = (chart_canvas.width * 0.025)/2; //set tick length relative to canvas width
   let Y_axis_length = (chart_canvas.height * 0.9); //set Y axis length relative to canvas height for future scaling
   let X_axis_length = (chart_canvas.width * 0.9); //let X axis length relative to canvas width for future scaling
   let X_tick_offset = (X_axis_length / (X_AXIS_NUMBEROFTICS-1)); //X ticks spacing divide by number of desired tics
   let Y_tick_offset = (Y_axis_length / (Y_AXIS_NUMBEROFTICS-1)); //Y ticks spacing divide by number of desired tics
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
	  

	  
	  //refine the X axis tic generation routine
	  canvas_ctx.fillStyle = 'rgb(0,0,0)';
	  canvas_ctx.textAlign = 'center';
	  canvas_ctx.font = font_ticks;
	  canvas_ctx.beginPath();
	  canvas_ctx.lineWidth = 1;
	  
	  disp_count = X_AXIS_START_INCHES;// starting number of x axis
	  for(let i=0; i<X_AXIS_NUMBEROFTICS; i++){
        //draw the tic
	    canvas_ctx.beginPath();	
        canvas_ctx.moveTo(XY_axis_beginX + X_tick_offset*i, XY_axis_beginY + tick_length);
	    canvas_ctx.lineTo(XY_axis_beginX + X_tick_offset*i, XY_axis_beginY - tick_length);	
		canvas_ctx.stroke();
        //draw the tic value number
        canvas_ctx.fillText(disp_count.toString(10), XY_axis_beginX + X_tick_offset*i, XY_axis_beginY + tick_length*2);
		disp_count = disp_count + X_AXIS_INCREMENT_VALUE;		
	  }
  
	  //fill Y axis ticks
	  disp_count = Y_AXIS_START_WEIGHT;//y axis starting number
	  canvas_ctx.textAlign = 'end';
	  canvas_ctx.fillText(disp_count.toString(10), XY_axis_beginX - tick_length, XY_axis_beginY); 
	  for(let i=1; i<Y_AXIS_NUMBEROFTICS; i++){
	     //draw the tick 
		 canvas_ctx.beginPath();
         canvas_ctx.moveTo(XY_axis_beginX - tick_length, XY_axis_beginY - Y_tick_offset*i);
	     canvas_ctx.lineTo(XY_axis_beginX + tick_length, XY_axis_beginY - Y_tick_offset*i);	
		 canvas_ctx.stroke();
		 //draw the tic value number	
		 disp_count = disp_count + Y_AXIS_INCREMENT_VALUE;
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
	  canvas_ctx.moveTo((35.0 *(X_tick_offset))-(X_AXIS_START_INCHES*(X_tick_offset)) + X_axis_margin, (Y_axis_margin+Y_axis_length) -((Y_AXIS_START_WEIGHT * (Y_tick_offset/Y_AXIS_INCREMENT_VALUE)) - (Y_AXIS_START_WEIGHT*(Y_tick_offset/Y_AXIS_INCREMENT_VALUE))));
	  canvas_ctx.lineTo((35.0 *(X_tick_offset))-(X_AXIS_START_INCHES*(X_tick_offset)) + X_axis_margin, (Y_axis_margin+Y_axis_length) -((1950 * (Y_tick_offset/Y_AXIS_INCREMENT_VALUE)) - (Y_AXIS_START_WEIGHT*(Y_tick_offset/Y_AXIS_INCREMENT_VALUE))));
	  canvas_ctx.lineTo((38.5 *(X_tick_offset))-(X_AXIS_START_INCHES*(X_tick_offset)) + X_axis_margin, (Y_axis_margin+Y_axis_length) -((2300 * (Y_tick_offset/Y_AXIS_INCREMENT_VALUE)) - (Y_AXIS_START_WEIGHT*(Y_tick_offset/Y_AXIS_INCREMENT_VALUE))));
	  canvas_ctx.lineTo((47.3 *(X_tick_offset))-(X_AXIS_START_INCHES*(X_tick_offset)) + X_axis_margin, (Y_axis_margin+Y_axis_length) -((2300 * (Y_tick_offset/Y_AXIS_INCREMENT_VALUE)) - (Y_AXIS_START_WEIGHT*(Y_tick_offset/Y_AXIS_INCREMENT_VALUE))));
	  canvas_ctx.lineTo((47.3 *(X_tick_offset))-(X_AXIS_START_INCHES*(X_tick_offset)) + X_axis_margin, (Y_axis_margin+Y_axis_length) -((Y_AXIS_START_WEIGHT * (Y_tick_offset/Y_AXIS_INCREMENT_VALUE)) - (Y_AXIS_START_WEIGHT*(Y_tick_offset/Y_AXIS_INCREMENT_VALUE))));
	  canvas_ctx.lineTo((35.0 *(X_tick_offset))-(X_AXIS_START_INCHES*(X_tick_offset)) + X_axis_margin, (Y_axis_margin+Y_axis_length) -((Y_AXIS_START_WEIGHT * (Y_tick_offset/Y_AXIS_INCREMENT_VALUE)) - (Y_AXIS_START_WEIGHT*(Y_tick_offset/Y_AXIS_INCREMENT_VALUE))));
	  canvas_ctx.stroke();
	  canvas_ctx.fill();
	  
	  //bounding box of Utility category
	  canvas_ctx.fillStyle = 'rgba(204, 230, 103, 0.2)';
	  canvas_ctx.beginPath();
	  canvas_ctx.moveTo((35.0 *(X_tick_offset))-(X_AXIS_START_INCHES*(X_tick_offset)) + X_axis_margin, (Y_axis_margin+Y_axis_length) -((Y_AXIS_START_WEIGHT * (Y_tick_offset/Y_AXIS_INCREMENT_VALUE)) - (Y_AXIS_START_WEIGHT*(Y_tick_offset/Y_AXIS_INCREMENT_VALUE))));
	  canvas_ctx.lineTo((35.0 *(X_tick_offset))-(X_AXIS_START_INCHES*(X_tick_offset)) + X_axis_margin, (Y_axis_margin+Y_axis_length) -((1950 * (Y_tick_offset/Y_AXIS_INCREMENT_VALUE)) - (Y_AXIS_START_WEIGHT*(Y_tick_offset/Y_AXIS_INCREMENT_VALUE))));
	  canvas_ctx.lineTo((35.5 *(X_tick_offset))-(X_AXIS_START_INCHES*(X_tick_offset)) + X_axis_margin, (Y_axis_margin+Y_axis_length) -((2000 * (Y_tick_offset/Y_AXIS_INCREMENT_VALUE)) - (Y_AXIS_START_WEIGHT*(Y_tick_offset/Y_AXIS_INCREMENT_VALUE))));
	  canvas_ctx.lineTo((40.5 *(X_tick_offset))-(X_AXIS_START_INCHES*(X_tick_offset)) + X_axis_margin, (Y_axis_margin+Y_axis_length) -((2000 * (Y_tick_offset/Y_AXIS_INCREMENT_VALUE)) - (Y_AXIS_START_WEIGHT*(Y_tick_offset/Y_AXIS_INCREMENT_VALUE))));
	  canvas_ctx.lineTo((40.5 *(X_tick_offset))-(X_AXIS_START_INCHES*(X_tick_offset)) + X_axis_margin, (Y_axis_margin+Y_axis_length) -((Y_AXIS_START_WEIGHT * (Y_tick_offset/Y_AXIS_INCREMENT_VALUE)) - (Y_AXIS_START_WEIGHT*(Y_tick_offset/Y_AXIS_INCREMENT_VALUE))));
	  canvas_ctx.lineTo((35.0 *(X_tick_offset))-(X_AXIS_START_INCHES*(X_tick_offset)) + X_axis_margin, (Y_axis_margin+Y_axis_length) -((Y_AXIS_START_WEIGHT * (Y_tick_offset/Y_AXIS_INCREMENT_VALUE)) - (Y_AXIS_START_WEIGHT*(Y_tick_offset/Y_AXIS_INCREMENT_VALUE))));
	  canvas_ctx.stroke();
	  canvas_ctx.fill();
	  
	  //label NORMAL category
	  canvas_ctx.textAlign = 'start';
	  canvas_ctx.font = 'bold '+font_fuelwarning;
	  canvas_ctx.fillStyle = '#291b42';
	  canvas_ctx.fillText('NORMAL',X_axis_margin * 10,Y_axis_margin * 4);
	  //label UTILITY category
	  canvas_ctx.fillText('UTILITY',X_axis_margin * 5,Y_axis_margin * 9.8);
	  
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
	    

	  //calculate Take Off point for plotting to the chart
	  //X axis calculation X_tick_offset  = 90. 90/2 = 45 = 1 inch CG. so 10 in CG = (10 * (X_tick_offset/2)) - (8*(X_tick_offset/2)) + xmargin	  
	  // from SBM => let TO_xvalue = (TO_CofG *(X_tick_offset/2))-(8*(X_tick_offset/2)) + X_axis_margin;
	  let TO_xvalue = (TO_CofG *(X_tick_offset)) - (X_AXIS_START_INCHES*(X_tick_offset)) + X_axis_margin;
	  //Y axis calculation (TO_weight * (Y_tick_offset/50)) - (750*(Y_tick_offset/50)) + Y_axis_margin *-1
	  // from SMB => let TO_yvalue = (Y_axis_margin+Y_axis_length) -((TO_weight * (Y_tick_offset/50)) - (750*(Y_tick_offset/50)) );
	  let TO_yvalue = (Y_axis_margin+Y_axis_length) -((TO_weight * (Y_tick_offset/Y_AXIS_INCREMENT_VALUE)) - (Y_AXIS_START_WEIGHT*(Y_tick_offset/Y_AXIS_INCREMENT_VALUE)) );

	  //Paint the take off Weight and Balance to the chart
	  canvas_ctx.font = font_labels;
      canvas_ctx.beginPath();  
      canvas_ctx.arc( TO_xvalue, TO_yvalue, 4, 0, 2*Math.PI,false); 
	  canvas_ctx.fill();
	  //label the take off point
	  canvas_ctx.fillStyle = 'black';

	  //if label will run off of the right side of the canvas, then print the text to the left of the point it is labelling 
	  if(TO_xvalue > (chart_canvas.width*0.6)){
	    canvas_ctx.textAlign = 'end';
	    canvas_ctx.fillText('Take Off Weight & Balance point__ ',TO_xvalue, TO_yvalue);
	  }else{
	    canvas_ctx.textAlign = 'start';
	    canvas_ctx.fillText(' __Take Off Weight & Balance point',TO_xvalue, TO_yvalue);
	  }
	  	  
	  //calculate Landing point for plotting to the chart
	  //X axis calculation X_tick_offset  = 90. 90/2 = 45 = 1 inch CG. so 10 in CG = (10 * (X_tick_offset/2)) - (8*(X_tick_offset/2)) + xmargin	  
	  // from SMB => let LDG_xvalue = (landing_CofG *(X_tick_offset/2))-(8*(X_tick_offset/2)) + X_axis_margin;
	  let LDG_xvalue = (landing_CofG *(X_tick_offset))-(X_AXIS_START_INCHES*(X_tick_offset)) + X_axis_margin;
	  //Y axis calculation (TO_weight * (Y_tick_offset/50)) - (750*(Y_tick_offset/50)) + Y_axis_margin *-1
	  // from SBM => let LDG_yvalue = (Y_axis_margin+Y_axis_length) -((landing_weight * (Y_tick_offset/50)) - (750*(Y_tick_offset/50)) );
	  let LDG_yvalue = (Y_axis_margin+Y_axis_length) -((landing_weight * (Y_tick_offset/Y_AXIS_INCREMENT_VALUE)) - (Y_AXIS_START_WEIGHT*(Y_tick_offset/Y_AXIS_INCREMENT_VALUE)) );
	  
	  //Check if the points will be plotted off the canvas size and alert that they are OFF THE CHART
	  canvas_ctx.textAlign = 'start';
	  if(TO_xvalue > chart_canvas.width || TO_yvalue < 5 || LDG_xvalue > chart_canvas.width || LDG_yvalue < 5){
	    canvas_ctx.fillStyle = RGB_RED;
	    canvas_ctx.font = font_fuelwarning;
	    canvas_ctx.fillText ('Points are OFF THE CHART, check input values!',
		  XY_axis_beginX + X_axis_margin/2, Y_axis_margin*4);
	  }
      canvas_ctx.font = font_labels;
	  
	  //Paint the Landing Weight and Balance to the chart
	  canvas_ctx.fillStyle = display_colour;
	  canvas_ctx.beginPath();  
      canvas_ctx.arc( LDG_xvalue, LDG_yvalue, 4, 0, 2*Math.PI,false); 
	  canvas_ctx.fill();
	  
	  //label the take off point
	  canvas_ctx.fillStyle = 'black';
	  //displace display if too close together
	  if (chart_canvas.width > 320){
	     //set label Y offset for large chart size 
	     if(( LDG_yvalue - TO_yvalue)>14){
		   //set ldg label left or right of point
		   if(LDG_xvalue > (chart_canvas.width*0.6)){
			 canvas_ctx.textAlign = 'end';
		     canvas_ctx.fillText('Landing Weight & Balance point__ ',LDG_xvalue, LDG_yvalue);
		   }else{
			 canvas_ctx.textAlign = 'start';
		     canvas_ctx.fillText(' __Landing Weight & Balance point',LDG_xvalue, LDG_yvalue);
		   }
	     }else{
			//set ldg label left or right of point
			if(LDG_xvalue > (chart_canvas.width*0.6)){
		      canvas_ctx.textAlign = 'end';
		      canvas_ctx.fillText('Landing Weight & Balance point~~ ',LDG_xvalue, LDG_yvalue + 14);
			}else{
			  canvas_ctx.textAlign = 'start';
		      canvas_ctx.fillText(' ~~Landing Weight & Balance point',LDG_xvalue, LDG_yvalue + 14); 
			}
		 }
	  }else{
	     //set label Y offset for small chart size 
	     if(( LDG_yvalue - TO_yvalue)>7){
		   //set ldg label left or right of point
		   if(LDG_xvalue > (chart_canvas.width*0.6)){
		     canvas_ctx.textAlign = 'end';
		     canvas_ctx.fillText('Landing Weight & Balance point__ ',LDG_xvalue, LDG_yvalue);  
		   }else{
		     canvas_ctx.textAlign = 'start';
		     canvas_ctx.fillText(' __Landing Weight & Balance point',LDG_xvalue, LDG_yvalue);
		   }
	     }else{
			//set ldg label left or right of point
		   if(LDG_xvalue > (chart_canvas.width*0.6)){
			 canvas_ctx.textAlign = 'end';
		     canvas_ctx.fillText('Landing Weight & Balance point~~ ',LDG_xvalue, LDG_yvalue + 7);
		   }else{
			 canvas_ctx.textAlign = 'start';
		     canvas_ctx.fillText(' ~~Landing Weight & Balance point',LDG_xvalue, LDG_yvalue + 7);
		   }
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
