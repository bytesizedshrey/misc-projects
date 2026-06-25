import React, { use, useState } from 'react'

function EurOrInr() {
    const [country, setcountry] = useState(false)
  return (
    <div>
      <button className='h-20px w-30px bg-blue-950 rounded' onClick={()=>{
        {setcountry(!country)}
      }}>Click me</button>

      {country ? 'india' : 'europe'}
    </div>
  )
}

export default EurOrInr
