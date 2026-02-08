import { useState } from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
    <nav className='bg-linear-to-r from-[#1a1d23] to-[#2a2d31] backdrop-blur-md border-b border-gray-700 text-white shadow-lg sticky top-0 z-50 poppins-regular'>
      <div className='sm:px-6 md:px-12 py-4 flex items-center justify-between'>
        <button>
          <Link to='/'>
            <img src="src/Images/jedligram_logo.png" alt="Jedligram logo" className='md:ml-0 ml-4 h-12 w-12 opacity-90 brightness-200' loading='lazy' />
          </Link>
        </button>
        {/* <h1 className='md:px-0 px-6 text-3xl font-black bg-linear-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent'>Jedligram</h1> */}

        <div className='hidden md:flex items-center space-x-4'>
          <a href="#" className='text-gray-300 hover:text-white transition font-medium'>Közösség</a>
          <a href="#" className='text-gray-300 hover:text-white transition font-medium'>Játékok</a>
          <Link to='/profile' className='text-gray-300 hover:text-white transition font-medium'>Profil</Link>
          <Link to='/auth/login' className='bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-6 py-2 rounded-lg font-semibold transition shadow-md'>Bejelentkezés</Link>
        </div>

        <button type='button' className='md:px-0 px-6 md:hidden inline-flex items-center justify-center rounded-lg p-2 text-gray-200 hover:text-white hover:bg-white/10 transition' aria-label='Menü' aria-expanded={isOpen} onClick={() => setIsOpen((prev) => !prev)}>
          <svg className='h-6 w-6' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <path d='M3 6h18' />
            <path d='M3 12h18' />
            <path d='M3 18h18' />
          </svg>
        </button>
      </div>

      <div className={`sticky md:hidden overflow-hidden transition-[max-height,opacity] duration-700 ease-in-out ${ isOpen ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0' }`}>
        <div className='px-6 pb-4 flex flex-col gap-3'>
          <a href="#" className='text-left text-gray-300 hover:text-white transition font-medium'>Közösség</a>
          <a href="#" className='text-left text-gray-300 hover:text-white transition font-medium'>Játékok</a>
          <Link to='/profile' className='text-left text-gray-300 hover:text-white transition font-medium'>Profil</Link>
          <Link to='/auth/login' className='bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-4 py-2 rounded-lg font-semibold transition shadow-md text-left'>Bejelentkezés</Link>
        </div>
      </div>
    </nav>
    </>
  )
}

export default Navbar