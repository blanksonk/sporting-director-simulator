import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import { getAnonUserId } from '../lib/identity.js';

const MAX_LENGTH = 280;

function timeAgo(iso) {
  try {
    const diff = (Date.now() - new Date(iso)) / 1000;
    if (diff < 60)  return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch { return ''; }
}

export default function Comments({ username }) {
  const [comments, setComments]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [text, setText]           = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState(null);

  async function fetchComments() {
    const { data, error } = await supabase
      .from('comments')
      .select('id, username, body, created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    if (!error) setComments(data ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchComments(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const body = text.trim();
    if (!body || !username) return;
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.from('comments').insert({
      username,
      body,
      anon_user_id: getAnonUserId(),
    });
    if (error) {
      setError('Failed to post. Try again.');
    } else {
      setText('');
      await fetchComments();
    }
    setSubmitting(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-black text-white uppercase tracking-widest">Comments</span>
        {!loading && <span className="text-xs text-gray-600">({comments.length})</span>}
      </div>

      {/* Compose */}
      {username ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="relative">
            <textarea
              value={text}
              onChange={e => setText(e.target.value.slice(0, MAX_LENGTH))}
              placeholder="Talk your talk..."
              rows={2}
              className="w-full bg-gray-900/60 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 resize-none focus:outline-none focus:border-gray-500 transition-colors"
            />
            <span className="absolute bottom-2 right-3 text-[10px] text-gray-700">
              {text.length}/{MAX_LENGTH}
            </span>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white"
            >
              {submitting ? 'Posting…' : 'Post'}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-xs text-gray-600 italic">Play a season to unlock comments.</p>
      )}

      {/* Feed */}
      {loading ? (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 rounded-full animate-spin border-gray-700 border-t-emerald-500" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-gray-600 text-center py-6">No comments yet. Be the first.</p>
      ) : (
        <div className="space-y-2">
          {comments.map(c => (
            <div key={c.id} className="bg-gray-900/40 border border-gray-800/60 rounded-xl px-4 py-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white">{c.username}</span>
                <span className="text-[10px] text-gray-600">{timeAgo(c.created_at)}</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
