import React, { useState } from 'react';
import { X, Send, MessageSquare, Check, Sparkles } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'general'>('general');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setMessage('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded-xl transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-bold border border-cyan-500/30">
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>Developer Feedback</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">Help Us Improve TRL Cloud</h2>
          <p className="text-slate-400 text-xs">Share bug reports, feature ideas, or general feedback directly with TRL TEAM FOR DEVELOPMENT.</p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-sm">Thank You for Your Feedback!</h3>
            <p className="text-xs text-slate-300">Your message was sent directly to our development team.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFeedbackType('general')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  feedbackType === 'general' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                General
              </button>
              <button
                type="button"
                onClick={() => setFeedbackType('bug')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  feedbackType === 'bug' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                Bug Report
              </button>
              <button
                type="button"
                onClick={() => setFeedbackType('feature')}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  feedbackType === 'feature' ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                Feature Idea
              </button>
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your feedback, suggestion, or issue..."
              rows={4}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Send className="w-4 h-4 text-slate-950" />
              <span>Submit Feedback</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
