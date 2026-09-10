import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getSocket } from '../socket';

const COLUMNS = [
  { id: 'went-well', title: 'Went well' },
  { id: 'improve', title: 'Improve' },
  { id: 'action', title: 'Actions' },
];

function formatTime(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function RetroBoard({ sprint, user, onClose }) {
  const [status, setStatus] = useState('connecting');
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [cards, setCards] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notices, setNotices] = useState([]);
  const [draft, setDraft] = useState('');
  const [typingLabel, setTypingLabel] = useState('');
  const feedRef = useRef(null);
  const typingTimer = useRef(null);
  const remoteTypingTimer = useRef(null);

  const myId = user?.id;

  const cardsByColumn = useMemo(() => {
    const map = { 'went-well': [], improve: [], action: [] };
    for (const card of cards) {
      if (map[card.column]) map[card.column].push(card);
    }
    return map;
  }, [cards]);

  useEffect(() => {
    let active = true;
    let socket;
    let joined = false;

    try {
      socket = getSocket();
    } catch (err) {
      setError(err.message);
      setStatus('error');
      return undefined;
    }

    function pushNotice(text) {
      setNotices((prev) => [...prev.slice(-8), { id: `${Date.now()}-${Math.random()}`, text }]);
    }

    function doJoin() {
      if (!active || joined) return;
      joined = true;
      setStatus('joining');
      socket.emit('retro:join', { sprintId: sprint.id }, (res) => {
        if (!active) return;
        if (!res || res.error) {
          joined = false;
          setError(res?.error || 'Could not join room');
          setStatus('error');
          return;
        }
        setUsers(res.users || []);
        setCards(res.cards || []);
        setMessages(res.history || []);
        setStatus('live');
        setError(null);
      });
    }

    function onConnect() {
      joined = false;
      doJoin();
    }

    function onConnectError(err) {
      if (!active) return;
      setError(err.message || 'Socket connection failed');
      setStatus('error');
    }

    function onPresence(payload) {
      setUsers(payload.users || []);
    }

    function onJoined(payload) {
      setUsers(payload.users || []);
      if (payload.user?.email) {
        pushNotice(`${payload.user.email} joined the retro`);
      }
    }

    function onLeft(payload) {
      setUsers(payload.users || []);
      if (payload.user?.email) {
        pushNotice(`${payload.user.email} left`);
      }
    }

    function onMessage(message) {
      setMessages((prev) => [...prev, message]);
    }

    function onVotes(payload) {
      setCards(payload.cards || []);
    }

    function onTyping(payload) {
      if (!payload?.email || payload.email === user?.email) return;
      if (payload.isTyping) {
        setTypingLabel(`${payload.email} is typing…`);
        clearTimeout(remoteTypingTimer.current);
        remoteTypingTimer.current = setTimeout(() => setTypingLabel(''), 1600);
      } else {
        setTypingLabel('');
      }
    }

    socket.on('connect', onConnect);
    socket.on('connect_error', onConnectError);
    socket.on('retro:presence', onPresence);
    socket.on('user:joined', onJoined);
    socket.on('user:left', onLeft);
    socket.on('retro:message', onMessage);
    socket.on('retro:votes', onVotes);
    socket.on('retro:typing', onTyping);

    if (socket.connected) onConnect();
    else socket.connect();

    return () => {
      active = false;
      clearTimeout(typingTimer.current);
      clearTimeout(remoteTypingTimer.current);
      socket.off('connect', onConnect);
      socket.off('connect_error', onConnectError);
      socket.off('retro:presence', onPresence);
      socket.off('user:joined', onJoined);
      socket.off('user:left', onLeft);
      socket.off('retro:message', onMessage);
      socket.off('retro:votes', onVotes);
      socket.off('retro:typing', onTyping);
      socket.emit('retro:leave');
    };
  }, [sprint.id, user?.email]);

  useEffect(() => {
    const el = feedRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, notices]);

  function sendTyping(isTyping) {
    try {
      const socket = getSocket();
      socket.emit('retro:typing', { isTyping });
    } catch {
      /* ignore */
    }
  }

  function onDraftChange(e) {
    setDraft(e.target.value);
    sendTyping(true);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => sendTyping(false), 900);
  }

  function onSend(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const socket = getSocket();
    socket.emit('retro:message', { text }, (res) => {
      if (res?.error) setError(res.error);
    });
    setDraft('');
    sendTyping(false);
  }

  function onVote(cardId) {
    const socket = getSocket();
    socket.emit('retro:vote', { cardId }, (res) => {
      if (res?.error) setError(res.error);
    });
  }

  return createPortal(
    <div className="retro-shell" role="dialog" aria-modal="true" aria-labelledby="retro-title">
      <div className="retro-panel">
        <header className="retro-head">
          <div>
            <p className="retro-kicker">Live retrospective · room retro:{sprint.id}</p>
            <h2 id="retro-title">{sprint.name}</h2>
            <p className="retro-sub">{sprint.goal}</p>
          </div>
          <div className="retro-head-actions">
            <span className={`retro-live retro-live--${status}`}>
              {status === 'live' ? 'Live' : status}
            </span>
            <button type="button" className="btn btn-quiet" onClick={onClose}>
              Close
            </button>
          </div>
        </header>

        {error && (
          <p className="banner banner--error retro-banner" role="alert">
            {error}
          </p>
        )}

        <div className="retro-grid">
          <section className="retro-board" aria-label="Dot voting board">
            <div className="retro-presence">
              <p className="retro-section-label">In room</p>
              <ul>
                {users.map((u) => (
                  <li key={u.socketId}>
                    <span className="retro-dot" aria-hidden="true" />
                    {u.email}
                    <em>{u.role}</em>
                  </li>
                ))}
                {users.length === 0 && <li className="retro-muted">Waiting for people…</li>}
              </ul>
            </div>

            <div className="retro-columns">
              {COLUMNS.map((col) => (
                <div key={col.id} className="retro-col">
                  <h3>{col.title}</h3>
                  <ul>
                    {(cardsByColumn[col.id] || []).map((card) => {
                      const mine = card.voterIds?.includes(myId);
                      return (
                        <li key={card.id} className={`retro-card${mine ? ' is-voted' : ''}`}>
                          <p>{card.text}</p>
                          <button
                            type="button"
                            className="retro-vote"
                            onClick={() => onVote(card.id)}
                            aria-pressed={Boolean(mine)}
                          >
                            <span aria-hidden="true">+</span>
                            {card.votes || 0}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="retro-chat" aria-label="Retro chat">
            <p className="retro-section-label">Room chat</p>
            <div className="retro-feed" ref={feedRef}>
              {notices.map((n) => (
                <p key={n.id} className="retro-notice">
                  {n.text}
                </p>
              ))}
              {messages.map((m) => (
                <article
                  key={m.id}
                  className={`retro-msg${m.userId === myId ? ' is-mine' : ''}`}
                >
                  <header>
                    <strong>{m.email}</strong>
                    <time>{formatTime(m.createdAt)}</time>
                  </header>
                  <p>{m.text}</p>
                </article>
              ))}
              {messages.length === 0 && notices.length === 0 && (
                <p className="retro-muted">Say what worked and what to change.</p>
              )}
            </div>
            <p className="retro-typing" aria-live="polite">
              {typingLabel || '\u00a0'}
            </p>
            <form className="retro-compose" onSubmit={onSend}>
              <input
                value={draft}
                onChange={onDraftChange}
                placeholder="Message the room"
                maxLength={1000}
                disabled={status !== 'live'}
              />
              <button type="submit" className="btn btn-main" disabled={status !== 'live'}>
                Send
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>,
    document.body,
  );
}
