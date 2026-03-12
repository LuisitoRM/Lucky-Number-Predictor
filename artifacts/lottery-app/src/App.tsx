import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import PredictionPage from "@/pages/Prediction";
import HistoryPage from "@/pages/History";
import FrequenciesPage from "@/pages/Frequencies";
import AdminPage from "@/pages/Admin";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/admin" component={AdminPage} />
        
        {/* Dynamic Routes for each lottery */}
        <Route path="/:tipo/prediccion">
          {(params) => {
            const valid = ['baloto', 'revancha', 'powerball'].includes(params.tipo);
            return valid ? <PredictionPage tipo={params.tipo} /> : <Redirect to="/" />;
          }}
        </Route>
        
        <Route path="/:tipo/historial">
          {(params) => {
            const valid = ['baloto', 'revancha', 'powerball'].includes(params.tipo);
            return valid ? <HistoryPage tipo={params.tipo} /> : <Redirect to="/" />;
          }}
        </Route>

        <Route path="/:tipo/frecuencias">
          {(params) => {
            const valid = ['baloto', 'revancha', 'powerball'].includes(params.tipo);
            return valid ? <FrequenciesPage tipo={params.tipo} /> : <Redirect to="/" />;
          }}
        </Route>

        <Route>
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <h2 className="text-2xl font-bold text-white mb-2">404 - Página no encontrada</h2>
            <p className="text-muted-foreground">La ruta que buscas no existe en el sistema.</p>
          </div>
        </Route>
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
