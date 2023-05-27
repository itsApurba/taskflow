import {Routes, Route} from 'react-router-dom'
import HomePage from '../pages/HomePage'
import CreateTask from '../components/CreateTask'



const AllRoutes = () => {
  return (
      <Routes>
        <Route path='/' element={<HomePage/>} />
        <Route path='/dashboard' element={<HomePage/>} />
        <Route path='/task/:id' element={<CreateTask/>} />
      </Routes>
    )
}

export default AllRoutes