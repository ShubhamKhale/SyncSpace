import React from 'react'
import AppLogo from '../icons/AppLogo'

const Navbar = () => {
  return (
    <div className='px-6 py-4 flex items-center justify-between text-white'>
        <div className='inline-flex items-center space-x-4'>
            <p className='text-white text-lg font-bold'>SyncSpace</p>
            <AppLogo width={60} height={42} fill='#ffffff' />
        </div>
        <div className='inline-flex items-center text-xs font-medium space-x-12'>
            <p className='hover:cursor-pointer'>Home</p>
            <p className='hover:cursor-pointer'>Features</p>
            <p className='hover:cursor-pointer'>Pricing</p>
            <p className='px-4 py-2 border-2 border-[#D1D5DB] rounded-md hover:cursor-pointer'>Sign In</p>
        </div>
    </div>
  )
}

export default Navbar