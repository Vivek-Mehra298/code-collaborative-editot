'use client';

import { useEffect, useState, useRef, use } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Editor, { useMonaco } from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', compiler: 'nodejs-20.17.0' },
  { id: 'typescript', name: 'TypeScript', compiler: 'typescript-5.6.2' },
  { id: 'python', name: 'Python', compiler: 'cpython-3.14.0' },
  { id: 'java', name: 'Java', compiler: 'openjdk-jdk-22+36' },
  { id: 'cpp', name: 'C++', compiler: 'gcc-13.2.0' },
  { id: 'go', name: 'Go', compiler: 'go-1.23.2' },
  { id: 'rust', name: 'Rust', compiler: 'rust-1.82.0' },
  { id: 'php', name: 'PHP', compiler: 'php-8.3.12' },
];

const COLORS = ['#00d4ff', '#7c3aed', '#ff0055', '#00ffaa', '#ffaa00'];

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const unwrappedParams = use(params);
  const roomId = unwrappedParams.roomId;
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [status, setStatus] = useState('Connecting...');
  
  // Execution state
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  
  const monaco = useMonaco();
  const editorRef = useRef<any>(null);
  const cursorsRef = useRef<Record<string, string[]>>({});
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');
    setSocket(s);

    s.on('connect', () => {
      setStatus('Connected');
      s.emit('join-room', { roomId, userId: user.id, username: user.name });
    });

    s.on('disconnect', () => setStatus('Reconnecting...'));

    s.on('room-joined', (data) => {
      setCode(data.currentCode || '');
      setLanguage(data.language || 'javascript');
      setParticipants(data.participants);
    });

    s.on('user-joined', (data) => {
      setParticipants((prev) => {
        if (prev.find((p) => p._id === data.userId || p.id === data.userId)) return prev;
        return [...prev, { _id: data.userId, name: data.username }];
      });
    });

    s.on('user-left', (data) => {
      setParticipants((prev) => prev.filter((p) => (p._id || p.id) !== data.userId));
    });

    s.on('code-updated', (data) => {
      setCode(data.code);
      if (editorRef.current && monaco && data.cursorPosition) {
        const { lineNumber, column } = data.cursorPosition;
        const color = COLORS[Math.abs(data.changedBy.hashCode?.() ?? 0) % COLORS.length];

        const newDecorations = [
          {
            range: new monaco.Range(lineNumber, column, lineNumber, column),
            options: { className: 'remote-cursor', hoverMessage: { value: 'Peer User' } }
          }
        ];
        cursorsRef.current[data.changedBy] = editorRef.current.deltaDecorations(cursorsRef.current[data.changedBy] || [], newDecorations);
      }
    });

    s.on('language-updated', (data) => {
      setLanguage(data.language);
    });

    return () => {
      s.emit('leave-room', { roomId, userId: user.id });
      s.disconnect();
    };
  }, [user, roomId, monaco]);

  const handleCodeChange = (newCode: string | undefined) => {
    if (newCode === undefined) return;
    setCode(newCode);
    if (socket) {
      let cursorPosition = null;
      if (editorRef.current) {
        cursorPosition = editorRef.current.getPosition();
      }
      socket.emit('code-change', { roomId, code: newCode, cursorPosition });
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    setLanguage(lang);
    socket?.emit('language-change', { roomId, language: lang });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const handleEditorDidMount = (editor: any, monacoInstance: any) => {
    editorRef.current = editor;
  };

  const runCode = async () => {
    if (!code.trim()) return;
    setIsExecuting(true);
    setOutput('Executing...');
    
    const langConfig = LANGUAGES.find(l => l.id === language);
    if (!langConfig) {
      setOutput('Language configuration not found.');
      setIsExecuting(false);
      return;
    }

    try {
      const response = await axios.post('https://wandbox.org/api/compile.json', {
        compiler: langConfig.compiler,
        code: code
      });

      const { program_message, program_error, compiler_error } = response.data;
      let out = '';
      if (compiler_error) {
        out += 'Compiler Error:\n' + compiler_error + '\n';
      }
      if (program_error) {
        out += 'Error:\n' + program_error + '\n';
      }
      if (program_message) {
        out += program_message;
      }
      
      setOutput(out || 'Execution finished successfully (No output).');
    } catch (err: any) {
      setOutput('Error executing code: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsExecuting(false);
    }
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .remote-cursor { border-left: 2px solid var(--violet-accent); }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  if (loading || !user) return <div className="min-h-screen bg-[var(--bg-dark)]" />;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[var(--bg-dark)] text-white p-2 md:p-4 gap-4 overflow-y-auto md:overflow-hidden">
      {/* LEFT SIDEBAR */}
      <div className="w-full md:w-80 h-auto md:h-full glass-panel rounded-xl flex flex-col pt-4 border-[rgba(255,255,255,0.05)] shadow-xl relative z-10 shrink-0">
        <div className="px-4 md:px-6 pb-4 md:pb-6 border-b border-gray-800 flex md:flex-col justify-between items-center md:items-start">
          <h1 
            onClick={() => router.push('/')}
            className="text-xl md:text-2xl font-space-grotesk text-white font-bold cursor-pointer mb-0 md:mb-6 text-gradient inline-block"
          >
            DevSync
          </h1>
          
          <div className="bg-gray-900/50 p-2 md:p-4 rounded-lg border border-gray-800 relative overflow-hidden group ml-4 md:ml-0 flex-1 md:flex-none">
            <p className="text-[10px] md:text-xs text-gray-500 font-jetbrains-mono mb-1 uppercase tracking-wider hidden md:block">Room ID</p>
            <div className="flex justify-between items-center">
               <p className="text-lg md:text-xl font-bold font-jetbrains-mono tracking-widest">{roomId}</p>
               <button 
                 onClick={handleCopyLink}
                 className="md:absolute md:top-1/2 md:-translate-y-1/2 md:right-4 text-xs bg-[var(--cyan-accent)] text-black px-2 md:px-3 py-1 md:py-1.5 rounded font-bold md:opacity-0 md:group-hover:opacity-100 transition-opacity ml-4"
               >
                 Copy Link
               </button>
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-1 overflow-y-auto px-6 py-6 flex-col">
          <h3 className="text-sm text-gray-500 font-jetbrains-mono mb-4 uppercase tracking-wider">Participants</h3>
          <AnimatePresence>
            {participants.map((p, index) => (
              <motion.div 
                key={p._id || p.id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3 mb-4"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--cyan-accent)] to-[var(--violet-accent)] flex items-center justify-center text-white font-bold uppercase text-lg shadow-[0_0_10px_var(--violet-accent)]">
                    {p.name?.charAt(0) || '?'}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--bg-dark)]" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--bg-dark)] animate-ping opacity-75" />
                </div>
                <span className="font-inter font-medium text-gray-200">{p.name || 'Anonymous'} {p._id === user.id ? '(You)' : ''}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* MAIN EDITOR AREA */}
      <div className="flex-1 flex flex-col min-w-0 min-h-[70vh] md:min-h-0">
        <div className="glass-panel w-full mb-4 px-4 md:px-6 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 z-10 border-[rgba(255,255,255,0.05)] rounded-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-xs text-gray-500 font-jetbrains-mono uppercase tracking-widest hidden md:inline">Lang:</span>
              <select 
                className="bg-transparent text-white font-jetbrains-mono border border-gray-700 rounded px-2 py-1 outline-none focus:border-[var(--cyan-accent)] w-full sm:w-auto"
                value={language}
                onChange={handleLanguageChange}
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.id} value={lang.id} className="bg-gray-900 text-white">{lang.name}</option>
                ))}
              </select>
            </div>
            
            <div className="md:hidden flex items-center gap-2 text-xs font-jetbrains-mono text-gray-400 mt-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {participants.length} Participant(s) Online
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2 bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-800">
              <span className={`w-2 h-2 rounded-full ${status === 'Connected' ? 'bg-[var(--cyan-accent)] animate-pulse shadow-[0_0_8px_var(--cyan-accent)]' : 'bg-red-500'}`} />
              <span className="text-xs font-jetbrains-mono text-gray-400 hidden sm:inline">{status}</span>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={runCode}
              disabled={isExecuting}
              className="px-4 md:px-6 py-2 bg-[var(--violet-accent)] text-white text-sm md:text-base font-bold rounded shadow-[0_0_15px_rgba(124,58,237,0.4)] hover:shadow-[0_0_20px_rgba(124,58,237,0.7)] disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
            >
              {isExecuting ? 'Running...' : '▶ Run Code'}
            </motion.button>
          </div>
        </div>

        {/* Editor and Output vertical split */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden mb-4 md:mb-0">
          <div className="flex-[2] glass-panel rounded-xl overflow-hidden border border-[rgba(255,255,255,0.05)] shadow-2xl relative min-h-[300px]">
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language}
              theme="vs-dark"
              value={code}
              onChange={handleCodeChange}
              onMount={handleEditorDidMount}
              options={{
                fontFamily: 'var(--font-jetbrains-mono)',
                fontSize: 14,
                minimap: { enabled: false },
                padding: { top: 20 },
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
                wordWrap: 'on'
              }}
            />
          </div>

          <div className="flex-1 min-h-[200px] glass-panel rounded-xl flex flex-col border border-[rgba(255,255,255,0.05)] shadow-2xl bg-black/40 shrink-0">
            <div className="px-4 py-2 border-b border-gray-800 flex justify-between items-center bg-gray-900/30">
              <span className="text-xs font-jetbrains-mono text-gray-400 uppercase tracking-widest">Console Output</span>
              <button 
                onClick={() => setOutput('')}
                className="text-xs text-gray-500 hover:text-white"
              >
                Clear
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto font-jetbrains-mono text-xs md:text-sm whitespace-pre-wrap">
              {output ? (
                output.includes('Error') || output.match(/[a-z]+Error:/) ? (
                  <span className="text-red-400">{output}</span>
                ) : (
                  <span className="text-gray-300">{output}</span>
                )
              ) : (
                <span className="text-gray-600 italic">Click "Run Code" to see output here...</span>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
