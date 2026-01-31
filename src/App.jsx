import React, { useEffect, useState } from 'react';
import { useStore } from './store';
import { Activity, Archive, RefreshCw, Share2, Github, Folder } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

function App() {
    const { projects, fetchProjects, isLoading, runProject, tasks } = useStore();
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchProjects();
        const interval = setInterval(fetchProjects, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [fetchProjects]);

    return (
        <div className="min-h-screen bg-[#050510] text-white font-sans selection:bg-cyan-500 selection:text-black">
            {/* Dynamic Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[100px] animate-pulse delay-1000" />
            </div>

            {/* Navbar */}
            <nav className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Activity className="text-cyan-400 w-6 h-6" />
                        <h1 className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                            LocalManager <span className="text-xs text-cyan-400 font-mono border border-cyan-400/30 px-2 py-0.5 rounded-full">v4.0 PRO</span>
                        </h1>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => fetchProjects()} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <RefreshCw className={clsx("w-5 h-5 text-gray-400", isLoading && "animate-spin text-cyan-400")} />
                        </button>
                        <div className="h-8 w-[1px] bg-white/10" />
                        <button className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all shadow-lg shadow-cyan-900/20">
                            <Github className="w-4 h-4" />
                            <span>Connect GitHub</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <StatCard label="Total Projects" value={projects.length} trend="+2 this week" color="cyan" />
                    <StatCard label="Active Syncs" value={projects.filter(p => p.status === 'syncing').length} trend="Real-time" color="emerald" />
                    <StatCard label="Viral Score" value="98.4" trend="Top 1%" color="purple" />
                </div>

                {/* Filters & Actions */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                        {['all', 'synced', 'error'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={clsx(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize",
                                    filter === f ? "bg-white/10 text-white shadow-sm" : "text-gray-400 hover:text-white"
                                )}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center gap-2 bg-purple-600/20 border border-purple-500/30 px-4 py-2 rounded-lg text-purple-300 hover:bg-purple-600/30 transition-all">
                        <Archive className="w-4 h-4" />
                        Archive All
                    </button>
                </div>

                {/* Project Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.filter(p => filter === 'all' || p.status === filter).map((project) => (
                        <ProjectCard key={project.name} project={project} onRun={() => runProject(project.name)} task={Object.values(tasks).find(t => t.project === project.name)} />
                    ))}

                    {/* Empty State */}
                    {projects.length === 0 && !isLoading && (
                        <div className="col-span-full py-20 text-center text-gray-500 border-2 border-dashed border-white/5 rounded-3xl">
                            <Folder className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p className="text-xl">No projects found locally.</p>
                            <p className="text-sm mt-2">Add folders to <code className="bg-white/10 px-2 py-0.5 rounded text-gray-300">/projects</code> to start.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function StatCard({ label, value, trend, color }) {
    const colors = {
        cyan: "from-cyan-500/20 to-blue-500/5 border-cyan-500/30 text-cyan-400",
        emerald: "from-emerald-500/20 to-green-500/5 border-emerald-500/30 text-emerald-400",
        purple: "from-purple-500/20 to-pink-500/5 border-purple-500/30 text-purple-400",
    }[color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br ${colors} p-6 rounded-2xl border backdrop-blur-sm`}
        >
            <h3 className="text-gray-400 text-sm font-medium mb-1">{label}</h3>
            <div className="flex items-end justify-between">
                <span className="text-4xl font-bold text-white">{value}</span>
                <span className={`text-xs px-2 py-1 rounded-full bg-white/10 ${colors.split(" ").pop()}`}>{trend}</span>
            </div>
        </motion.div>
    );
}

function ProjectCard({ project, onRun, task }) {
    const isSyncing = task?.status === 'pending' || project.status === 'syncing';

    return (
        <motion.div
            layout
            className="group relative bg-[#0a0a16] border border-white/5 hover:border-cyan-500/30 p-5 rounded-2xl transition-all hover:shadow-2xl hover:shadow-cyan-900/10 overflow-hidden"
        >
            {/* Glitch/Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                    <h3 className="text-lg font-bold text-gray-100 group-hover:text-cyan-400 transition-colors">{project.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 font-mono truncate max-w-[200px]">{project.path}</p>
                </div>
                <StatusBadge status={isSyncing ? 'syncing' : project.status} />
            </div>

            {isSyncing && (
                <div className="mb-4 space-y-2">
                    <div className="flex justify-between text-xs text-cyan-400">
                        <span>AI Enhancement</span>
                        <span>Processing...</span>
                    </div>
                    <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400 w-1/2 animate-loading-bar" />
                    </div>
                </div>
            )}

            <div className="flex items-center gap-3 relative z-10 mt-4">
                <button
                    onClick={onRun}
                    disabled={isSyncing}
                    className="flex-1 bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-400 border border-white/10 hover:border-cyan-500/50 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                >
                    {isSyncing ? 'Syncing...' : 'Run Auto-Sync'}
                </button>
                <button className="p-2 bg-white/5 hover:bg-purple-500/20 hover:text-purple-400 border border-white/10 rounded-lg transition-all" title="Share Preview">
                    <Share2 className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        ready: "bg-gray-500/10 text-gray-400 border-gray-500/20",
        synced: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        syncing: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 animate-pulse",
        error: "bg-red-500/10 text-red-400 border-red-500/20",
    };

    return (
        <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider border ${styles[status] || styles.ready}`}>
            {status}
        </span>
    );
}

export default App;
