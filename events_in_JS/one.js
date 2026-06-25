// document.getElementById('owl').onclick = function(){
//     alert('owl clicked');
// } 

// document.getElementById('owl').addEventListener('click', function(e){
//     alert('owl clicked again')
//     console.log(e);
// })

document.getElementById('images').addEventListener('click', function(e){
    alert('clicked inside the UI')
    console.log(e);
},false)

document.getElementById('owl').addEventListener('click', function(e){
    alert('owl clicked')
    e.stopPropagation() //wont go to another one
},false) 

document.getElementById('google').addEventListener('click',function(e){
    e.preventDefault()
    e.stopPropagation()
    console.log('google clicked')
},false)

document.querySelector('#images').addEventListener('click', function(e){

    if(e.target.tagName === 'IMG'){
        console.log(e.target.id);
        let removeIt = e.target.parentNode
        removeIt.remove()
    }

    
})