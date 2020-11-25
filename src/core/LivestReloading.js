async function subscribe() {
  if(window.nolive)
    return;

  let response = {};
  try{
    response = await fetch( "/[live]" );
  }catch( e ){

  }
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
  setTimeout(subscribe, 1000);

}

setTimeout(subscribe, 1000);