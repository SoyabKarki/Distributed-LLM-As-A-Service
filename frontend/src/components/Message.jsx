function Message({ role, content, isLoading }) {
    return (
        <div className={`message ${role}`}>
            <div className="message-avatar">
                {role === 'user' ? 'U' : 'AI'}
            </div>
            <div className="message-content">
                {isLoading ? <span className="loading-dots">Thinking...</span> : content}
            </div>
        </div>
    )
}

export default Message;