//10초부터 40초
playVideoTeaserFrom(10,40);   //this event will call the function after page was loaded
      
function playVideoTeaserFrom (startTime, endTime) {
    var videoplayer = document.getElementById("yourVideoplayer");  //get your videoplayer

    videoplayer.currentTime = startTime; //not sure if player seeks to seconds or milliseconds
    videoplayer.play();

    //call function to stop player after given intervall
    var stopVideoAfter = (endTime - startTime) * 1000;  //* 1000, because Timer is in ms
    setTimeout(function(){
        videoplayer.pause();
    }, stopVideoAfter);

}