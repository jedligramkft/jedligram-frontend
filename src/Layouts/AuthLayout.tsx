import { Outlet } from 'react-router-dom'
import Logo from '../Images/jedligram_logo.png'

const AuthLayout = () => {
	return (
		<main className='min-h-screen bg-linear-to-b from-[#35383d] via-[#2b2f34] to-[#1f2226] poppins-regular'>
			<div className='mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-4 py-16 md:px-12'>
				<div className='mx-auto flex w-full max-w-md items-center px-4'>
					<img src={Logo} alt='Jedligram Logo' className='mx-auto mb-6 w-20 opacity-90 brightness-200' />
				</div>
				<div className='mx-auto flex w-full max-w-md items-center px-4'>
					<Outlet />
				</div>
			</div>
		</main>
	)
}

export default AuthLayout
