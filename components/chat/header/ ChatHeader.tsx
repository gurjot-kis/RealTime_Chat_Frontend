import React from 'react'
import UserStatus from './UserStatus';
import HeaderActions from './HeaderActions';

const ACTIVE_CHAT_USER = {
  name: 'Design Team',
  status: 'Typing...',
  isOnline: true,
  avatar: 'D'
};

const  ChatHeader = () => {
  return (
<header className="flex items-center justify-between px-4 h-16 bg-white border-b border-gray-100 dark:bg-gray-900 dark:border-gray-800 transition-colors duration-200 w-full shrink-0">
      <UserStatus user={ACTIVE_CHAT_USER} />
      <HeaderActions />
    </header>  )
}

export default  ChatHeader