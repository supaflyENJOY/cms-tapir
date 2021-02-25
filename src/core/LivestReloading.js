(function() {
var delay = 1;
async function subscribe() {
  if(window.nolive)
    return;

  let response = {};
  delay*=1.5;
  try{
    response = await fetch( "/[live]" );
    if(response.status !== 404){
      delay = 1;
    }
  }catch( e ){}
  if (response.status === 502) {
  } else if (response.status !== 200) {
    // An error - let's show it
    //debugger
    //showMessage(response.statusText);
    // Reconnect in one second
  } else {

    // Get and show the message

    try{
      let message = await response.text();
      let data = JSON.parse( message ),
          should = data.filter(live =>
            [...document.scripts]
              .map((a)=>a.src.replace(location.protocol+'//'+location.host,''))
              .indexOf(live.file)>-1
          ).forEach(a=>{
            try{
              eval( a.content )
              console.log('Reloaded: '+a.file);
            }catch(e){
              console.error(e)

            }
          });

    }catch(e){
      console.error(e)
    }
    //showMessage(message);
    // Call subscribe() again to get the next message
  }
  setTimeout(subscribe, delay*1000);

}

setTimeout(subscribe, 1000);
})();