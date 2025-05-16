import { create } from 'zustand';

interface SidebarState {
    state: 'expanded' | 'collapsed';
    toggle: () => void;
}

export const useSidebar = create<SidebarState>((set) => ({
    state: 'expanded',
    toggle: () => set((state) => ({
        state: state.state === 'expanded' ? 'collapsed' : 'expanded'
    })),
})); 