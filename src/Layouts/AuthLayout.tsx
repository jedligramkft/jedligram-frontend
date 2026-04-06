import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Logo from '/Images/jedligram_logo.png'

const AuthLayout = () => {
	const { t } = useTranslation()

	return (
		<main className='min-h-screen bg-linear-to-b from-[#35383d] via-[#2b2f34] to-[#1f2226] poppins-regular'>
			<div className='absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_55%)]' />
      		<div className='absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.16),transparent_40%)]' />
      		<div className='absolute inset-0 bg-black/30' />
			<div className='mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-4 py-16 md:px-12'>
				<div className='mx-auto flex w-full max-w-md items-center px-4'>
					<img src={Logo} alt={t("common.brand_logo_alt")} className='mx-auto mb-6 w-20 opacity-90 brightness-200' />
				</div>
				<div className='mx-auto flex w-full max-w-md items-center px-4'>
					<Outlet />
				</div>
			</div>
		</main>
	)
}

export default AuthLayout
