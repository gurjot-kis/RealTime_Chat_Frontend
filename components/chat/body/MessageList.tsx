// components/chat/body/MessageList.tsx
import React from 'react';
import MessageBubble from './MessageBubble';
import DateDivider from './DateDivider';

// Dummy data for visualization
const DUMMY_MESSAGES = [
  { type: 'divider', date: 'Yesterday' },
  { type: 'message', data: { id: 'm1', text: 'Hey team, how is the new design coming along?', time: '10:30 AM', isOwn: true, status: 'seen' as const } },
  { type: 'message', data: { id: 'm2', text: 'Almost done! Just finishing up the dark mode colors.', time: '10:35 AM', isOwn: false } },
  { type: 'divider', date: 'Today' },
  { type: 'message', data: { id: 'm3', text: 'Great. Let me know when the assets are ready so I can integrate them.', time: '10:40 AM', isOwn: true, status: 'delivered' as const } },
  { type: 'message', data: { id: 'm4', text: 'Will do. I should have them ready by noon.', time: '10:42 AM', isOwn: false } },
];

const MessageList = () => {
  return (
    <div className="flex flex-col w-full">
      {DUMMY_MESSAGES.map((item, index) => {
        if (item.type === 'divider') {
          return <DateDivider key={`divider-${index}`} date={item.date!} />;
        }
        return <MessageBubble key={item.data!.id} message={item.data!} />;
      })}
    </div>
  );
};

export default MessageList;