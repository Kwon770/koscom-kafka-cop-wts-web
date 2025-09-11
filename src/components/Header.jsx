import React from 'react'
import koscomLogo from '../assets/logo_koscom.svg'

const Header = () => {
  return (
    <header className="bg-[#ED6D21] px-4 py-4 mb-2">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img src={koscomLogo} alt="KOSCOM 로고" className="h-5 w-auto relative" style={{ top: '-2px' }} />
        </div>
        
        {/* Navigation */}
        <nav className="flex items-center space-x-6">
          <a href="#" className="text-white opacity-100 font-bold">거래소</a>
          <a href="#" className="text-white opacity-60 hover:opacity-100 font-bold">투자정보</a>
          <a href="#" className="text-white opacity-60 hover:opacity-100 font-bold">고객센터</a>
        </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* User Actions */}
          <div className="flex items-center space-x-3">
            <button className="text-white text-sm ">
              로그인
            </button>
            <button className="text-white text-sm">
              회원가입
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header