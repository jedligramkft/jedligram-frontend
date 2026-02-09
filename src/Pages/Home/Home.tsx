import Communities from '../../Components/Communities'
import Hero from '../../Components/Hero'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <>
        <Hero />
        <Communities />

        <Link to="/user/123" style={{ display: 'block', margin: '20px', textAlign: 'center' }}>
          View User 123 Profile
        </Link>
        <Link to="/user/456" style={{ display: 'block', margin: '20px', textAlign: 'center' }}>
          View User 456 Profile
        </Link>

        {/* <Android /> */}
    </>
  )
}

export default Home