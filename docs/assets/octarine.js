
// TODO eventually: Wrap this into a namespace


var videoContainerSize;



// Creates a small video camera icon on top-left corner

function add_video_toggle() {

    // 1. Create a container for the icon
    const iconContainer = document.createElement('div');
    
    // 2. Add styling via JavaScript
    Object.assign(iconContainer.style, {
        position: 'fixed',
        top: '20px',
        left: '20px',
        zIndex: '1000',
        fontSize: '24px',
        color: '#333',
        cursor: 'pointer'
    });

    // 3. Insert the icon (using a Google Material Symbol as an example)
    iconContainer.innerHTML = '<span class="material-symbols-outlined">videocam</span>';
    iconContainer.onclick = ()=>{ toggle_camera(); };
    
    // 4. Append to the body
    document.body.appendChild(iconContainer);
}


function handleCameraClick(event) {

    const cont = document.getElementById('octarine-video-container');
    if (!cont) return;
    if (event.shiftKey) {
	if (cont.getAttribute("class") == "sqcam")
	    cont.setAttribute("class", "circam");
	else 
	    cont.setAttribute("class", "sqcam");
	event.preventDefault();
    }
}


// const element = document.getElementById('myElement');
// element.addEventListener('wheel', 

function handleCameraWheel(event) {

    // console.log(event);
    
    // To zoom octarine-video-container
    const cont = document.getElementById('octarine-video-container');

    // Prevent the default scroll action
    event.preventDefault();

    // Determine scroll direction and amount
    const deltaY = event.deltaY; // Vertical scroll amount
    const deltaX = event.deltaX; // Horizontal scroll amount

    var delta;
    if (deltaY < 0) {
        // Increase size
	delta = -2;
    } else if (deltaY > 0) {
        // Decrease size
	delta = 2;
    }
    videoContainerSize = videoContainerSize + delta;
    if (videoContainerSize < 100) videoContainerSize = 100;
    else if (videoContainerSize > 900) videoContainerSize = 900;

    console.log({delta, videoContainerSize});
    
    cont.style.width = videoContainerSize+'px';
    cont.style.height = videoContainerSize+'px';
}





function toggle_visibility(id)
{
    const d = document.getElementById(id);
    if (d.style.display == "none")
	d.style.display = "";
    else
	d.style.display = "none";

}    


// This will usually start a camera view, asking user for permission,
// and return true when it succeeds. A return value of false indicates
// that the camera has already been set up... this may be useful for
// other functions to control visibility etc.

function toggle_camera()
{
    if (document.getElementById('octarine-video-container')) {
	console.log('Octarine camera already running.');
	toggle_visibility('octarine-video-container');
	return;
    }

    // initialize global size
    videoContainerSize = 200;
    const cont = document.createElement('div');
    cont.id = 'octarine-video-container';
    // cont.className = 'sqcam';
    cont.setAttribute("class", "circam");

    Object.assign(cont.style,
		  {
		      position:'fixed',
		      zIndex:'999999',
		      overflow:'hidden',
		      width: videoContainerSize + 'px',
		      height: videoContainerSize + 'px',
		      background:'#000',
		      border:'3px solid #fff',
		      // borderRadius:'20%',
		      boxShadow:'0 6px 32px rgba(0,0,0,0.8)',
		      cursor:'move',
		      left:(window.innerWidth-280)+'px',
		      top:(window.innerHeight-280)+'px'
		  });

    const vid = document.createElement('video');
    Object.assign(vid, {
	autoplay:true,
	muted:true,
	playsInline:true
    });
    Object.assign(vid.style,
		  {
		      width:'100%',
		      height:'100%',
		      // clipPath:'circle(40%)',
		      //borderRadius:'50%'
		      objectFit:'cover',
		  });
    cont.appendChild(vid);

    document.body.appendChild(cont);
    let drag=false, dx, dy;

    cont.onclick = (e) => { handleCameraClick(e); };
    cont.onwheel = (e) => { handleCameraWheel(e); };

    cont.addEventListener('pointerdown',
			  e => {
			      // if (e.target===resize) return;
			      drag = true;
			      dx = e.clientX-cont.offsetLeft;
			      dy = e.clientY-cont.offsetTop;
			      cont.style.transition = 'none';
			      e.preventDefault();
			  });
    document.addEventListener('pointermove',
			      e => {
				  if (!drag) return;
				  cont.style.left=(e.clientX-dx)+'px';
				  cont.style.top=(e.clientY-dy)+'px';
			      });

    document.addEventListener('pointerup', () => { drag=false; });

    navigator.mediaDevices.getUserMedia({
	audio: false,
	video: true
    }).then(s => {
	vid.srcObject=s;
    }).catch(e => {
	alert('Camera failed: '+e.message);
	document.body.removeChild(cont);
    });

    return;
}

