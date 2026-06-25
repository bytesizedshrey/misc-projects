import React from "react";
import PostComponent from "./components/PostComponent";
import ToggleMessage from "./components/ToggleMessage";
import EurOrInr from "./components/EurOrInr";
import Notification from "./components/Notification";

const App = () => {
  return (
    
    <div className="min-h-screen bg-amber-900 gap-1">
      <ToggleMessage/>
      <EurOrInr/>
      <Notification/>
      <PostComponent 
      name={'chetan'}
      subtitle={"69 followers"}
      time={"6mins ago"}
      description={"usual guy"}
      />
      <PostComponent
      name={'hulk'}
      subtitle={'enhanced human'}
      
      description={'Hulkuu ree'}

       />
      <PostComponent />
    </div>
  );
};

export default App;