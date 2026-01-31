import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const useStore = create((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,
  tasks: {},

  fetchProjects: async () => {
    set({ isLoading: true });
    try {
      const res = await axios.get(`${API_URL}/projects`);
      set({ projects: res.data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  runProject: async (projectName) => {
    try {
      const res = await axios.post(`${API_URL}/run/${projectName}`);
      const taskId = res.data.task_id;
      
      set((state) => ({
        tasks: { ...state.tasks, [taskId]: { status: 'pending', project: projectName } }
      }));
      
      // Start polling
      get().pollTask(taskId);
    } catch (err) {
      console.error(err);
    }
  },

  pollTask: (taskId) => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_URL}/status/${taskId}`);
        const status = res.data.status;
        
        set((state) => ({
          tasks: { ...state.tasks, [taskId]: { ...state.tasks[taskId], status } }
        }));

        if (status === 'success' || status === 'error') {
          clearInterval(interval);
          get().fetchProjects(); // Refresh list on completion
        }
      } catch (err) {
        clearInterval(interval);
      }
    }, 1000);
  },

  downloadRepo: async (url) => {
    set({ isLoading: true });
    try {
      await axios.post(`${API_URL}/download`, { url });
      // We could track this task ID too, but let's just refresh for now
      setTimeout(() => get().fetchProjects(), 5000);
      set({ isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  }
}));
