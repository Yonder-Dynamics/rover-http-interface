/*
 * Subscriber to IMU,GPS,ASS msgs, unpacks into Control GUI
 */


function response_callback(response) {
  //console.log(response)
  document.getElementById("imu-x").value = response.imu.linear_acceleration[0];
  document.getElementById("imu-y").value = response.imu.linear_acceleration[1];
  document.getElementById("imu-z").value = response.imu.linear_acceleration[2];

  /*	
  document.getElementById("gps-x").value = response.gps;
  document.getElementById("gps-y").value = response.gps;
  document.getElementById("gps-z").value = response.gps;

      
  document.getElementById("ass-x").value = response.ass;
  document.getElementById("ass-y").value = response.ass;
  document.getElementById("ass-z").value = response.ass;
  */
} 

module.exports = response_callback;
