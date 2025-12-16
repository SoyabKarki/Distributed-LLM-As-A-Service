import { useEffect, useRef } from 'react';

function MessageList({ children }) {
    const bottomRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [children]);

    return (
        <div className="message-list">
            {children}
            <div ref={bottomRef} />
        </div>
    );
}

export default MessageList;