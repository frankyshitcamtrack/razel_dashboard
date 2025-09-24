import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthRouter from './root/autRoot';
import { AuthProvider } from './store/AuthContext';
import { FilterProvider } from './store/GlobalFiltersContext';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FilterProvider>
          <AuthRouter />
        </FilterProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
