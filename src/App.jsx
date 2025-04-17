
import { BrowserRouter } from 'react-router-dom'
import AppRouters from "./routes/Routes"

function App() {


  return (
    <>
      {/* <UploadNFT></UploadNFT> */}
      <BrowserRouter>
      <AppRouters></AppRouters>
      </BrowserRouter>
      
    </>
  )
}

export default App
