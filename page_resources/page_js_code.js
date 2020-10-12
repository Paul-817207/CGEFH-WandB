// for Cessna 172M C-GEFH

//function to convert litres to usg and put litres value in usg field
function convert_litres(tank){
	
	//alert('in convert function'+tank);
	if(tank === 'main_usg'){
		if (!isNaN(parseFloat(document.getElementById("main_fuel_usg").value, 10)))
			document.getElementById("main_fuel_litres").value = parseFloat((parseFloat(document.getElementById("main_fuel_usg").value, 10)/0.26417).toFixed(1));
	}
	if(tank === 'main_litres'){
		if (!isNaN(parseFloat(document.getElementById("main_fuel_litres").value, 10))){
			document.getElementById("main_fuel_usg").value = parseFloat((parseFloat(document.getElementById("main_fuel_litres").value, 10)*0.26417).toFixed(1));
		}else{
			document.getElementById("main_fuel_usg").value = 0;
		}
	}
	if(tank === 'burn_usg'){
		if (!isNaN(parseFloat(document.getElementById("est_fuel_burn_usgph").value, 10))){
			document.getElementById("est_fuel_burn_lph").value = parseFloat((parseFloat(document.getElementById("est_fuel_burn_usgph").value, 10)/0.26417).toFixed(1));
		}else{
			document.getElementById("est_fuel_burn_lph").value = 0;
		}
	}
	if(tank === 'burn_litres'){
		if (!isNaN(parseFloat(document.getElementById("est_fuel_burn_lph").value, 10))){
			document.getElementById("est_fuel_burn_usgph").value = parseFloat((parseFloat(document.getElementById("est_fuel_burn_lph").value, 10)*0.26417).toFixed(1));
		}else{
			document.getElementById("est_fuel_burn_usgph").value = 0;
		}
	}
	if(tank === 'est_fuel_usg'){
		if (!isNaN(parseFloat(document.getElementById("flight_fuel_used_usg").value, 10))){
			document.getElementById("estimated_fuel_litres").value = parseFloat((parseFloat(document.getElementById("flight_fuel_used_usg").value, 10)/0.26417).toFixed(1));
		}else{
			document.getElementById("estimated_fuel_litres").value = 0;
		}
	
	}
		if(tank === 'est_fuel_litres'){
		if (!isNaN(parseFloat(document.getElementById("estimated_fuel_litres").value, 10))){
			document.getElementById("flight_fuel_used_usg").value = parseFloat((parseFloat(document.getElementById("estimated_fuel_litres").value, 10)*0.26417).toFixed(1));
		}else{
			document.getElementById("flight_fuel_used_usg").value = 0;
		}
	}
	//After conversion is complete, call makeCalculation() to calculate and display the change
	makeCalculation();
}

function makeCalculation() { 
  // Constants specific to C-GEFH
  const MAX_GROSS_WEIGHT = 2300.0;
  const BASIC_EMPTY_WEIGHT = 1473.76;
  const AIRCRAFT_ARM_WHEELS = 41.89;//aft of datum
  const OIL_QUART_LBS = 1.875;
  const FUEL_USG_LBS = 6.0;
  const FUEL_BURN_USGPH = 10; //estimated US gallons per hour of fuel burn of this engine at cruise power setting
  const PILOT_F_PASS_ARM = 37.0;//Pilot and front passenger arm " aft of datum in normal seated position. (34.0" to 46.0" seat adjust range)
  const PASS_ARM_REAR = 73.0;//rear passenger arm " aft of datum
  const BAGGAGE_1_ARM = 95.0;//Baggage area #1 arm " aft of datum 120 lbs max
  const BAGGAGE_2_ARM = 123.0;//Baggage area #2 arm " aft of datum 50 lbs max PLUS Baggage are 1 & 2 max 120 lbs   
  const FUEL_MAIN_ARM = 48.0;//Long range fuel tanks. 48usg useable
  const OIL_ARM = (-13.3);//8 qts = 15 lbs can be used for all calculations
  
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  
//X--not quite sure how I am going to deal with this yet
  const ARM_MIN = 10.6;
  const ARM_MAX = 22.7;
//X---
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

  //variables to make the calculations
  let is_over_Gross_TO_weight = false;
  let is_over_Gross_LDG_weight = false;
  let is_outside_TO_CG_envelope = false;
  let is_outside_LDG_CG_envelope = false;
  let is_below_minimum_fuel_reserve = false;
  let take_off_weight = 0.0;
  let landing_weight = 0.0;
  let temp_value = 0.0;
  let pilot_frt_pass_lbs = 0.0; 
  let pass_rear_lbs = 0.0;
  let baggage1_lbs = 0.0;
  let baggage2_lbs = 0.0;
  let main_fuel_lbs = 0.0;  
  let oil_lbs = 8 * OIL_QUART_LBS; // Cessna W&B from POH says its OK to assume 8 qts oil in engine for all calculations
  let entered_fuel_burn_usgph = 0;
  let fuel_used_for_flight_lbs = 0;
  let main_fuel_volume_usg = 0.0;
  let landing_main_fuel_usg = 0.0;
  let landing_fuel_reserve_minutes = 0;
  let fuel_for_flight_usg = 0.0;
  let take_off_moment = 0.0;
  let landing_moment = 0.0;
  let CG_takeoff = 0.0;
  let CG_landing = 0.0;
  
  
  //collect date entered into the form
  
  
  //get pilot and front passenger weight from the form
  temp_value = parseInt(document.getElementById("pilot_fpx_weight").value, 10);
  if (isNaN(temp_value) || temp_value<0) 
  {
     //alert invalid entry
	 temp_value = 0;
	 document.getElementById("pilot_fpx_lbs_error").innerHTML = " ERROR, Must be a positive number ";
  }else{
    //valid number has been entered
    pilot_frt_pass_lbs = temp_value;
	document.getElementById("pilot_fpx_lbs_error").innerHTML = "";
  }

  //get rear passenger weight from the form
  temp_value = parseInt(document.getElementById("pass_rear_weight").value, 10);
  if (isNaN(temp_value) || temp_value < 0) 
  {
     //alert invalid entry
     temp_value = 0;	 
	 document.getElementById("pass_rear_lbs_error").innerHTML = " ERROR, Must be a positive number ";
  }else{
    //valid number has been entered
    pass_rear_lbs = temp_value;
	document.getElementById("pass_rear_lbs_error").innerHTML = "";
  }

  //get the baggage area #1 weight from the form (120 lbs or less)
  temp_value = parseInt(document.getElementById("baggage1_weight").value, 10);
  if (isNaN(temp_value) || temp_value < 0 || temp_value > 120) 
  {
     //alert invalid entry
     temp_value = 0;	 
	 document.getElementById("baggage1_lbs_error").innerHTML = " ERROR, Must be a positive number 120 lbs or less";
  }else{
    //valid number has been entered
    baggage1_lbs = temp_value;
	document.getElementById("baggage1_lbs_error").innerHTML = "";
  }

  //get the baggage area #2 weight from the form
  temp_value = parseInt(document.getElementById('baggage2_weight').value, 10);
  if (isNaN(temp_value) || temp_value < 0 || temp_value > 50 || (temp_value + baggage1_lbs) > 120)
  {
	  //alert invalid entry
	  temp_value = 0;
	  document.getElementById('baggage2_lbs_error').innerHTML = 'ERROR, Must be a positive number & Baggage area #1 + #2 cannot exceed 120 lbs';
  }else{
	  //valid OK entry value
	  baggage2_lbs = temp_value;
	  document.getElementById('baggage2_lbs_error').innerHTML = '';
  }	  

  //get fuel quantity from the main fuel tank input, verify valid, and calculate weight from the usg volume
  temp_value = parseFloat(document.getElementById("main_fuel_usg").value, 10);
  if (isNaN(temp_value) || temp_value < 0 || temp_value > 48) 
  {
     //alert invalid entry
     temp_value = 0;	 
	 document.getElementById("main_fuel_error").innerHTML = " ERROR, Must be a positive number up to 48 USG";
  }else{
    //valid number has been entered
    main_fuel_volume_usg = temp_value;
	main_fuel_lbs = main_fuel_volume_usg * FUEL_USG_LBS;
	document.getElementById("main_fuel_error").innerHTML = "";
  }
  
  //get the entered estimated fuel burn rate in US gallons per hour
  temp_value = parseFloat(document.getElementById('est_fuel_burn_usgph').value, 10);
  if (isNaN(temp_value) || temp_value < 0) 
  {
    //not a valid entry
	temp_value = 0;	 
	document.getElementById("fuel_burn_error").innerHTML = 'ERROR, Must be a positive number';
  }else{
    //valid entry !
    entered_fuel_burn_usgph = temp_value;
	document.getElementById("fuel_burn_error").innerHTML = '';
  }
 
  //get the value input for the USgallons expected to be used for the flight
  temp_value = parseFloat(document.getElementById("flight_fuel_used_usg").value, 10);
  if (isNaN(temp_value) || temp_value < 0 || (temp_value > 48) ) //invalid if less than 0 fuel will be used or more than the total possible capacity of 48usg
  {
     //alert invalid entry
     temp_value = 0; 
	 document.getElementById("fuel_for_flight_error").innerHTML = " ERROR, Must be between 0 and 48 USG";
  }else{
    //valid number has been entered
	fuel_for_flight_usg = temp_value;
    fuel_used_for_flight_lbs = fuel_for_flight_usg * FUEL_USG_LBS;// calculate the weight of the estimated fuel used for flight 
	document.getElementById("fuel_for_flight_error").innerHTML = "";
  }

  //total up weights for take off weight

  take_off_weight = BASIC_EMPTY_WEIGHT + pilot_frt_pass_lbs + pass_rear_lbs + baggage1_lbs + baggage2_lbs + main_fuel_lbs + oil_lbs;
  landing_weight = take_off_weight - fuel_used_for_flight_lbs;

  //calculate Centre of Gravity
  //first, total all of the weights to get take_off_weight
  //second, calculate the MOMENT from each individual weight ARM (weight x arm = moment)
  //third, calculate the sum of all of the individual MOMENTs
  //fouth, calculate the CofG (CofG = sum of all MOMENTs / sum of all weights
  
  //sum up moments for take off
  take_off_moment = landing_moment = 0.0;

  take_off_moment += BASIC_EMPTY_WEIGHT * AIRCRAFT_ARM_WHEELS;
  take_off_moment += oil_lbs * OIL_ARM;//all calculations can be made assuming 8qts of oil in the engine
  
  if(pilot_frt_pass_lbs > 0)
    take_off_moment += pilot_frt_pass_lbs * PILOT_F_PASS_ARM;
  if(pass_rear_lbs > 0)
    take_off_moment += pass_rear_lbs * PASS_ARM_REAR;
  if(baggage1_lbs > 0)
    take_off_moment += baggage1_lbs * BAGGAGE_1_ARM;
  if(baggage2_lbs > 0)
	take_off_moment += baggage2_lbs * BAGGAGE_2_ARM;

  //landing and take off moment calculation is the same to this point so make them equal
  landing_moment = take_off_moment;
 
  if(main_fuel_lbs > 0)
    //take off moment
    take_off_moment += main_fuel_lbs * FUEL_MAIN_ARM;

  //calculate and estimate of landing configuration. it is assumed that the only reduction of weight in the airplane
  //during flight is due to fuel used from the long range tanks and that nothing else has been tossed out of the
  //window of the airplane
  
  //all fuel used will be from the main tank, calcuate the landing fuel weight and CG
  landing_main_fuel_usg = main_fuel_volume_usg - fuel_for_flight_usg;
  landing_moment += (main_fuel_lbs - fuel_used_for_flight_lbs) * FUEL_MAIN_ARM; 
	
  //calculate take off C of G

  //calculate the Centre of Gravity for take off from the above provided data
  CG_takeoff = take_off_moment / take_off_weight;
  //calculate the Centre of Gravity for landing from the above provided data
  CG_landing = landing_moment / landing_weight;
	
  //ok, now all of the calculations are made, it is time to test the results to see if they are in the 
  //flight envelope or not and VERY CLEARLY display the results to the user, both in text and 
  //image form. because people like pictures
  

  //check if the gross weight or the CofG is out of the safe envelope and set a flag to highlight that fact in RED
  if ( take_off_weight > MAX_GROSS_WEIGHT ){
	  is_over_Gross_TO_weight = true;
  }else{
	  is_over_Gross_TO_weight = false;
  }
  
  if ( landing_weight > MAX_GROSS_WEIGHT ) {
	  is_over_Gross_LDG_weight = true;
  }else{
	  is_over_Gross_LDG_weight = false;
  }


//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//this is where the calculated Centre of Gravity is compared to the safe envelope for flight and 
//some flags set if it is out of the envelope.  this is a little more involved on EFH that is was 
//for SBM.
//for the moment, I am commenting out the CG envelope calculation and I will work on a new calculation
//soon that will be for EFH
/*
   if ( CG_takeoff < 10.6 || CG_takeoff > 22.7 ){
	   is_outside_TO_CG_envelope = true;
   }else{
	   is_outside_TO_CG_envelope = false;
   }
   
   if ( CG_landing < 10.6 || CG_landing > 22.7 ){
	   is_outside_LDG_CG_envelope = true;
   }else{
	   is_outside_LDG_CG_envelope = false;
   }
*/   
//xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx   
   
   
 //XX----ok to this point  
   
  //check to see of there is enough of a fuel reserve.  and set a flag if it is not.
  landing_fuel_reserve_minutes = landing_main_fuel_usg * (60 / entered_fuel_burn_usgph);
  if(landing_fuel_reserve_minutes < 30){
	  is_below_minimum_fuel_reserve = true;
  }else{
	  is_below_minimum_fuel_reserve = false;
  } 
  
  
  //output the results to the screen
  if (true)//valid results on the entry form
  {
    document.getElementById("output").innerHTML =  
    "<p><br>"
	+ "Take off configuration:<br>"   
	+ "&nbsp&nbsp&nbspMain fuel tank contains&nbsp" + main_fuel_volume_usg + "&nbspusg that weighs&nbsp" + main_fuel_lbs.toFixed(2) + "&nbsplbs<br>"
	+ "&nbsp&nbsp&nbspTake off weight (max =1220lbs) =&nbsp " + (take_off_weight).toFixed(0) + "&nbsplbs&nbsp" + (is_over_Gross_TO_weight ? '<font color="red"><span>is over max gross weight. WARNING</span></font><br>':'<font color="green"><span>&nbspis OK</span></font><br>')
	+ "&nbsp&nbsp&nbspTake off Centre of Gravity (min 10.6 max 22.7) =&nbsp" + CG_takeoff.toFixed(2) + (is_outside_TO_CG_envelope ? '<font color="red"><span>&nbspOutside of CG envelope. WARNING</span></font><br><br>' : '<font color="green"><span>&nbspis OK</span></font><br>')
	+ "&nbsp&nbsp&nbspRemaining Load to gross weight is " + (MAX_GROSS_WEIGHT - take_off_weight).toFixed(0) + "&nbsplbs<br><br>"	
	+ "Estimated landing configuration:<br>"
	+ "&nbsp&nbsp&nbspReserve fuel time is about &nbsp" + landing_fuel_reserve_minutes + "&nbspminutes calculated at&nbsp" + FUEL_BURN_USGPH + "&nbspusgph&nbsp" + ( (is_below_minimum_fuel_reserve) ?  '<font color="red"><span>WARNING, less than 30 minutes of fuel remaining at landing</span></font><br>' : '<font color="green"><span>&nbspis OK</span></font><br>' )
	+ "&nbsp&nbsp&nbspFuel MAIN tank level at landing is &nbsp" + landing_main_fuel_usg + "&nbspusg that weighs &nbsp" + (landing_main_fuel_usg * FUEL_USG_LBS).toFixed(2) + "&nbsplbs<br>"
	+ "&nbsp&nbsp&nbspLanding weight (max =1220lbs) =&nbsp" + (landing_weight).toFixed(0) + "&nbsplbs&nbsp" + (is_over_Gross_LDG_weight ? '<font color="red"><span>is over max gross weight. WARNING</span></font><br>':'<font color="green"><span>is OK<br></font>')
	+ "&nbsp&nbsp&nbspLanding Centre of Gravity (min 10.6 max 22.7) = &nbsp" + CG_landing.toFixed(2) + (is_outside_LDG_CG_envelope ? '<font color="red"><span>&nbspOutside of CG envelope. WARNING</span></font><br>':'<font color="green"><span>&nbspis OK</span></font><br>')
    
    + "</p>";
  }
  else//invalid information on entry form
  {
    document.getElementById("output").innerHTML = "INVALID form data, Please complete the form or correct any mistakes entered";
  }
  
  //send the data to the chart function to display in chart form
  chart_it(take_off_weight, CG_takeoff, landing_weight, CG_landing,(is_outside_TO_CG_envelope || is_outside_LDG_CG_envelope || is_over_Gross_LDG_weight || is_over_Gross_TO_weight), is_below_minimum_fuel_reserve);
  
}