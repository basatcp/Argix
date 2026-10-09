import { Header } from './components/Header';
import { ConsultationProvider } from './components/consultation/ConsultationModal';
import { PageView } from './components/layout/PageView';
import { RouterProvider } from './router';

export default function App() {
  return (
    <RouterProvider>
      <ConsultationProvider>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        <Header />
        <PageView />
      </ConsultationProvider>
    </RouterProvider>
  );
}
