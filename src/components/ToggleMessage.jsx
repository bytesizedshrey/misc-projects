import React, { useState } from 'react'

const ToggleMessage = () => {
    const [isVisible, setisVisible] = useState(false)
    // let hehe;
    // if(isVisible == true){
    //     hehe = <h1>lode m kia meowww</h1>
    // } else {
    //     hehe = <h2>haati m kehaa bhau bhauuu</h2>
    // }
  return (
    <div>
      <button className='h-20px w-20px rounded bg-red-300'  onClick={() => setisVisible(!isVisible)}>Toggle Message</button>

      {isVisible ? <h1>meow meow</h1> : <h1>woof woof</h1>}
      {/* {hehe} */}
    </div>
  )
}

export default ToggleMessage
