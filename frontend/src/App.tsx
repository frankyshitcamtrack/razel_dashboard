import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthRouter from './root/autRoot';
import { AuthProvider } from './store/AuthContext';
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
        <AuthRouter />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
